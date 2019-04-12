using System.Reflection;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using our.orders.Builder;
using our.orders.Helpers;
using our.orders.Identity;
using our.orders.Models;
using our.orders.Statistics;

namespace our.orders.Repositories.InMemory
{

    public static partial class AppSettingsExtensions
    {
        public static OurOrdersBuilder UseInMemoryDB(this OurOrdersBuilder builder)
        {
            var appsettings = builder.AppSettings;

            builder.AppEvents.Configure += (sender, services) =>
              {
                  services.AddSingleton<IRepository<IOrder>>((s) => new InMemoryRepository<Order, IOrder>(s));
                  services.AddSingleton<IRepository<IProduct>>((s) => new InMemoryRepository<Product, IProduct>(s));
                  services.AddSingleton<IRepository<IClient>>((s) => new InMemoryRepository<Client, IClient>(s));

                  services.AddSingleton<IRepository<IShippingTemplate>>((s) => new InMemoryRepository<ShippingTemplate, IShippingTemplate>(s));
                  //   services.AddSingleton<IRepository<IStatisticEvent>>((s) => new InMemoryProvider<StatisticEvent, IStatisticEvent>(s));
                  services.AddSingleton<IRepository<Shop>>((s) => new InMemoryRepository<Shop, Shop>(s));

                  services.AddSingleton<IRepository<Movement>>((s) => new InMemoryRepository<Movement, Movement>(s));
                  services.AddSingleton<IRepository<Voucher>>((s) => new InMemoryRepository<Voucher, Voucher>(s));
                  services.AddSingleton<IRepository<StockUnit>>((s) => new InMemoryRepository<StockUnit, StockUnit>(s));

                  services.AddSingleton<IRepository<Warehouse>>((s) => new InMemoryRepository<Warehouse, Warehouse>(s));
                  services.AddSingleton<IRepository<Category>>((s) => new InMemoryRepository<Category, Category>(s));
                  services.AddSingleton<IRepository<DocumentTemplate>>((s) => new InMemoryRepository<DocumentTemplate, DocumentTemplate>(s));
                  services.AddScoped<IRepository<PaymentNotificationTemplate>>((s) => new InMemoryRepository<PaymentNotificationTemplate, PaymentNotificationTemplate>(s));

                  services.AddSingleton<IRepository<User>>((s) => new InMemoryRepository<User, User>(s));

                  services.AddSingleton<IUserStore<User>, RepositoryUserStore>();

                  var identityBuilder = services
                                        .AddIdentity<User, Role>()
                                        .AddUserManager<UserManager>()
                                        .AddRoleManager<RoleManager>()
                                        .AddDefaultTokenProviders();
              };


            return builder;
        }
    }
}