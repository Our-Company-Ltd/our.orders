using System.Linq;
using System.Reflection;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Bson;
using MongoDB.Bson.Serialization;
using MongoDB.Bson.Serialization.Conventions;
using MongoDB.Bson.Serialization.IdGenerators;
using MongoDB.Bson.Serialization.Serializers;
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
                              services.AddSingleton<IRepository<Shop>>((s) => CreateRepository<Shop>(database));
                              services.AddSingleton<IRepository<Movement>>((s) => CreateRepository<Movement>(database));
                              services.AddSingleton<IRepository<Voucher>>((s) => CreateRepository<Voucher>(database));
                              services.AddSingleton<IRepository<StockUnit>>((s) => CreateRepository<StockUnit>(database));
                              services.AddSingleton<IRepository<Warehouse>>((s) => CreateRepository<Warehouse>(database));
                              services.AddSingleton<IRepository<Category>>((s) => CreateRepository<Category>(database));
                              services.AddSingleton<IRepository<DocumentTemplate>>((s) => CreateRepository<DocumentTemplate>(database));
                              services.AddSingleton<IRepository<PaymentNotificationTemplate>>((s) => CreateRepository<PaymentNotificationTemplate>(database));

                              // be sure the user is registered in the DI before used in the identity builder
                              var userRepository = CreateRepository<User>(database);
                              services.AddSingleton<IRepository<User>>((s) => userRepository);

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
            // collection.Indexes.CreateOne()

        }
        private static void _EnsureClassMap<TImplementation>() where TImplementation : class, IModel
        {
            if (BsonClassMap.IsClassMapRegistered(typeof(TImplementation))) return;

            if (typeof(TImplementation).Extends<Model>())
            {
                _EnsureClassMap<Model>();
            }
            BsonClassMap.RegisterClassMap<TImplementation>(_ApplyClassMap);
        }
        private static void _ApplyClassMap<TImplementation>(BsonClassMap<TImplementation> cm) where TImplementation : class, IModel
        {
            cm.AutoMap();

            var idMember = typeof(TImplementation)
                .GetMember("Id",
                    System.Reflection.BindingFlags.Public
                    | System.Reflection.BindingFlags.Instance
                    | System.Reflection.BindingFlags.DeclaredOnly
                ).FirstOrDefault();

            if (idMember != null)
            {
                cm
                    .MapIdMember(idMember)
                    .SetElementName("_id")
                    .SetSerializer(new StringSerializer(BsonType.ObjectId))
                    .SetDefaultValue(() => ObjectId.GenerateNewId())
                    .SetIdGenerator(StringObjectIdGenerator.Instance);
            }

            cm.SetIgnoreExtraElements(true);
        }

        public static IRepository<TInterface> CreateProvider<TImplementation, TInterface>(IMongoDatabase database) where TImplementation : class, TInterface where TInterface : IModel
        {
            var interfaceType = typeof(TInterface);
            _EnsureClassMap<TImplementation>();
            var collectionname = interfaceType.Name;
            var mongoCollection = database.GetCollection<TImplementation>(collectionname);
            _EnsureIndex(mongoCollection);

            return new MongoProvider<TImplementation, TInterface>(mongoCollection) as IRepository<TInterface>;
        }


        public static IRepository<TModel> CreateRepository<TModel>(IMongoDatabase database) where TModel : class, IModel
        {
            var modelType = typeof(TModel);
            _EnsureClassMap<TModel>();
            var collectionname = modelType.Name;
            var mongoCollection = database.GetCollection<TModel>(collectionname);
            _EnsureIndex(mongoCollection);

            return new MongoProvider<TModel, TModel>(mongoCollection) as IRepository<TModel>;
        }
    }
}