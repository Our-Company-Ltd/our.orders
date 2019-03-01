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

            var configurationSection = configuration.GetSection(sectionName);
            if (configurationSection != null)
                return AddOurOrders(services, (appsettings) => configurationSection.Bind(appsettings));
            else
                return AddOurOrders(services);
        }

        /// <summary>
        /// Adds Our Orders
        /// </summary>
        /// <param name="services"></param>
        /// <param name="configure"></param>
        /// <returns></returns>
        public static OurOrdersBuilder AddOurOrders(this IServiceCollection services, Action<IAppSettings> configure = null)
        {
            var builder = services.AddOurOrdersCore(configure);
            builder.UseDefaultPayments();
            return builder;
        }

        /// <summary>
        /// Adds Our Orders
        /// </summary>
        /// <param name="services"></param>
        /// <param name="configure"></param>
        /// <returns></returns>
        public static OurOrdersBuilder AddOurOrdersCore(this IServiceCollection services, Action<IAppSettings> configure = null)
        {
            // be sure we have an HttpContextAccessor
            services.TryAddSingleton<IHttpContextAccessor, HttpContextAccessor>();

            services.TryAddTransient<OrderService, OrderService>();
            var appSettings = new AppSettings();
            if (configure != null)
            {
                configure(appSettings);
            }
            
            services.AddSingleton<IAppSettings>(appSettings);

            var appEvents = new AppEvents();
            services.AddSingleton<AppEvents>(appEvents);

            // add order and product services to the host services
            services.AddTransient<OrderService, OrderService>(s => appEvents.Services.GetService<OrderService>());
            services.AddTransient<ProductService, ProductService>(s => appEvents.Services.GetService<ProductService>());

            var builder = new OurOrdersBuilder(appSettings, appEvents, services);
            services.AddSingleton<OurOrdersBuilder>(builder);
            return builder;
        }
    }
}