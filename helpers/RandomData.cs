using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Bogus;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using our.orders;
using our.orders.Helpers;
using our.orders.Identity;
using our.orders.Models;
using our.orders.Repositories;
using our.orders.Services;

namespace our.orders.helpers
{
    public class RandomData
    {
        public readonly Configuration configuration;
        public readonly AppEvents appEvents;
        public readonly IAppSettings appSettings;
        public readonly IMapper mapper;
        public readonly UserManager userManager;
        public readonly IService<IShippingTemplate> shippingTemplateService;
        public readonly IService<Movement> movementService;
        public readonly IService<IProduct> productService;
        public readonly IService<StockUnit> stockUnitService;
        public readonly OrderService orderService;
        public readonly IService<Voucher> voucherService;
        public readonly IService<IClient> clientService;
        public readonly IService<Category> categoryService;
        public readonly IService<Warehouse> warehouseService;
        public readonly IService<Shop> shopService;

        public RandomData(
            Configuration configuration,
            AppEvents appEvents,
            IAppSettings appSettings,
            IMapper mapper,
            UserManager userManager,
            IService<IShippingTemplate> shippingTemplateService,
            IService<Movement> movementService,
            IService<IProduct> productService,
            IService<StockUnit> stockUnitService,
            OrderService orderService,
            IService<Voucher> voucherService,
            IService<IClient> clientService,
            IService<Category> categoryService,
            IService<Warehouse> warehouseService,
            IService<Shop> shopService
            )
        {
            this.mapper = mapper;
            this.appSettings = appSettings;
            this.appEvents = appEvents;
            this.configuration = configuration;
            this.userManager = userManager;
            this.shippingTemplateService = shippingTemplateService;
            this.movementService = movementService;
            this.productService = productService;
            this.stockUnitService = stockUnitService;
            this.orderService = orderService;
            this.voucherService = voucherService;
            this.clientService = clientService;
            this.categoryService = categoryService;
            this.warehouseService = warehouseService;
            this.shopService = shopService;
        }


        private async Task<IEnumerable<User>> _CreateTestUsersAsync(int number = 3)
        {
            var faker = new Faker();

            var users = RandomObjects.RandomPerson().Generate(number).Select((person, i) =>
                {
                    var shop = faker.PickRandom(TestShops);
                    return new Tuple<User, string>(
                        new User
                        {
                            FirstName = person.FirstName,
                            LastName = person.LastName,
                            UserName = $"admin-{i}",
                            Email = person.Email,
                            ShopId = shop.Id,
                            Note = $"admin-{i}-Pa$$w0rd",
                            Roles = new List<string>() { Role.Normalize(RoleStore.ADMIN) }
                        },
                        $"admin-{i}-Pa$$w0rd"
                    );
                }
            ).ToList();


            foreach (var tpl in users)
            {
                await userManager.CreateAsync(tpl.Item1, tpl.Item2);
            }


            return users.Select(u => u.Item1);
        }

        private async Task<IEnumerable<IOrder>> _CreateOrdersAsync(IEnumerable<User> users, IEnumerable<IClient> clients, IEnumerable<Shop> shops, IEnumerable<Warehouse> warehouses, IEnumerable<IProduct> products)
        {

            var OrderWithClients = RandomObjects.RandomOrder(mapper, users, configuration.Currencies.Select(c => c.Code), clients, shops);
            var OrderWithoutClients = RandomObjects.RandomOrder(mapper, users, configuration.Currencies.Select(c => c.Code), shops);

            var fromClients = OrderWithClients.WithItems(2).Generate(10).Select(o => { o.Reference += "-client"; return o; }).ToList();
            var withoutSubItems = OrderWithClients.WithItems(1).Generate(20).Select(o => { o.Reference += "-client-subitems"; return o; }).ToList();

            var fromPersons = OrderWithoutClients.WithItems(1).Generate(30).Select(o => { o.Reference += "-noclient"; return o; }).ToList();
            var withSubItems = OrderWithoutClients.WithItems(2).Generate(20).Select(o => { o.Reference += "-noclient-subitems"; return o; }).ToList();

            var carts = OrderWithoutClients.WithItems(1).Generate(5).Select(o => { o.Reference += "-noclient-cart"; return o; }).ToList();
            var cartsClients = OrderWithoutClients.WithItems(1).Generate(5).Select(o => { o.Reference += "-client-cart"; return o; }).ToList();
            var emptyItems = OrderWithoutClients.Generate(40).Select(o => { o.Reference += "-noclient-empty"; return o; }).ToList();

            var fromProducts = OrderWithoutClients.WithProduct(mapper, products).Generate(40).Select(o => { o.Reference += "-noclient-products"; return o; }).ToList();
            var fromProductsWithClients = OrderWithClients.WithProduct(mapper, products).Generate(30).Select(o => { o.Reference += "-client-products"; return o; }).ToList();

            var withDispatchInfos = OrderWithoutClients.WithDispatchedItems(warehouses).Generate(30).Select(o => { o.Reference += "-dispatch"; return o; }).ToList();
            var withDispatchInfosWithClients = OrderWithClients.WithDispatchedItems(warehouses).Generate(30).Select(o => { o.Reference += "-dispatch-clients"; return o; }).ToList();

            var all = new IEnumerable<IOrder>[] {
                // carts,
                // cartsClients,
                // fromClients,
                // fromPersons,
                // withSubItems,
                // withoutSubItems,
                // emptyItems,
                // fromProducts,
                fromProductsWithClients,
                // withDispatchInfos,
                withDispatchInfosWithClients
            }.SelectMany(x => x);

            foreach (var order in all)
            {
                await orderService.UpdateValuesAsync(order);
            }

            var allshuffled = new Faker().Random.Shuffle(all);

            return await orderService.CreateManyAsync(allshuffled); ;
        }

