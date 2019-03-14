using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using Microsoft.Extensions.DependencyInjection;
using System.Threading;
using System.Threading.Tasks;
using Bogus;
using MongoDB.Bson;
using MongoDB.Driver;
using our.orders.helpers;
using our.orders.Identity;
using our.orders.Models;
using our.orders.Services;
using our.orders.test.Fixtures;
using Xunit;


namespace our.orders.test.Services
{
    public class OrdersServiceShould : ServicesTestBase<OrderService, IOrder>
    {

        public OrdersServiceShould(DatabaseFixture databaseFixture) : base(databaseFixture)
        {

        }


        [Fact]
        public override async Task BaseTests()
        {
            await base.BaseTests();
        }

        [Fact]
        public async Task UpdateCategories()
        {
            var model = await Service.NewAsync(cancellationToken);
            var result = await Service.CreateAsync(model, cancellationToken);

            var found = await Service.GetByIdAsync(result.Id, cancellationToken);
            var categories = await this.databaseFixture.RandomData.categoryService.FindAsync(cancellationToken: cancellationToken);
            var faker = new Faker();

            var orderItem1 = RandomObjects.RandomOrderItem(0).Generate();
            var cat1 = faker.PickRandom(categories, 2).Select(c => c.Id).ToList();
            orderItem1.Categories = cat1;

            var orderItem2 = RandomObjects.RandomOrderItem(0).Generate();
            var cat2 = faker.PickRandom(categories, 3).Select(c => c.Id).ToList();
            orderItem2.Categories = cat2;

            var expectedCats = cat1.Concat(cat2);

            await Service.AddItemAsync(found, orderItem1, cancellationToken);
            await Service.AddItemAsync(found, orderItem2, cancellationToken);

            Assert.Equal(expectedCats, found.Categories);
        }

        [Fact]
        public async Task CalculateShippingWithPercentItemsPrice()
        {
            // var model = await Service.NewAsync(cancellationToken);
            var model = RandomObjects.RandomOrder().Generate();
            var shippingtemplateService = this.databaseFixture.ServiceProvider.GetService<IService<IShippingTemplate>>();
            var t = await shippingtemplateService.NewAsync(cancellationToken);
            var template = t as ShippingTemplate;
            template.PercentItemsPrice = 0.1m;

            await shippingtemplateService.CreateAsync(template, cancellationToken);

            model.ShippingTemplateId = template.Id;

            var result = await Service.CreateAsync(model, cancellationToken);

            var expectedDelivery = result.Price * template.PercentItemsPrice;

            Assert.Equal(expectedDelivery, result.Delivery.Final);
        }
        


    }
}