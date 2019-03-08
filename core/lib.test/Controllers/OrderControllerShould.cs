// using System;
// using System.Collections.Generic;
// using System.Linq;
// using System.Net;
// using System.Net.Http;
// using System.Net.Http.Headers;
// using System.Text;
// using System.Text.RegularExpressions;
// using System.Threading;
// using System.Threading.Tasks;
// using System.Web;
// using Microsoft.AspNetCore.Identity;
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

// namespace our.orders.test.Controllers
// {
//     public class OrderControllerShould : IClassFixture<TestWebApplicationFactory>
//     {
//         private readonly TestWebApplicationFactory factory;

//         public OrderControllerShould(TestWebApplicationFactory factory)
//         {
//             this.factory = factory;
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

//             var newUserrequestMessage = new HttpRequestMessage(HttpMethod.Post, $"{TestStartup.PATH}/user?password={ WebUtility.UrlEncode(password)}");
//             newUserrequestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", await _adminToken(client));
//             newUserrequestMessage.Content = new JsonContent(user);
//             var response = await client.SendAsync(newUserrequestMessage);
//             Assert.True(response.IsSuccessStatusCode, response.ReasonPhrase ?? "");

//             var newUserContent = await response.Content.ReadAsStringAsync();
//             var result = JsonConvert.DeserializeObject<ApiModel<AccountDto>>(newUserContent);
//             Assert.True(result.Result.Success);
//             return result.Value;
//         }
//         private async Task<string> _authenticateAsync(HttpClient client, string username, string password)
//         {

//             var bindings = new AuthenticateBindings { UserName = username, Password = password };
//             var response = await client.PostAsync($"{TestStartup.PATH}/account/authenticate", new JsonContent(bindings));
//             var content = await response.Content.ReadAsStringAsync();

//             Assert.True(response.IsSuccessStatusCode, response.ReasonPhrase ?? "");


//             var result = JsonConvert.DeserializeObject<ApiModel<AccountDto>>(content);
//             return result.Value.Token;
//         }
//         private async Task<string> _CreateUserAndGetToken(HttpClient client, User user, string password)
//         {
//             var account = await _CreateUser(client, user, password);
//             var token = await _authenticateAsync(client, user.UserName, password);
//             return token;

//         }


//         [Fact]

//         public async Task ReturnCreatedEntries()
//         {
//             // create a user : 
//             var user = RandomObjects.RandomUser(new string[] { RoleStore.CRUD_ORDERS }).Generate();

//             var username = user.UserName;
//             var password = "randomPassword@#$123";
//             var httpClient = factory.CreateSecureClient();

//             var token = await _CreateUserAndGetToken(httpClient, user, password);

//             var order = new OrderDto
//             {
//                 Note = "test note"
//             };

//             var requestMessage = new HttpRequestMessage(HttpMethod.Post, $"{TestStartup.PATH}/order");
//             requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", token);
//             requestMessage.Content = new JsonContent(order);

//             var response = await httpClient.SendAsync(requestMessage);

//             var content = await response.Content.ReadAsStringAsync();

//             Assert.True(response.IsSuccessStatusCode, response.ReasonPhrase ?? "");


//             var result = JsonConvert.DeserializeObject<ApiModel<OrderDto>>(content);

//             Assert.True(result.Result.Success, result.Result.Errors?.FirstOrDefault().Value?.FirstOrDefault() ?? "");
//             Assert.Empty(result.Result.Errors);

//             var resultOrder = result.Value;

//             Assert.NotNull(resultOrder);

//             Assert.Equal(order.Note, resultOrder.Note);
//         }

//         // [Theory]
//         // [InlineData(5)]
//         // public async Task FindEntries(int orderIndex)
//         // {
//         //     // create a user : 
//         //     var user = RandomObjects.RandomUser(new string[] { RoleStore.CRUD_ORDERS }).Generate();

//         //     var username = user.UserName;
//         //     var password = "randomPassword@#$123";
//         //     var httpClient = factory.CreateSecureClient();

//         //     var token = await _CreateUserAndGetToken(httpClient, user, password);

