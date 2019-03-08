
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
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore;

namespace our.orders.test.Fixtures
{
    // public class WebHostFixture : IAsyncLifetime, IDisposable
    // {
    //     public readonly TestEmailSender EmailSender;

    //     public HttpClient HttpClient() => Server.CreateClient();
    //     public readonly TestServer Server;




    //     public IEnumerable<User> GetUsers() => RandomData.userManager.Users;


    //     public WebHostFixture()
    //     {

    //         EmailSender = new TestEmailSender();

    //         var datapath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
    //         Directory.CreateDirectory(datapath);

    //         var hostingEnvironment = new HostingEnvironment()
    //         {
    //             ContentRootFileProvider = new PhysicalFileProvider(datapath)
    //         };

    //         var hostbuilder =
    //                     new WebHostBuilder()
    //                         .ConfigureServices(s =>
    //                         {
    //                             s

    //                                 .AddSingleton<IHostingEnvironment>(hostingEnvironment)
    //                                 .AddOurOrders((appSettings) =>
    //                                 {
    //                                     appSettings.Path = "orders";
    //                                     appSettings.JwtSecret = JwtSecret;
    //                                 })
    //                                 .UseInMemoryDB();
    //                         })
    //                         .Configure(app =>
    //                         {


    //                         });


    //         Server = new TestServer(hostbuilder);
    //     }

    //     public void Dispose()
    //     {
    //         Server.Dispose();
    //     }

    //     public async Task InitializeAsync()
    //     {
    //         await RandomData.Generate();

    //     }

    //     public Task DisposeAsync()
    //     {
    //         return Task.CompletedTask;
    //     }
    // }

    public class TestStartup
    {

        public static string JwtSecret = "demo secret long enough";
        public static string PATH = "orders";
        private readonly IEmailSender emailSender;

        public IConfiguration Configuration { get; }

        public IHostingEnvironment HostingEnvironment { get; }



        public RandomData RandomData { get; private set; }

        public UserManager UserManager { get; private set; }

        public TestStartup(IConfiguration configuration, IHostingEnvironment env, IEmailSender emailSender)
        {
            this.Configuration = configuration;
            this.HostingEnvironment = env;
            this.emailSender = emailSender;
        }



        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services
                   .AddOurOrders((appSettings) =>
                   {
                       appSettings.Path = TestStartup.PATH;
                       appSettings.JwtSecret = TestStartup.JwtSecret;
                   })
                   .UseInMemoryDB();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, IServiceProvider serviceProvider)
        {
            app
                              .UseOurOrders(configureEvents: (appEvents) =>
                              {
                                  appEvents.Configure += (sender, s) =>
                                  {
                                      s.AddSingleton<IEmailSender>(emailSender);
                                      s.AddSingleton<RandomData>();
                                  };
                                  appEvents.ApplicationStarted += (sender, s) =>
                                      {
                                          RandomData = s.GetService<RandomData>();
                                          UserManager = s.GetService<UserManager>();
                                          AsyncHelper.RunSync(() => RandomData.Generate());
                                      };
                              });

        }
    }


    public class TestWebApplicationFactory : WebApplicationFactory<TestStartup>
    {
        public TestEmailSender EmailSender = new TestEmailSender();
        private string DataPath;
        public TestWebApplicationFactory()
        {
            DataPath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
            Directory.CreateDirectory(DataPath);
        }
        protected override IWebHostBuilder CreateWebHostBuilder()
        {

            return WebHost
                .CreateDefaultBuilder()
                .UseContentRoot(DataPath)
                .UseStartup<TestStartup>();
        }

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            var hostingEnvironment = new HostingEnvironment()
            {
                ContentRootFileProvider = new PhysicalFileProvider(DataPath)
            };

            builder
                .UseContentRoot(DataPath);

            builder.ConfigureServices(s =>
            {
                s.AddSingleton<IEmailSender>(EmailSender);
                s.AddSingleton<IHostingEnvironment>(hostingEnvironment);
            });

            base.ConfigureWebHost(builder);
        }

        public HttpClient CreateSecureClient() => this
         .CreateClient(
             new WebApplicationFactoryClientOptions
             {
                 AllowAutoRedirect = false
             });
    }
}