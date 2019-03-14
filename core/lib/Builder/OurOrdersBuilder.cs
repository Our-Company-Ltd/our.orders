using our.orders.Helpers;
using our.orders.Identity;
using Microsoft.Extensions.DependencyInjection;
using System.Linq;
using System.Collections.Generic;
using our.orders.Models;
using our.orders.Services;
using System;

namespace our.orders.Builder
{
    /// <summary>
    /// An class for configuring Our Orders services.
    /// </summary>
    public class OurOrdersBuilder
    {
        /// <summary>
        /// Gets the <see cref="IAppSettings"/> where settings are stored.
        /// </summary>
        public readonly IAppSettings AppSettings;

        /// <summary>
        /// Gets the <see cref="IAppEvents"/>
        /// </summary>
        public IAppEvents AppEvents => appEvents;

        /// <summary>
        /// Gets the host <see cref="IServiceCollection"/>
        /// </summary>
        public IServiceCollection HostServices { get; }

        /// <summary>
        /// Gets the host <see cref="IServiceCollection"/>
        /// </summary>
        public IServiceProvider OurOrdersServices { get; }

        /// <summary>
        /// Gets the <see cref="AppEvents"/>
        /// </summary>
        internal readonly AppEvents appEvents;

        /// <summary>
        /// Initializes a new <see cref="OurOrdersBuilder"/> instance.
        /// </summary>
        /// <param name="appSettings"></param>
        /// <param name="appEvents"></param>
        /// <param name="hostServices"></param>
        internal OurOrdersBuilder(IAppSettings appSettings, AppEvents appEvents, IServiceCollection hostServices)
        {
            this.AppSettings = appSettings;
            this.appEvents = appEvents;
            HostServices = hostServices;
        }

    }

    /// <summary>
    /// Extensions for configuring Our Orders using a <see cref="OurOrdersBuilder"/>.
    /// </summary>
    public static class OurOrdersBuilderExtensions
    {
        /// <summary>
        /// Ensure an admin user with the passed credential exists, creates it if it doesn't find it.
        /// </summary>
        /// <param name="builder"></param>
        /// <param name="username"></param>
        /// <param name="password"></param>
        /// <returns></returns>
        public static OurOrdersBuilder WithAdmin(this OurOrdersBuilder builder, string username, string password)
        {
            builder.AppEvents.ApplicationStarted += (sender, serviceProvider) =>
            {
                using (var scope = serviceProvider.CreateScope())
                {
                    var userManager = scope.ServiceProvider.GetService<UserManager>();
                    var old = AsyncHelper.RunSync(() => userManager.FindByNameAsync(username));
                    if (old != null) return;

                    var result = AsyncHelper.RunSync(() => userManager.CreateAsync(new User()
                    {
                        UserName = username,
                        Email = ""
                    }, password));

                    if (!result.Succeeded)
                    {
                        var errors = result.Errors.Select(e => $"{e.Code}: {e.Description}");
                        throw new AppException($"impossible to create the admin: {string.Join(", ", errors)}");
                    }
                    var user = AsyncHelper.RunSync(() => userManager.FindByNameAsync(username));
                    userManager.AddToRoleAsync(user, RoleStore.ADMIN);
                }

            };
            return builder;
        }

        /// <summary>
        /// Ensure the passed shops exists in the Repository. Creates them if there is non with the same name.
        /// </summary>
        /// <param name="builder"></param>
        /// <param name="shops"></param>
        /// <returns></returns>
        public static OurOrdersBuilder WithShops(this OurOrdersBuilder builder, params Shop[] shops)
        {
            builder.AppEvents.ApplicationStarted += (sender, serviceProvider) =>
            {
                var shopService = serviceProvider.GetService<IService<Shop>>();
                foreach (var shop in shops)
                {
                    var old = AsyncHelper.RunSync(() => shopService.FindAsync(Filter.Eq("Name", shop.Name)));
                    if (old.Any()) continue;

                    AsyncHelper.RunSync(() => shopService.CreateAsync(shop));
                }
            };
            return builder;
        }
    }
}