        public IEnumerable<IClient> TestClients { get; private set; }

        private async Task<IEnumerable<IClient>> _CreateTestClientsAsync(int number = 400)
        {

            TestClients = await clientService.CreateManyAsync(RandomObjects.RandomClient().Generate(number));
            return TestClients;
        }


        public IEnumerable<Shop> TestShops { get; private set; }

        private async Task<IEnumerable<Shop>> _CreateTestShopsAsync()
        {

            TestShops = await shopService.CreateManyAsync(RandomObjects.RandomShop().Generate(3));

            return TestShops;
        }



        private async Task<IEnumerable<Category>> _CreateTestCategoriesAsync(int number = 8)
        {

            return await categoryService.CreateManyAsync(RandomObjects.RandomCategory().Generate(number));
        }




        private async Task<IEnumerable<Warehouse>> _CreateTestWarehousesAsync(int number = 5)
        {

            return await warehouseService.CreateManyAsync(RandomObjects.RandomWarehouse().Generate(number));
        }

        private async Task<IEnumerable<IProduct>> _CreateTestProductsAsync(IEnumerable<Category> categories, IEnumerable<Warehouse> warehouses)
        {

            var f = new Faker();
            /// init Products : 
            var products = RandomObjects.RandomProduct(categories, 1).Generate(50);
            var productswithSub = RandomObjects.RandomProduct(categories, 2).Generate(10);
            var allProducts = await productService.CreateManyAsync(products.Concat(productswithSub));

            var stockUnits = new List<StockUnit>();
            foreach (var product in allProducts)
            {

                var stockunit = RandomObjects.RandomStockUnit(product, warehouses.Select(w => w.Id).ToArray()).Generate();
                stockUnits.Add(stockunit);
                foreach (var subproduct in product.Products)
                {
                    var substockunit = RandomObjects.RandomStockUnit(subproduct, warehouses.Select(w => w.Id).ToArray()).Generate();
                    stockUnits.Add(substockunit);
                }


            }
            await stockUnitService.CreateManyAsync(stockUnits);

            return allProducts;

        }


        private async Task<IEnumerable<Movement>> _CreateTestMovementsAsync(IEnumerable<Shop> shops, IEnumerable<User> users)
        {

            /// init Products : 
            var mvts = RandomObjects.RandomMovement(DateTime.UtcNow.AddDays(-5), DateTime.UtcNow, configuration.Currencies?.Select(c => c.Code), 10, 100, shops, users).Generate(50);




            return await movementService.CreateManyAsync(mvts);
        }



        private async Task<IEnumerable<Voucher>> _CreateTestVouchersAsync(IEnumerable<IOrder> orders, int number = 50)
        {

            var vouchers = RandomObjects.RandomVoucher(DateTime.UtcNow.AddYears(-1), DateTime.UtcNow.AddYears(1), configuration.Currencies.Select(c => c.Code), 10, 100, orders).Generate(number);

            return await voucherService.CreateManyAsync(vouchers);
        }
        private async Task<IEnumerable<IShippingTemplate>> _CreateTestShippingAsync(int number = 20)
        {

            /// init Products : 
            var shippingTemplates = Enumerable.Range(0, number).Select(i => new ShippingTemplate
            {
                BasePrice = new Price[] { new Price { Value = Convert.ToDecimal(i * 100), Currency = "EUR" }, new Price { Value = Convert.ToDecimal(i * 200), Currency = "CHF" } },
                PerGram = new ShippingPrice[] {
                    new ShippingPrice {
                        Base = new Price[] {
                            new Price { Value = Convert.ToDecimal(i * 10), Currency = "EUR" },
                            new Price { Value = Convert.ToDecimal(i * 200), Currency = "CHF" }
                        }
                    }
                },
                Title = $"ShippingOption {i}",
                Description = $"{i * 10} eur per gram + {i * 100} eur",

            });



            return await shippingTemplateService.CreateManyAsync(shippingTemplates);
        }


        public async Task<RandomData> Generate()
        {
            // ... initialize data in the test database ...
            var shops = await _CreateTestShopsAsync();
            var warehouses = await _CreateTestWarehousesAsync();
            var categories = await _CreateTestCategoriesAsync();
            var users = await _CreateTestUsersAsync();
            var clients = await _CreateTestClientsAsync();
            var products = await _CreateTestProductsAsync(categories, warehouses);
            var orders = await _CreateOrdersAsync(users, clients, shops, warehouses, products);
            var vouchers = await _CreateTestVouchersAsync(orders);
            var shippings = await _CreateTestShippingAsync();
            var movements = await _CreateTestMovementsAsync(shops, users);

            return this;
        }
    }
}