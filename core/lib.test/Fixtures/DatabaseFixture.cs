
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

using AutoMapper;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

using Moq;
using our.orders.Builder;
using our.orders.Helpers;
using our.orders.Identity;
using our.orders.Models;
using our.orders.Repositories.mongoDb;
using our.orders.Repositories;
using our.orders.Services;
using our.orders.Statistics;
using our.orders.test.Helpers;
using our.orders.test.Services;
using Xunit;
using our.orders.Repositories.InMemory;
using our.orders.helpers;
using Microsoft.AspNetCore.Hosting.Internal;
using Microsoft.Extensions.FileProviders;

namespace our.orders.test.Fixtures
{
    public class DatabaseFixture : IDisposable
    {

        public readonly IServiceCollection HostServiceCollection;
        public readonly IServiceProvider ServiceProvider;
        public readonly IAppSettings AppSettings;
        public readonly RandomData RandomData;
        public readonly AppEvents AppEvents;

        public readonly IHostingEnvironment hostingEnvironment;

        public const string SECRET = "very long very long debugging secret :)";
        public string PATH = "our-orders";

        public IEnumerable<User> GetUsers() => RandomData.userManager.Users;

        public DatabaseFixture()
        {
            AppSettings = new AppSettings()
            {
                Path = PATH,
                JwtSecret = SECRET
            };
            AppEvents = new AppEvents();

            var datapath = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
            Directory.CreateDirectory(datapath);
            hostingEnvironment = new HostingEnvironment()
            {
                ContentRootFileProvider = new PhysicalFileProvider(datapath)
            };
            HostServiceCollection = new ServiceCollection() { };

            HostServiceCollection.AddSingleton<IHostingEnvironment>(hostingEnvironment);
            var builder = new OurOrdersBuilder(AppSettings, AppEvents, HostServiceCollection);

            builder
                .UseInMemoryDB();

            ServiceProvider = CreateServiceProvider(builder);

            RandomData = ServiceProvider.GetService<RandomData>();
            AsyncHelper.RunSync(() => RandomData.Generate());
        }


        protected IServiceProvider CreateServiceProvider(OurOrdersBuilder builder)
        {
            var configuration = new Mock<IConfiguration>();

            var startup = new Startup(configuration.Object, builder.AppSettings, hostingEnvironment, builder.appEvents);

            var services = new ServiceCollection();
            services.AddLogging();
            services.AddSingleton<IAppSettings>(builder.AppSettings);
            services.AddSingleton<RandomData>();

            startup.ConfigureServices(services);

            return services.BuildServiceProvider();
        }
        public UserManager UserManager
            => ServiceProvider.GetService<UserManager>();

        public RoleManager RoleManager
            => ServiceProvider.GetService<RoleManager>();

        public SignInManager<User> SignInManager
            => ServiceProvider.GetService<SignInManager<User>>();

        public Configuration Configuration
            => ServiceProvider.GetService<Configuration>();


        public IMapper Mapper
            => ServiceProvider.GetService<IMapper>();
        public void Dispose()
        {
            // ... clean up test data from the database ...
        }

        // public async Task InitializeAsync()
        // {
        //     //await RandomData.Generate();
        // }

        // public Task DisposeAsync()
        // {
        //     return Task.CompletedTask;
        // }
    }

}