//         //     var order = (await this.controllerFixture.RandomData.orderService.FindAsync()).ElementAt(orderIndex);
//         //     var filter = Filter.Eq(nameof(Order.Note), order.Note);

//         //     var requestMessage = new HttpRequestMessage(HttpMethod.Post, $"{controllerFixture.PATH}/order/find");
//         //     requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", resultUser.Token);
//         //     requestMessage.Content = new JsonContent(filter);

//         //     var response = await httpClient().SendAsync(requestMessage);

//         //     var content = await response.Content.ReadAsStringAsync();

//         //     Assert.True(response.IsSuccessStatusCode, response.ReasonPhrase ?? "");


//         //     var listResult = JsonConvert.DeserializeObject<ApiModel<FindResult<OrderDto>>>(content);

//         //     Assert.True(listResult.Result.Success, listResult.Result.Errors?.FirstOrDefault().Value?.FirstOrDefault() ?? "");
//         //     Assert.Empty(listResult.Result.Errors);

//         //     var list = listResult.Value;

//         //     Assert.NotNull(list);

//         //     // Assert.Equal(1, list.Count);
//         //     Assert.Equal(filter.Value, list.Values.FirstOrDefault()?.Note);

//         // }

//         // [Theory]
//         // [InlineData("impossible-to-find")]
//         // [InlineData("")]
//         // [InlineData("product")]
//         // public async Task ListEntries(string query)
//         // {

//         //     var user = this.controllerFixture.DatabaseFixture.RandomData.TestUsers.ElementAt(0);

//         //     var bindings = new AuthenticateBindings { UserName = user.Item1.UserName, Password = user.Item2 };

//         //     var authResponse = await httpClient.PostAsync("account/authenticate", new JsonContent(bindings));
//         //     var authContent = await authResponse.Content.ReadAsStringAsync();
//         //     var authResult = JsonConvert.DeserializeObject<ApiModel<AccountDto>>(authContent);
//         //     var resultUser = authResult.Value;


//         //     var requestMessage = new HttpRequestMessage(HttpMethod.Post, "product/list");
//         //     requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Bearer", resultUser.Token);
//         //     requestMessage.Content = new JsonContent(query);

//         //     var response = await httpClient.SendAsync(requestMessage);

//         //     var content = await response.Content.ReadAsStringAsync();

//         //     Assert.True(response.IsSuccessStatusCode, response.ReasonPhrase ?? "");


//         //     var listResult = JsonConvert.DeserializeObject<ApiModel<ListResult>>(content);

//         //     Assert.True(listResult.Result.Success, listResult.Result.Errors?.FirstOrDefault().Value?.FirstOrDefault() ?? "");
//         //     Assert.Empty(listResult.Result.Errors);

//         //     var list = listResult.Value;

//         //     Assert.NotNull(list);
//         //     var filter = string.IsNullOrEmpty(query) ? null : Filter.Like("SKU", query);
//         //     var expectedResults = await this.controllerFixture.DatabaseFixture.RandomData.ProductProvider.FindAsync(filter);

//         //     Assert.Equal(expectedResults.Count(), list.Count);

//         // }


//         // [Theory]
//         // [InlineData(1)]
//         // public async Task AuthenticateUsingEmail(int index)
//         // {
//         //     var userName = $"username-{index}@email.com";
//         //     var password = $"username-{index}-Pa$$w0rd";

//         //     var user = new UserDto
//         //     {
//         //         UserName = userName,
//         //         Password = password
//         //     };

//         //     var response = await httpClient.PostAsync("account/authenticate", new JsonContent(user));
//         //     var content = await response.Content.ReadAsStringAsync();

//         //     Assert.True(response.IsSuccessStatusCode, response.ReasonPhrase ?? "");


//         //     var result = JsonConvert.DeserializeObject<ApiModel<UserDto>>(content);

//         //     Assert.True(result.Result.Success);
//         //     Assert.Empty(result.Result.Errors);

//         //     var resultUser = result.Value;

//         //     Assert.NotNull(resultUser);
//         //     Assert.True(resultUser.IsAuthenticated);
//         //     Assert.NotNull(resultUser.Token);
//         //     Assert.NotEqual(resultUser.Token, "");
//         // }

//     }
// }