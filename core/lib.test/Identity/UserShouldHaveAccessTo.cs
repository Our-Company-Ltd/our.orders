// using System;
// using System.Collections.Generic;
// using System.IdentityModel.Tokens.Jwt;
// using System.Linq;
// using System.Net;
// using System.Net.Http;
// using System.Net.Http.Headers;
// using System.Security.Claims;
// using System.Text;
// using System.Text.RegularExpressions;
// using System.Threading;
// using System.Threading.Tasks;
// using Microsoft.Extensions.DependencyInjection;
// using System.Web;
// using Microsoft.AspNetCore.Identity;
// using Microsoft.AspNetCore.Mvc.Testing;
// using Microsoft.AspNetCore.TestHost;
// using Microsoft.IdentityModel.Tokens;
// using MongoDB.Driver;
// using Newtonsoft.Json;
// using our.orders.Controllers;
// using our.orders.Dtos;
// using our.orders.helpers;
// using our.orders.Helpers;
// using our.orders.Identity;
// using our.orders.Models;
// using our.orders.test.Fixtures;
// using our.orders.test.Helpers;
// using Xunit;
// using static our.orders.Controllers.AccountController;
// using our.orders.Builder;
// using Xunit.Abstractions;

// [assembly: CollectionBehavior(DisableTestParallelization = true)]

// namespace our.orders.test.Identity
// {
//     public class UserShouldHaveAccessTo : IClassFixture<TestWebApplicationFactory>
//     {
//         private readonly TestWebApplicationFactory factory;
//         private readonly ITestOutputHelper output;

//         public UserShouldHaveAccessTo(TestWebApplicationFactory factory, ITestOutputHelper output)
//         {
//             this.factory = factory;
//             this.output = output;
//         }


//         private async Task<string> _adminToken(HttpClient client)
//         {
//             var bindings = new AuthenticateBindings { UserName = "admin-1", Password = "admin-1-Pa$$w0rd" };
//             var response = await client.PostAsync($"{TestStartup.PATH}/account/authenticate", new JsonContent(bindings));
//             var content = await response.Content.ReadAsStringAsync();

//             Assert.True(response.IsSuccessStatusCode, response.ReasonPhrase ?? "");


//             var result = JsonConvert.DeserializeObject<ApiModel<AccountDto>>(content);
//             return result.Value.Token;

//         }
//         private async Task<AccountDto> _CreateUser(HttpClient client, User user, string password)
//         {
//             var adminToken = await _adminToken(client);
//             var newUserrequestMessage = new HttpRequestMessage(HttpMethod.Post, $"{TestStartup.PATH}/user?password={ WebUtility.UrlEncode(password)}");
//             newUserrequestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
//             newUserrequestMessage.Content = new JsonContent(user);
//             var response = await client.SendAsync(newUserrequestMessage);
//             Assert.True(response.IsSuccessStatusCode, response.ReasonPhrase ?? "");

//             var newUserContent = await response.Content.ReadAsStringAsync();
//             var result = JsonConvert.DeserializeObject<ApiModel<AccountDto>>(newUserContent);
//             Assert.True(result.Result.Success, adminToken);
//             return result.Value;
//         }
//         private async Task<string> _authenticateAsync(HttpClient client, User user, string password)
//         {

//             var bindings = new AuthenticateBindings { UserName = user.UserName, Password = password };
//             var response = await client.PostAsync($"{TestStartup.PATH}/account/authenticate", new JsonContent(bindings));
//             var content = await response.Content.ReadAsStringAsync();

//             Assert.True(response.IsSuccessStatusCode, response.ReasonPhrase ?? "");


//             var result = JsonConvert.DeserializeObject<ApiModel<AccountDto>>(content);
//             return result.Value.Token;
//         }
//         private async Task<string> _CreateUserAndGetToken(HttpClient client, string username, string password, string[] roles)
//         {
//             var user = new User { UserName = username, Roles = roles };
//             var account = await _CreateUser(client, user, password);
//             var token = await _authenticateAsync(client, user, password);
//             return token;

