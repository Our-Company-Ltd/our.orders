using System.Linq;
using System.Reflection;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Bson.Serialization.IdGenerators;
using MongoDB.Driver;
using our.orders.Builder;
using our.orders.Helpers;
using our.orders.Identity;
using our.orders.Models;
using our.orders.Statistics;

namespace our.orders.Repositories.mongoDb
{
    public static class MongoDBBuilderExtensions
    {


        public static OurOrdersBuilder UseMongoDB(this OurOrdersBuilder builder, IMongoDatabase database)
        {
            builder.AppEvents.Configure += (sender, services) =>
                          {
                              services.AddSingleton<IRepository<IOrder>>((s) => CreateProvider<Order, IOrder>(database));
                              services.AddSingleton<IRepository<IProduct>>((s) => CreateProvider<Product, IProduct>(database));
                              services.AddSingleton<IRepository<IClient>>((s) => CreateProvider<Client, IClient>(database));
                              services.AddSingleton<IRepository<IShippingTemplate>>((s) => CreateProvider<ShippingTemplate, IShippingTemplate>(database));
                              services.AddSingleton<IRepository<Shop>>((s) => CreateProvider<Shop>(database));
                              services.AddSingleton<IRepository<Movement>>((s) => CreateProvider<Movement>(database));
                              services.AddSingleton<IRepository<Voucher>>((s) => CreateProvider<Voucher>(database));
                              services.AddSingleton<IRepository<StockUnit>>((s) => CreateProvider<StockUnit>(database));
                              services.AddSingleton<IRepository<Warehouse>>((s) => CreateProvider<Warehouse>(database));
                              services.AddSingleton<IRepository<Category>>((s) => CreateProvider<Category>(database));
                              services.AddSingleton<IRepository<DocumentTemplate>>((s) => CreateProvider<DocumentTemplate>(database));

                              services.AddSingleton<IRepository<User>>((s) => CreateProvider<User>(database));

                              services.AddSingleton<IUserStore<User>, RepositoryUserStore>();



                              var identityBuilder = services
                                    .AddIdentity<User, Role>()
                                    .AddUserManager<UserManager>()
                                    .AddRoleManager<RoleManager>()
                                    .AddDefaultTokenProviders();
                          };


            var pack = new ConventionPack();
            pack.Add(new IgnoreExtraElementsConvention(true));

            ConventionRegistry.Register(
               "Our Orders",
               pack,
               t => t.FullName.StartsWith("our.orders"));
            return builder;
        }
        private static void _EnsureIndex<TImplementation>(IMongoCollection<TImplementation> collection) where TImplementation : class, IModel
        {
            BsonClassMap.RegisterClassMap<TImplementation>(cm =>
              {
                  cm.AutoMap();
                  cm.MapIdMember(c => c.Id).SetElementName("Id").SetIdGenerator(StringObjectIdGenerator.Instance);
                  cm.SetIgnoreExtraElements(true);
              });
        }


        public static IRepository<TInterface> CreateProvider<TImplementation, TInterface>(IMongoDatabase database) where TImplementation : class, TInterface where TInterface : IModel
        {
            var interfaceType = typeof(TInterface);

            var collectionname = interfaceType.Name;
            var mongoCollection = database.GetCollection<TImplementation>(collectionname);
            _EnsureIndex(mongoCollection);

            return new MongoProvider<TImplementation, TInterface>(mongoCollection) as IRepository<TInterface>;
        }


        public static IRepository<TModel> CreateProvider<TModel>(IMongoDatabase database) where TModel : class, IModel
        {
            var modelType = typeof(TModel);

            var collectionname = modelType.Name;
            var mongoCollection = database.GetCollection<TModel>(collectionname);
            _EnsureIndex(mongoCollection);

            return new MongoProvider<TModel, TModel>(mongoCollection) as IRepository<TModel>;
        }
    }
}