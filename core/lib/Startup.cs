using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using our.orders.Helpers;
using our.orders.Models;
using AutoMapper;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Newtonsoft.Json;
using Newtonsoft.Json.Serialization;
using System;
using Microsoft.Extensions.DependencyInjection.Extensions;
using our.orders.Filters;
using our.orders.Repositories;
using Newtonsoft.Json.Converters;
using our.orders.Services;
using System.Runtime.CompilerServices;
using our.orders.Statistics;
using our.orders.Dtos;
using our.orders.Identity;
using Microsoft.Extensions.FileProviders;
using System.Reflection;
using System.Linq;
using System.IO;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;

[assembly: InternalsVisibleTo("core.test")]

namespace our.orders
{
    public class Startup
    {
        public AppEvents AppEvents { get; }

        public Startup(IConfiguration configuration, IAppSettings appSettings, IHostingEnvironment env, AppEvents appEvents)
        {
            AppEvents = appEvents;
            Configuration = configuration;
            AppSettings = appSettings;
            HostingEnvironment = env;
        }

        public IConfiguration Configuration { get; }

        public IAppSettings AppSettings { get; }

        public IHostingEnvironment HostingEnvironment { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            // services.TryAddScoped<StatisticListener>();


            // AppEvents.ApplicationStarting += (sender, serviceProvider) =>
            // {
            //     var listener = serviceProvider.GetService<StatisticListener>();
            //     AppEvents.Services = serviceProvider;
            //     listener.StartListening();
            // };

            // AppEvents.ApplicationStopping += (sender, serviceProvider) =>
            // {
            //     var listener = serviceProvider.GetService<StatisticListener>();
            //     listener.StopListening();
            // };

            services.TryAddSingleton<IAppSettings>(AppSettings);
            services.TryAddSingleton<AppEvents>(AppEvents);

            services.TryAddSingleton<Configuration>((s) =>
            {

                var configPath = HostingEnvironment.ContentRootFileProvider.GetFileInfo("our.orders.config");

                return configPath.Exists ?
                    JsonConvert.DeserializeObject<Configuration>(File.ReadAllText(configPath.PhysicalPath)) :
                     new Configuration();
            });

            services.TryAddSingleton<AutoMapperProvider>();

            services.TryAddSingleton<IEmailSender, LoggerSender>();

            var autoMapperProvider = new AutoMapperProvider(services);

            services.AddSingleton<Profile, AutoMapperProfile>();
            services.AddSingleton<IMapper>((s) => autoMapperProvider.GetMapper(s));

            services.AddCors();

            services.AddMemoryCache();

            services.AddAntiforgery(options =>
                {
                    options.Cookie.Name = "XSRF-TOKEN";
                    options.HeaderName = "X-XSRF-TOKEN";
                    options.FormFieldName = "requestVerificationToken";
                });


            // Appsettings services custom configuration
            AppEvents.OnConfigure(services);

            // ******  Services depending on AppSettings ****** 

            // AppSettings validation
            var appSettingsValidator = new AppSettingsValidator();
            appSettingsValidator.EnsureValid(AppSettings);


            var roleStore = new RoleStore();
            services.AddSingleton<RoleStore>(roleStore);
            services.AddSingleton<IRoleStore<Role>>(roleStore);


            services.AddTransient<IOrder, Order>();
            services.AddTransient<IProduct, Product>();
            services.AddTransient<IClient, Client>();
            services.AddTransient<ShippingTemplate>();
            services.AddTransient<DocumentTemplate>();
            services.AddTransient<Shop>();
            services.AddTransient<Movement>();
            services.AddTransient<Voucher>();
            services.AddTransient<StockUnit>();
            services.AddTransient<Warehouse>();
            services.AddTransient<Category>();
            services.AddTransient<User>();



            services.TryAddTransient<OrderService, OrderService>();
            services.TryAddTransient<IService<IOrder>, OrderService>();

            services.TryAddTransient<ProductService, ProductService>();
            services.TryAddTransient<IService<IProduct>, ProductService>();

            services.TryAddTransient<IService<IShippingTemplate>, Service<IShippingTemplate>>();
            services.TryAddTransient<IService<DocumentTemplate>, Service<DocumentTemplate>>();

            services.TryAddTransient<IService<IClient>, Service<IClient>>();

            services.TryAddTransient<IService<Shop>, Service<Shop>>();
            services.TryAddTransient<IService<Movement>, Service<Movement>>();
            services.TryAddTransient<IService<Voucher>, Service<Voucher>>();
            services.TryAddTransient<IService<StockUnit>, Service<StockUnit>>();
            services.TryAddTransient<IService<Warehouse>, Service<Warehouse>>();
            services.TryAddTransient<IService<Category>, Service<Category>>();


            var key = Encoding.ASCII.GetBytes(AppSettings.JwtSecret);

            // ******  End Services depending on AppSettings ****** 


            // configure jwt authentication

            services
                .AddAuthentication(x =>
                {
                    x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                    x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                })
                // .AddCookie(cfg => cfg.SlidingExpiration = true)
                .AddJwtBearer(x =>
                {
                    x.RequireHttpsMetadata = false;
                    x.SaveToken = true;

                    x.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuerSigningKey = true,
                        IssuerSigningKey = new SymmetricSecurityKey(key),
                        ValidateIssuer = false,
                        ValidateAudience = false
                    };

                    x.Events = new JwtBearerEvents
                    {
                        // For debugging...
                        OnAuthenticationFailed = async (context) =>
                        {
                            await Task.FromResult(0);
                        },
                        OnChallenge = async (context) =>
                        {
                            await Task.FromResult(0);
                        },
                        OnMessageReceived = async (context) =>
                        {
                            await Task.FromResult(0);
                        },
                        OnTokenValidated = async (context) =>
                        {
                            await Task.FromResult(0);
                        }
                    };
                });

