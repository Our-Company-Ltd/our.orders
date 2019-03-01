using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Internal;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Moq;
using our.orders.Builder;
using our.orders.helpers;
using our.orders.Helpers;
using our.orders.Identity;
using our.orders.Models;
using our.orders.Repositories;
using our.orders.Repositories.InMemory;
using our.orders.test.Services;
using Xunit;


namespace our.orders.test.Fixtures
{
    public class TestServiceFixture : IAsyncLifetime, IDisposable
    {

        public readonly IServiceCollection HostServiceCollection;
        public readonly IServiceProvider ServiceProvider;
        public readonly IAppSettings AppSettings;
        public readonly RandomData RandomData;
        public readonly AppEvents AppEvents;

        public readonly IHostingEnvironment hostingEnvironment;

        public const string SECRET = "very long very long debugging secret :)";
        public string PATH = "our-orders";


        public TestServiceFixture()
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

            var testServiceProvider = new InMemoryRepository<TestServiceModel, TestServiceModel>(this.ServiceProvider);

            var type = typeof(TestServiceModel);

            TestService = new TestService(testServiceProvider, this.AppEvents);

            name = "Name with special cha$@c.\\|/ract<b .>/@#$%^&*()_";
            count = 10;
            names = Enumerable.Range(0, count).Select(i => $"{name} {i}");
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
        public IEnumerable<TestServiceModel> TestServiceModels { get; private set; }

        private readonly string name;

        private readonly int count;

        private readonly IEnumerable<string> names;

        public readonly TestService TestService;

        // public TestServiceFixture()
        // {


        // }

        public async Task InitializeAsync()
        {

            var models = names.SelectMany((fn, i) =>
                names.Select((ln, j) =>
                    new TestServiceModel
                    {
                        FirstName = fn,
                        LastName = ln,
                        Number = i * count + j,
                        Price = i + j
                    }));

            await TestService.CreateManyAsync(models).ContinueWith(async test =>
            {
                TestServiceModels = (await TestService.FindAsync()).ToList();
            }).Unwrap();

        }

        public Task DisposeAsync()
        {
            return Task.CompletedTask;
        }
    }

}