//         }
//         private static HttpStatusCode[] _UnAuthStatusCodes = new HttpStatusCode[] { HttpStatusCode.NotFound, HttpStatusCode.Forbidden, HttpStatusCode.Unauthorized };
//         private async Task<HttpStatusCode> _CheckEndPoint(HttpClient client, HttpMethod method, string endpoint, string token, HttpContent content)
//         {

//             var requestMessage = new HttpRequestMessage(method, endpoint);
//             client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
//             requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
//             requestMessage.Content = content;
//             var response = await client.SendAsync(requestMessage);
//             return response.StatusCode;
//         }

//         private async Task _TestService_Accessible<TModel, TDto>(HttpClient httpClient, string token) where TDto : new()
//         {
//             var controllerEndpoint = $"{TestStartup.PATH}/{typeof(TModel).Name}";

//             var findStatusCode = await _CheckEndPoint(httpClient, HttpMethod.Post, $"{controllerEndpoint}/find", token, new JsonContent(""));
//             Assert.DoesNotContain(findStatusCode, _UnAuthStatusCodes);

//             var postStatusCode = await _CheckEndPoint(httpClient, HttpMethod.Post, $"{controllerEndpoint}", token, new JsonContent(new TDto()));
//             Assert.DoesNotContain(postStatusCode, _UnAuthStatusCodes);

//             var patchStatusCode = await _CheckEndPoint(httpClient, HttpMethod.Patch, $"{controllerEndpoint}/id", token, new JsonContent(new TDto()));
//             Assert.DoesNotContain(patchStatusCode, _UnAuthStatusCodes);
//         }

//         private async Task _TestService_NotAccessible<TModel, TDto>(HttpClient httpClient, string token) where TDto : new()
//         {
//             var controllerEndpoint = $"{TestStartup.PATH}/{typeof(TModel).Name}";

//             var findStatusCode = await _CheckEndPoint(httpClient, HttpMethod.Post, $"{controllerEndpoint}/find", token, new JsonContent(""));
//             Assert.Contains(findStatusCode, _UnAuthStatusCodes);

//             var postStatusCode = await _CheckEndPoint(httpClient, HttpMethod.Post, $"{controllerEndpoint}", token, new JsonContent(new TDto()));
//             Assert.Contains(postStatusCode, _UnAuthStatusCodes);

//             var patchStatusCode = await _CheckEndPoint(httpClient, HttpMethod.Patch, $"{controllerEndpoint}/id", token, new JsonContent(new TDto()));
//             Assert.Contains(patchStatusCode, _UnAuthStatusCodes);
//         }

//         [Theory]
//         [InlineData(RoleStore.ADMIN)]
//         [InlineData(RoleStore.CRUD_CLIENTS)]
//         public async Task ClientList_Accessible(params string[] roles)
//         {
//             var user = RandomObjects.RandomUser(roles).Generate();

//             var username = user.UserName;
//             var password = "randomPassword@#$123";
//             var httpClient = factory.CreateSecureClient();

//             var token = await _CreateUserAndGetToken(httpClient, username, password, roles);

//             await _TestService_Accessible<Client, ClientDto>(httpClient, token);
//         }

//         [Theory]
//         [InlineData(RoleStore.CRUD_CATEGORIES)]
//         [InlineData(RoleStore.CRUD_PRODUCTS)]
//         public async Task ClientList_NotAccessible(params string[] roles)
//         {
//             var user = RandomObjects.RandomUser(roles).Generate();

//             var username = user.UserName;
//             var password = "randomPassword@#$123";
//             var httpClient = factory.CreateSecureClient();

//             var token = await _CreateUserAndGetToken(httpClient, username, password, roles);

//             await _TestService_NotAccessible<Client, ClientDto>(httpClient, token);

//         }


//     }
// }