
using System;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.TestHost;
using our.orders.Helpers;
using Microsoft.Extensions.DependencyInjection;
using Xunit;
using our.orders.test.Helpers;
using System.Net.Http;
using our.orders.Services;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using our.orders.Identity;
using our.orders.Models;
using AutoMapper;
using our.orders.Builder;
using our.orders.Repositories.InMemory;
using our.orders.helpers;
using System.IO;
using Microsoft.AspNetCore.Hosting.Internal;
using Microsoft.Extensions.FileProviders;
using System.Collections.Generic;

namespace our.orders.test.Fixtures
{
    public class WebHostFixture : IAsyncLifetime, IDisposable
    {
        public readonly TestEmailSender EmailSender;

        public HttpClient HttpClient() => Server.CreateClient();
        public readonly TestServer Server;

        public RandomData RandomData { get; private set; }

        public IEnumerable<User> GetUsers() => RandomData.userManager.Users;

        public string PATH = "orders";
        public WebHostFixture()
        {

            EmailSender = new TestEmailSender();

            var datapath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
            Directory.CreateDirectory(datapath);

            var hostingEnvironment = new HostingEnvironment()
            {
                ContentRootFileProvider = new PhysicalFileProvider(datapath)
            };

            var hostbuilder =
                        new WebHostBuilder()
                            .ConfigureServices(s =>
                            {
                                s

                                    .AddSingleton<IHostingEnvironment>(hostingEnvironment)
                                    .AddOurOrders((appSettings) =>
                                    {
                                        appSettings.Path = "orders";
                                        appSettings.JwtSecret = "demo secret long enough";
                                    })
                                    .UseInMemoryDB();
                            })
                            .Configure(app =>
                            {

                                app
                                    .UseOurOrders(configureEvents: (appEvents) =>
                                    {
                                        appEvents.Configure += (sender, s) =>
                                        {
                                            s.AddSingleton<IEmailSender>(EmailSender);
                                            s.AddSingleton<RandomData>();
                                        };
                                        appEvents.ApplicationStarted += (sender, s) =>
                                            {
                                                RandomData = s.GetService<RandomData>();
                                            };
                                    });
                            });


            Server = new TestServer(hostbuilder);
        }

        public void Dispose()
        {
            Server.Dispose();
        }

        public async Task InitializeAsync()
        {
            await RandomData.Generate();

        }

        public Task DisposeAsync()
        {
            return Task.CompletedTask;
        }
    }

    // [CollectionDefinition(nameof(WebHostCollection))]
    // public class WebHostCollection : ICollectionFixture<WebHostFixture>
    // {
    //     // This class has no code, and is never created. Its purpose is simply
    //     // to be the place to apply [CollectionDefinition] and all the
    //     // ICollectionFixture<> interfaces.
    // }


}