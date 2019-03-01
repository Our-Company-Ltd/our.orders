using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using Microsoft.AspNetCore.JsonPatch;
using MongoDB.Driver;
using Newtonsoft.Json;
using our.orders.Controllers;
using our.orders.Dtos;
using our.orders.helpers;
using our.orders.Helpers;
using our.orders.Identity;
using our.orders.Models;
using our.orders.test.Fixtures;
using our.orders.test.Helpers;
using Xunit;
using static our.orders.Controllers.AccountController;

namespace our.orders.test.Controllers
{
    public class AccountControllerShould : IClassFixture<WebHostFixture>
    {
        private readonly WebHostFixture controllerFixture;


        public AccountControllerShould(WebHostFixture controllerFixture)
        {
            this.controllerFixture = controllerFixture;

        }

        protected HttpClient httpClient() => controllerFixture.HttpClient();

        private async Task<ApiModel<AccountDto>> _authenticateAsync(int index)
        {
            var users = this.controllerFixture.GetUsers();
            var user = users.ElementAt(index);
            var password = user.Note;
            var bindings = new AuthenticateBindings { UserName = user.UserName, Password = password };
            var response = await httpClient().PostAsync($"{controllerFixture.PATH}/account/authenticate", new JsonContent(bindings));
            var content = await response.Content.ReadAsStringAsync();

            Assert.True(response.IsSuccessStatusCode, response.ReasonPhrase ?? "");


            var result = JsonConvert.DeserializeObject<ApiModel<AccountDto>>(content);
            return result;
        }

        [Theory]
        [InlineData(0)]
        [InlineData(1)]
        public async Task AuthenticateUsingUserName(int index)
        {
            var result = await _authenticateAsync(index);

            Assert.True(result.Result.Success, result.Result.Errors?.FirstOrDefault().Value?.FirstOrDefault() ?? "");
            Assert.Empty(result.Result.Errors);

            var resultUser = result.Value;

            Assert.NotNull(resultUser);
            Assert.True(resultUser.IsAuthenticated);
            Assert.NotNull(resultUser.Token);
            Assert.NotEqual("", resultUser.Token);
        }

        [Theory]
        [InlineData(0)]
        [InlineData(1)]
        public async Task ReturnCurrentAfterAuthenticateWithToken(int index)
        {
            var authresult = await _authenticateAsync(index);

            var authuser = authresult.Value;

            var requestMessage = new HttpRequestMessage(HttpMethod.Get, $"{controllerFixture.PATH}/account/current");
            requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", authuser.Token);

            var response = await httpClient().SendAsync(requestMessage);
            Assert.True(response.IsSuccessStatusCode, response.ReasonPhrase ?? "");

            var content = await response.Content.ReadAsStringAsync();
            var result = JsonConvert.DeserializeObject<ApiModel<AccountDto>>(content);

            Assert.True(result.Result.Success);
            Assert.Empty(result.Result.Errors);

            var resultUser = result.Value;

            Assert.NotNull(resultUser);
            Assert.True(resultUser.IsAuthenticated);
            Assert.Null(resultUser.Token); // no token for current, the token is sent on refresh and login;
        }

        [Theory]
        [InlineData(0)]
        [InlineData(1)]
        public async Task SendForgetMails(int index)
        {

            var users = this.controllerFixture.GetUsers();
            var user = users.ElementAt(index);

            var bindings = new ForgotPasswordBindings { UserName = user.UserName };

            var authrequest = await httpClient().PostAsync($"{controllerFixture.PATH}/account/forgot", new JsonContent(bindings));
            var authcontent = await authrequest.Content.ReadAsStringAsync();
            var authresult = JsonConvert.DeserializeObject<ApiModel<AccountDto>>(authcontent);
            var authuser = authresult.Value;

            Assert.Null(authuser); // we expect no informations;
            Assert.True(authrequest.IsSuccessStatusCode, authrequest.ReasonPhrase ?? "");

            // emails :
            var recievedEmails = this.controllerFixture.EmailSender.Flush();

            // we expect to have recieved a message : 
            Assert.NotEmpty(recievedEmails);

            var message = recievedEmails.First().message;

            // find the link in the email =
            var regex = new Regex("href=[\"'].*action=(.+)(&[^\"'])?[\"']", RegexOptions.IgnoreCase);

            Assert.Matches(regex, message);

            var encodedlink = regex.Match(message).Groups[1].Value;
            var actionLink = WebUtility.UrlDecode(encodedlink);

            // we expect the message to have a link to the reset page: 
            var resetroute = "account/reset";

            Assert.Matches(new Regex(resetroute, RegexOptions.IgnoreCase), actionLink);
        }

