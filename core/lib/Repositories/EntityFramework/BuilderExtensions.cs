using System;
using System.Linq;
using System.Reflection;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using our.orders.Builder;
using our.orders.Helpers;
using our.orders.Identity;
using our.orders.Models;
using our.orders.Statistics;

namespace our.orders.Repositories.EntityFramework
{
    public static partial class AppSettingsExtensions
    {

        public static OurOrdersBuilder UseEntityFramework(this OurOrdersBuilder builder, Action<DbContextOptionsBuilder> config)
        {
            var appsettings = builder.AppSettings;

            //builder.HostServices.AddDbContext<EFDbContext>(config);

            builder.AppEvents.Configure += (sender, services) =>
              {
                  services.AddScoped<EFDbContext>((s) => new EFDbContext(s, config));
                  services.AddScoped<IRepository<IOrder>>((s) => s.GetService<EFDbContext>().GetOrders());
                  services.AddScoped<IRepository<IProduct>>((s) => s.GetService<EFDbContext>().GetProducts());
                  services.AddScoped<IRepository<IClient>>((s) => s.GetService<EFDbContext>().GetClients());

                  services.AddScoped<IRepository<IShippingTemplate>>((s) => s.GetService<EFDbContext>().GetShippingTemplate());
                  services.AddScoped<IRepository<Shop>>((s) => s.GetService<EFDbContext>().GetShops());

                  services.AddScoped<IRepository<Movement>>((s) => s.GetService<EFDbContext>().GetMovements());
                  services.AddScoped<IRepository<Voucher>>((s) => s.GetService<EFDbContext>().GetVouchers());
                  services.AddScoped<IRepository<StockUnit>>((s) => s.GetService<EFDbContext>().GetStockUnits());

                  services.AddScoped<IRepository<Warehouse>>((s) => s.GetService<EFDbContext>().GetWarehouses());
                  services.AddScoped<IRepository<Category>>((s) => s.GetService<EFDbContext>().GetCategories());
                  services.AddScoped<IRepository<DocumentTemplate>>((s) => s.GetService<EFDbContext>().GetDocumentTemplates());
                  services.AddScoped<IRepository<PaymentMessagingTemplate>>((s) => s.GetService<EFDbContext>().GetPaymentMessagingTemplate());

                  services.AddScoped<IRepository<User>>((s) => s.GetService<EFDbContext>().GetUsers());
                  services.AddScoped<IUserStore<User>, RepositoryUserStore>();



                  var identityBuilder = services
                        .AddIdentity<User, Role>()
                        .AddUserManager<UserManager>()
                        .AddRoleManager<RoleManager>()
                        .AddDefaultTokenProviders();
              };
            builder.appEvents.ApplicationStarting += (sender, services) =>
            {
                using (var scope = services.CreateScope())
                {
                    scope.ServiceProvider.GetService<EFDbContext>().Database.EnsureCreated();
                }
            };
            return builder;
        }
    }
}