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
    public class AccountControllerShould : IClassFixture<TestWebApplicationFactory>
    {
        private readonly TestWebApplicationFactory factory;

        public AccountControllerShould(TestWebApplicationFactory factory)
        {
            this.factory = factory;
        }


        private async Task<string> _adminToken(HttpClient client)
        {
            var bindings = new AuthenticateBindings { UserName = "admin-1", Password = "admin-1-Pa$$w0rd" };
            var response = await client.PostAsync($"{TestStartup.PATH}/account/authenticate", new JsonContent(bindings));
            var content = await response.Content.ReadAsStringAsync();

            Assert.True(response.IsSuccessStatusCode, response.ReasonPhrase ?? "");


            var result = JsonConvert.DeserializeObject<ApiModel<AccountDto>>(content);
            return result.Value.Token;

        }
        private async Task<AccountDto> _CreateUser(HttpClient client, User user, string password)
        {

            var newUserrequestMessage = new HttpRequestMessage(HttpMethod.Post, $"{TestStartup.PATH}/user?password={ WebUtility.UrlEncode(password)}");
            newUserrequestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", await _adminToken(client));
            newUserrequestMessage.Content = new JsonContent(user);
            var response = await client.SendAsync(newUserrequestMessage);
            Assert.True(response.IsSuccessStatusCode, response.ReasonPhrase ?? "");

            var newUserContent = await response.Content.ReadAsStringAsync();
            var result = JsonConvert.DeserializeObject<ApiModel<AccountDto>>(newUserContent);
            Assert.True(result.Result.Success);
            return result.Value;
        }
        private async Task<string> _authenticateAsync(HttpClient client, string username, string password)
        {

            var bindings = new AuthenticateBindings { UserName = username, Password = password };
            var response = await client.PostAsync($"{TestStartup.PATH}/account/authenticate", new JsonContent(bindings));
            var content = await response.Content.ReadAsStringAsync();

            Assert.True(response.IsSuccessStatusCode, response.ReasonPhrase ?? "");


            var result = JsonConvert.DeserializeObject<ApiModel<AccountDto>>(content);
            return result.Value.Token;
        }
        private async Task<string> _CreateUserAndGetToken(HttpClient client, User user, string password)
        {
            var account = await _CreateUser(client, user, password);
            var token = await _authenticateAsync(client, user.UserName, password);
            return token;

        }

        [Fact]
        public async Task AuthenticateUsingUserName()
        {
            // create a user : 
            var user = RandomObjects.RandomUser(new string[] { }).Generate();

            var username = user.UserName;
            var password = "randomPassword@#$123";
            var httpClient = factory.CreateSecureClient();

            var account = await _CreateUser(httpClient, user, password);


            var bindings = new AuthenticateBindings { UserName = username, Password = password };
            var response = await httpClient.PostAsync($"{TestStartup.PATH}/account/authenticate", new JsonContent(bindings));
            var content = await response.Content.ReadAsStringAsync();

            Assert.True(response.IsSuccessStatusCode, response.ReasonPhrase ?? "");

            var result = JsonConvert.DeserializeObject<ApiModel<AccountDto>>(content);
            Assert.True(result.Result.Success, result.Result.Errors?.FirstOrDefault().Value?.FirstOrDefault() ?? "");

            Assert.Empty(result.Result.Errors);

            var resultUser = result.Value;

            Assert.NotNull(resultUser);
            Assert.True(resultUser.IsAuthenticated);
            Assert.NotNull(resultUser.Token);
            Assert.NotEqual("", resultUser.Token);
        }

        [Fact]
        public async Task ReturnCurrentAfterAuthenticateWithToken()
        {
            // create a user : 
            var user = RandomObjects.RandomUser(new string[] { }).Generate();

            var username = user.UserName;
            var password = "randomPassword@#$123";
            var httpClient = factory.CreateSecureClient();


            var token = await this._CreateUserAndGetToken(httpClient, user, password);


            var requestMessage = new HttpRequestMessage(HttpMethod.Get, $"{TestStartup.PATH}/account/current");
            requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);

            var response = await httpClient.SendAsync(requestMessage);
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

        [Fact]
        public async Task SendForgetMails()
        {

            // create a user : 
            var user = RandomObjects.RandomUser(new string[] { }).Generate();

            var username = user.UserName;
            var password = "randomPassword@#$123";
            var httpClient = factory.CreateSecureClient();


            var token = await this._CreateUserAndGetToken(httpClient, user, password);


            var bindings = new ForgotPasswordBindings { UserName = user.UserName };

            var authrequest = await httpClient.PostAsync($"{TestStartup.PATH}/account/forgot", new JsonContent(bindings));
            var authcontent = await authrequest.Content.ReadAsStringAsync();
            var authresult = JsonConvert.DeserializeObject<ApiModel<AccountDto>>(authcontent);
            var authuser = authresult.Value;

            Assert.Null(authuser); // we expect no informations;
            Assert.True(authrequest.IsSuccessStatusCode, authrequest.ReasonPhrase ?? "");

            // emails :
            var recievedEmails = this.factory.EmailSender.Flush();

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

        [Fact]
        public async Task ResetsPassword()
        {
             // create a user : 
            var user = RandomObjects.RandomUser(new string[] { }).Generate();

            var username = user.UserName;
            var oldpassword = $"username-Pa$$w0rd-old";
            var httpClient = factory.CreateSecureClient();


            var token = await this._CreateUserAndGetToken(httpClient, user, oldpassword);

            // forgot his email
            var bindings = new ForgotPasswordBindings { UserName = username};

            var forgotrequest = await httpClient.PostAsync($"{TestStartup.PATH}/account/forgot", new JsonContent(bindings));

            var forgotcontent = await forgotrequest.Content.ReadAsStringAsync();
            var forgotresult = JsonConvert.DeserializeObject<ApiModel<AccountDto>>(forgotcontent);

            // emails :
            var recievedEmails = this.factory.EmailSender.Flush();

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
            var resetrequest = await httpClient.GetAsync($"{actionLink}&password={encodedPassword}");
            var resetcontent = await resetrequest.Content.ReadAsStringAsync();
            var resetresult = JsonConvert.DeserializeObject<ApiModel<AccountDto>>(resetcontent);

            Assert.True(resetrequest.IsSuccessStatusCode, resetrequest.ReasonPhrase ?? "");
            Assert.True(resetresult.Result.Success, resetresult.Result.Errors?.FirstOrDefault().Value?.FirstOrDefault() ?? "");
            Assert.Empty(resetresult.Result.Errors);

            var verifyNewbindings = new AuthenticateBindings { UserName = user.UserName, Password = newpassword };
            var verifyNewresponse = await httpClient.PostAsync($"{TestStartup.PATH}/account/authenticate", new JsonContent(verifyNewbindings));
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
            var verifyOldresponse = await httpClient.PostAsync($"{TestStartup.PATH}/account/authenticate", new JsonContent(verifyOldbindings));
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