            // Add framework services.
            services
                .AddMvc(options =>
                {
                    // options.Conventions.Insert(0, new RoutePrefixConvention(new RouteAttribute("our-orders")));
                    options.Filters.Add<OperationCancelledExceptionFilter>();
                })

                .AddJsonOptions(options =>
                {
                    options.SerializerSettings.NullValueHandling = NullValueHandling.Ignore;
                    options.SerializerSettings.ContractResolver = new DefaultContractResolver();
                    options.SerializerSettings.Formatting = Formatting.Indented;
                    options.SerializerSettings.Converters.Add(new Newtonsoft.Json.Converters.StringEnumConverter());

                    JsonConvert.DefaultSettings = () => new JsonSerializerSettings()
                    {
                        ContractResolver = new DefaultContractResolver(),
                        Formatting = Newtonsoft.Json.Formatting.Indented,
                        NullValueHandling = NullValueHandling.Ignore,
                        Converters = new List<JsonConverter> { new StringEnumConverter() }
                    };
                })
                .ConfigureApplicationPartManager(manager =>
                {
                    manager.FeatureProviders.Add(new InternalControllerFeature());
                    manager.FeatureProviders.Add(new ExternalControllerFeatureProvider(AppSettings));
                });
#if NETCORE2_2
            var embeddedProvider = new ManifestEmbeddedFileProvider(Assembly.GetAssembly(this.GetType()));
#else
            var embeddedProvider = new EmbeddedFileProvider(Assembly.GetAssembly(this.GetType()), "our.orders");
#endif
            services.AddSingleton<IFileProvider>(embeddedProvider);

            // configure DI for application services
            // services.AddScoped<IUserService, UserService>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IServiceProvider serviceProvider)
        {
            AppEvents.OnApplicationStarting(serviceProvider);
            if (HostingEnvironment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            // global cors policy
            app.UseCors(x => x
                .AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials());
            var fileProvider = serviceProvider.GetService<IFileProvider>();
            app.UseDefaultFiles(new DefaultFilesOptions
            {
                RequestPath = PathString.Empty,
                FileProvider = fileProvider,
                DefaultFileNames = new List<string> { "index.html", "index.htm", "home.html", "home.htm", "default.html", "default.html" }
            });


            app.UseStaticFiles(new StaticFileOptions
            {
                RequestPath = PathString.Empty,
                FileProvider = fileProvider,
                OnPrepareResponse = r => r.Context.Response.Headers.Add("Expires", DateTime.Now.AddDays(7).ToUniversalTime().ToString("r")),
                ServeUnknownFileTypes = true
            });



            app.UseAuthentication();

            app.UseMvc();

            AppEvents.OnApplicationStarted(serviceProvider);



        }
    }
}