        [Theory]
        [InlineData(0)]
        public async Task ResetsPassword(int index)
        {
            // login with admin
            var authresult = await _authenticateAsync(index);

            var client = httpClient();

            var user = RandomObjects.RandomUser(new string[] { RoleStore.ADMIN }).Generate();
            var oldpassword = $"username-Pa$$w0rd-old";
            // create new user :

            var newUserrequestMessage = new HttpRequestMessage(HttpMethod.Post, $"{controllerFixture.PATH}/user?password={ WebUtility.UrlEncode(oldpassword)}");
            newUserrequestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", authresult.Value.Token);
            newUserrequestMessage.Content = new JsonContent(user);
            var newUserResponse = await client.SendAsync(newUserrequestMessage);

            var newUserContent = await newUserResponse.Content.ReadAsStringAsync();
            var newUserResult = JsonConvert.DeserializeObject<ApiModel<AccountDto>>(newUserContent);

            Assert.True(newUserResponse.IsSuccessStatusCode, newUserResponse.ReasonPhrase ?? "");
            Assert.True(newUserResult.Result.Success, newUserResult.Result.Errors?.FirstOrDefault().Value?.FirstOrDefault() ?? "");
            Assert.Empty(newUserResult.Result.Errors);

            // forgot his email
            var bindings = new ForgotPasswordBindings { UserName = user.UserName };

            var forgotrequest = await client.PostAsync($"{controllerFixture.PATH}/account/forgot", new JsonContent(bindings));

            var forgotcontent = await forgotrequest.Content.ReadAsStringAsync();
            var forgotresult = JsonConvert.DeserializeObject<ApiModel<AccountDto>>(forgotcontent);

            // emails :
            var recievedEmails = this.controllerFixture.EmailSender.Flush();

            var message = recievedEmails.First().message;

            // find the link in the email =
            var regex = new Regex("href=[\"'].*action=(.+)(&[^\"'])?[\"']", RegexOptions.IgnoreCase);
            var encodedlink = regex.Match(message).Groups[1].Value;
            var actionLink = WebUtility.UrlDecode(encodedlink);

            // // finds the action = 
            // var uri = new Uri(actionLink);
            // var action = HttpUtility.ParseQueryString(uri.Query).Get("action");


            var newpassword = $"username-Pa$$w0rd-reset";
            var encodedPassword = WebUtility.UrlEncode(newpassword);

            // request rest 
            var resetrequest = await client.GetAsync($"{actionLink}&password={encodedPassword}");
            var resetcontent = await resetrequest.Content.ReadAsStringAsync();
            var resetresult = JsonConvert.DeserializeObject<ApiModel<AccountDto>>(resetcontent);

            Assert.True(resetrequest.IsSuccessStatusCode, resetrequest.ReasonPhrase ?? "");
            Assert.True(resetresult.Result.Success, resetresult.Result.Errors?.FirstOrDefault().Value?.FirstOrDefault() ?? "");
            Assert.Empty(resetresult.Result.Errors);

            var verifyNewbindings = new AuthenticateBindings { UserName = user.UserName, Password = newpassword };
            var verifyNewresponse = await client.PostAsync($"{controllerFixture.PATH}/account/authenticate", new JsonContent(verifyNewbindings));
            var verifyNewcontent = await verifyNewresponse.Content.ReadAsStringAsync();

            Assert.True(verifyNewresponse.IsSuccessStatusCode, verifyNewresponse.ReasonPhrase ?? "");


            var verifyNewResult = JsonConvert.DeserializeObject<ApiModel<AccountDto>>(verifyNewcontent);

            Assert.True(verifyNewResult.Result.Success, verifyNewResult.Result.Errors?.FirstOrDefault().Value?.FirstOrDefault() ?? "");
            Assert.Empty(verifyNewResult.Result.Errors);

            var resultUser = verifyNewResult.Value;

            Assert.NotNull(resultUser);
            Assert.True(resultUser.IsAuthenticated);
            Assert.NotNull(resultUser.Token);
            Assert.Equal(user.UserName, resultUser.UserName);
            Assert.NotEqual("", resultUser.Token);

            var verifyOldbindings = new AuthenticateBindings { UserName = user.UserName, Password = oldpassword };
            var verifyOldresponse = await client.PostAsync($"{controllerFixture.PATH}/account/authenticate", new JsonContent(verifyOldbindings));
            var verifyOldcontent = await verifyOldresponse.Content.ReadAsStringAsync();

            Assert.True(verifyOldresponse.IsSuccessStatusCode, verifyOldresponse.ReasonPhrase ?? "");


            var verifyOldResult = JsonConvert.DeserializeObject<ApiModel<AccountDto>>(verifyOldcontent);

            Assert.False(verifyOldResult.Result.Success);
            Assert.NotEmpty(verifyOldResult.Result.Errors);

            // var resultOldUser = verifyOldResult.Value;

            // Assert.Null(resultOldUser);
            // Assert.False(resultOldUser.IsAuthenticated);
            // Assert.Null(resultOldUser.Token);
        }

        // [Theory]
        // [InlineData(1)]
        // public async Task AuthenticateUsingEmail(int index)
        // {
        //     var userName = $"username-{index}@email.com";
        //     var password = $"username-{index}-Pa$$w0rd";

        //     var user = new UserDto
        //     {
        //         UserName = userName,
        //         Password = password
        //     };

        //     var response = await httpClient.PostAsync("account/authenticate", new JsonContent(user));
        //     var content = await response.Content.ReadAsStringAsync();

        //     Assert.True(response.IsSuccessStatusCode, response.ReasonPhrase ?? "");


        //     var result = JsonConvert.DeserializeObject<ApiModel<UserDto>>(content);

        //     Assert.True(result.Result.Success);
        //     Assert.Empty(result.Result.Errors);

        //     var resultUser = result.Value;

        //     Assert.NotNull(resultUser);
        //     Assert.True(resultUser.IsAuthenticated);
        //     Assert.NotNull(resultUser.Token);
        //     Assert.NotEqual(resultUser.Token, "");
        // }

    }
}