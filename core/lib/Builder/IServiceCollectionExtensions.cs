using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Configuration;
using our.orders.Helpers;
using our.orders.Services;
using our.orders.Models;
using System.Linq;
using System;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace our.orders.Builder
{

    /// <summary>
    /// Extensions for the host IServiceCollection
    /// </summary>
    public static class IServiceCollectionExtensions
    {

        /// <summary>
        /// Adds Our Orders using the provided section (defaults to 'our-orders') of the appsettings.json file.
        /// </summary>
        /// <param name="services"></param>
        /// <param name="configuration"></param>
        /// <param name="sectionName"></param>
        /// <returns></returns>
        public static OurOrdersBuilder AddOurOrders(this IServiceCollection services, IConfiguration configuration, string sectionName = "our-orders")
        {

            var section = configuration.GetSection(sectionName);

            return _AddOurOrders(services, section, null);
        }

        /// <summary>
        /// Adds Our Orders
        /// </summary>
        /// <param name="services"></param>
        /// <param name="configure"></param>
        /// <returns></returns>
        public static OurOrdersBuilder AddOurOrders(this IServiceCollection services, Action<IAppSettings> configure = null)
        {
            return services._AddOurOrders(null, configure);
        }

        /// <summary>
        /// Adds Our Orders
        /// </summary>
        /// <param name="services"></param>
        /// <param name="configure"></param>
        /// <returns></returns>
        private static OurOrdersBuilder _AddOurOrders(this IServiceCollection services, IConfigurationSection configuration, Action<IAppSettings> configure = null)
        {
            var builder = services.AddOurOrdersCore(configuration, configure);
            builder.UseDefaultPayments();
            return builder;
        }

        /// <summary>
        /// Adds Our Orders
        /// </summary>
        /// <param name="services"></param>
        /// <param name="configure"></param>
        /// <returns></returns>
        public static OurOrdersBuilder AddOurOrdersCore(this IServiceCollection services, IConfigurationSection configuration = null, Action<IAppSettings> configure = null)
        {


            // be sure we have an HttpContextAccessor
            services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();


            // var configurationSection =
            //               new ConfigurationBuilder()
            //                   .AddUserSecrets(assembly, true) // possible user secrets
            //                   .Build()
            //                   .GetSection("our-orders");

            var appSettings = new AppSettings();

            if (configuration != null)
            {
                configuration.Bind(appSettings);
                appSettings.Configuration = configuration;
            }
            if (configure != null)
            {
                configure(appSettings);
            }

            services.AddSingleton<Startup>();

            services.AddSingleton<IAppSettings>(appSettings);

            var appEvents = new AppEvents();
            services.AddSingleton<AppEvents>(appEvents);

            // add order and product services to the host services
            services.AddTransient<OrderService, OrderService>(s => appEvents.Services.GetService<OrderService>());
            services.AddTransient<ProductService, ProductService>(s => appEvents.Services.GetService<ProductService>());
            services.AddTransient<IService<IClient>>(s => appEvents.Services.GetService<IService<IClient>>());
            
            var builder = new OurOrdersBuilder(appSettings, appEvents, services);

            services.AddSingleton<OurOrdersBuilder>(builder);

            return builder;
        }
    }
}