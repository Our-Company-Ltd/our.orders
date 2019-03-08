using System;
using Microsoft.Extensions.DependencyInjection;
using System.Threading.Tasks;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using our.orders.Dtos;
using our.orders.Helpers;
using our.orders.Models;
using our.orders.test.Helpers;
using Xunit;
using System.IO;
using our.orders.Builder;
using our.orders.Repositories.mongoDb;
using our.orders.Repositories.InMemory;

namespace our.orders.test.Settings
{
    public class AppSettingsShould
    {

        [Fact]
        public async Task ChangeAppPath()
        {
            // [Setup]
            // setup webhost using appsettings with specific path

            var random = new Bogus.Randomizer();
            var randomPathChars = random.Chars('a', 'z', random.Int(1, 10));
            var randomPath = new string(randomPathChars);
            var randomSecret = random.Words(10);



            var hostbuilder =
                    WebHost
                        .CreateDefaultBuilder()
                        .ConfigureServices(s =>
                        {
                            s
                                .AddOurOrders(appSettings =>
                                {
                                    appSettings.Path = randomPath;
                                    appSettings.JwtSecret = randomSecret;
                                })
                                .UseInMemoryDB();
                        })
                        .Configure(appbuilder =>
                        {
                            appbuilder
                                .UseOurOrders();
                        });

            var server = new TestServer(hostbuilder);
            var httpClient = server.CreateClient();


            // [Exercise]
            // send a request to the webhost on the specified path
            var path = $"/{randomPath}/account/current";
            var response = await httpClient.GetAsync(path);

            // [Verify]
            // check if request is successful
            Assert.True(response.IsSuccessStatusCode);

            // [Teardown]
            // shut down the server that we setup
            server.Dispose();
        }


        [Theory]
        [InlineData("&%^-invalid", "this is a valid secret", typeof(Order), typeof(Client))]
        [InlineData("valid-path", "", typeof(Order), typeof(Client))]
        [InlineData("valid-path", "this is a valid secret", typeof(Client), typeof(Client))]
        [InlineData("valid-path", "this is a valid secret", typeof(Order), typeof(Order))]
        public void ThrowExceptionIfNotValid(string invalidPath, string invalidSecret, Type orderType, Type clientType)
        {
            // [Setup]
            // setup webhost using appsettings with specific path

            Action<IAppSettings> appConfiguration = (IAppSettings appSettings) =>
                                       {
                                           appSettings.OrderType = orderType;
                                           appSettings.ClientType = clientType;

                                           appSettings.Path = invalidPath;
                                           appSettings.JwtSecret = invalidSecret;
                                       };
            var hostbuilder =
                    WebHost
                        .CreateDefaultBuilder()
                        .ConfigureServices(s =>
                        {
                            s
                                .AddOurOrders(appConfiguration)
                                .UseInMemoryDB();
                        })
                        .Configure(appbuilder =>
                        {
                            appbuilder
                                .UseOurOrders();
                        });

            // [Verify]
            // we expect to have a appsettings invalid exception
            Assert.Throws<InvalidAppSettingsException>(() =>
            {
                var invalidSettings = new AppSettings();
                appConfiguration(invalidSettings);
                new AppSettingsValidator().EnsureValid(invalidSettings);

                // [Exercise]
                // start the app and try a login
                using (var server = new TestServer(hostbuilder))
                {
                    var httpClient = server.CreateClient();

                    var userName = $"username-1";
                    var password = $"username-1-Pa$$w0rd";

                    var user = new AccountDto
                    {
                        UserName = userName,
                        Password = password
                    };
                    var path = $"/{invalidPath}/account/authenticate";
                    var response = AsyncHelper.RunSync(() => httpClient.PostAsync(path, new JsonContent(user)));
                    var content = AsyncHelper.RunSync(() => response.Content.ReadAsStringAsync());
                    // expecting to break;
                }
            });

            // [Teardown]
            // shut down the server that we setup

        }

        // TODO: Appsettings, test not good type for ProductType, OrderType etc… and raise exceptions
        // TODO: Appsettings, test jwtsecret and path not valid

    }
}