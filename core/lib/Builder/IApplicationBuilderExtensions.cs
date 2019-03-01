using System;
using System.Reflection;
using System.Runtime.ExceptionServices;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Builder;
using Microsoft.AspNetCore.Hosting.Internal;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Options;
using our.orders;
using our.orders.Helpers;

namespace our.orders.Builder
{
    /// <summary>
    /// Extensions for the host IApplicationBuilder
    /// </summary>
    public static class IApplicationBuilderExtensions
    {
        /// <summary>
        /// Add Our Orders
        /// </summary>
        /// <param name="builder"></param>
        /// <param name="configure"></param>
        /// <param name="configureEvents"></param>
        public static void UseOurOrders(this IApplicationBuilder builder, Action<IAppSettings> configure = null, Action<AppEvents> configureEvents = null)
        {
            // find options
            // TODO: check possible implementation of Options
            // var configuration = builder.ApplicationServices.GetService<IOptions<IAppSettings>>();

            // TODO: refactor the creation of the host. same namespace, but different file
            var hostServiceProvider = builder.ApplicationServices;

            // appsettings comes from the services so it can be injected
            var appsettings = hostServiceProvider.GetService<IAppSettings>();

            if (appsettings == null)
            {
                throw new AppException($"impossible to find required {nameof(IAppSettings)} service. Did you forget to use {nameof(IServiceCollectionExtensions.AddOurOrders)} in ConfigureSerices ?");
            }

            if (configure != null)
            {
                configure(appsettings);
            }

            // appevents comes from the services
            var appEvents = hostServiceProvider.GetService<AppEvents>();

            if (configureEvents != null)
            {
                configureEvents(appEvents);
            }

            MakeWebHost<Startup>(builder, appsettings, appEvents);
        }


        internal class WebHostStartup<TStartup> : IStartup where TStartup : class
        {
            private readonly StartupMethods _methods;

            private readonly IAppSettings _appSettings;

            private readonly IServiceProvider _hostServiceProvider;

            private readonly IServiceProvider _clientServiceProvider;

            private RequestDelegate _RequestDelegate;
            public WebHostStartup(IApplicationBuilder hostApp, IServiceProvider hostServiceProvider, IServiceProvider clientServiceProvider)
            {
                var env = hostServiceProvider.GetRequiredService<IHostingEnvironment>();

                var appSettings = clientServiceProvider.GetService<IAppSettings>();

                _methods = StartupLoader.LoadMethods(clientServiceProvider, typeof(TStartup), env.EnvironmentName);

                _appSettings = appSettings;
                _hostServiceProvider = hostServiceProvider;
                _clientServiceProvider = clientServiceProvider;

                var cleanPath = _appSettings.Path.Trim('/');
                var path = new PathString($"/{cleanPath}");

                // map the path to the requestDelegate
                hostApp.Map(path, mappedbuilder =>
                {
                    mappedbuilder.Use(async (context, next) =>
                    {
                        await _RequestDelegate(context);
                    });
                });
            }

            public void Configure(IApplicationBuilder app)
            {

                var serverFeatures = app.ServerFeatures;
                var appServices = app.ApplicationServices;
                var hostLifetime = _hostServiceProvider.GetService<IApplicationLifetime>();

                var appBuilderFactory = appServices.GetRequiredService<IApplicationBuilderFactory>();
                var factory = appServices.GetRequiredService<IServiceScopeFactory>();

                // scope factory
                var branchBuilder = appBuilderFactory.CreateBuilder(serverFeatures);

                // define middleware
                branchBuilder.Use(async (context, next) =>
                {
                    using (var scope = factory.CreateScope())
                    {
                        context.RequestServices = scope.ServiceProvider;
                        await next();
                    }
                });

                // var clientLifetime = branchBuilder.ApplicationServices.GetService<IApplicationLifetime>();
                // clientLifetime.ApplicationStarted.Register(() =>
                // {

                // });

                _methods.ConfigureDelegate(branchBuilder);

                _RequestDelegate = branchBuilder.Build();


            }

            public IServiceProvider ConfigureServices(IServiceCollection services)
            {
                try
                {
                    return _methods.ConfigureServicesDelegate(services);
                }
                catch (Exception ex)
                {
                    if (ex is TargetInvocationException)
                    {
                        ExceptionDispatchInfo.Capture(ex.InnerException).Throw();
                    }

                    throw;
                }
            }
        }


        internal static IWebHost MakeWebHost<TStartup>(IApplicationBuilder builder, IAppSettings appSettings, AppEvents appEvents) where TStartup : class
        {
            var hostServiceProvider = builder.ApplicationServices;
            var appKey = typeof(Startup).GetTypeInfo().Assembly.FullName;
            return WebHost
                .CreateDefaultBuilder()
                .ConfigureServices(s =>
                {

                    // we need to keep the context accessor 
                    // in order to access the right singleton containing
                    // the http context.
                    var contextaccessor = hostServiceProvider.GetService<IHttpContextAccessor>();
                    s.TryAddSingleton(contextaccessor);

                    // make appsettings available in the client appp
                    s.TryAddSingleton<IAppSettings>(appSettings);

                    // make appevents available in the client app 
                    // using IAppEvents and the implementation type
                    s.TryAddSingleton<IAppEvents>(appEvents);
                    s.TryAddSingleton<AppEvents>(appEvents);



                    s.AddSingleton<IStartup>(clientServiceProvider =>
                        new WebHostStartup<TStartup>(builder, hostServiceProvider, clientServiceProvider)
                    );
                })
                .UseSetting(WebHostDefaults.ApplicationKey, appKey)
                .Build();
        }

    }
}