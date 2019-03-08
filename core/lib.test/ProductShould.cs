using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using MongoDB.Driver;
using our.orders.Helpers;
using our.orders.Models;
using our.orders.Repositories;
using our.orders.Services;
using our.orders.test.Fixtures;
using our.orders.test.Services;
using Xunit;


namespace our.orders.test
{
    public class ProductShould : IClassFixture<DatabaseFixture>
    {

        private readonly DatabaseFixture databaseFixture;


        private OrderService orderService => this.databaseFixture.RandomData.orderService;

        private readonly CancellationToken cancellationToken = default(CancellationToken);

        public ProductShould(DatabaseFixture databaseFixture)
        {
            this.databaseFixture = databaseFixture;
        }


        [Theory]
        [InlineData(5, "EUR")]
        [InlineData(3, "CHF")]
        public async Task ConvertToItem(int index, string currency)
        {
            var order = new Order
            {
                Currency = currency
            };
            var products = await this.databaseFixture.RandomData.productService.FindAsync();

            var product = products.ElementAt(index);

            var mapper = this.databaseFixture.Mapper;
            var configuration = this.databaseFixture.Configuration;
            var settings = this.databaseFixture.AppSettings;
            var item = product.ToOrderItem(order, settings, mapper, configuration);

            Assert.Equal(product.SKU, item.SKU);
            await orderService.AddItemAsync(order, item, cancellationToken).ContinueWith(t =>
            {
                if (t.IsFaulted) throw t.Exception;
                var finalprice = item.FinalPrice;
                Assert.Equal(finalprice, order.Price);
            });
        }

        [Theory]
        [InlineData(5, 2000)]
        [InlineData(3, 130)]
        public async Task CalculateWeight(int quantity, decimal weight)
        {
            var order = new Order
            {

            };

            // creates a product with 50 % tax included :
            var product = new Product
            {
                Title = "heavy product",
                Weight = weight,
                Products = new Product[] {
                    new Product { Weight = 200, MinQuantity = 2},
                    new Product { Weight = 250, MinQuantity = 10}
                }
            };

            var mapper = this.databaseFixture.Mapper;
            var configuration = this.databaseFixture.Configuration;
            var settings = this.databaseFixture.AppSettings;
            var item = product.ToOrderItem(order, settings, mapper, configuration);

            item.Quantity = quantity;

            await orderService.AddItemAsync(order, item, cancellationToken).ContinueWith(t =>
            {
                if (t.IsFaulted) throw t.Exception;
                var expectedfinal = product.Weight * quantity + product.Products.Sum(p => p.Weight * p.MinQuantity);
                Assert.Equal(expectedfinal.Value, order.Weight, 3);

            });

        }

        // [Theory]
        // [InlineData(5, 10.66, "EUR", 1)]
        // [InlineData(3, 50.66, "CHF", 5)]
        // public async Task CalculateShipping(int quantity, double weight, string currency, int shippingIndex)
        // {
        //     var order = new Order
        //     {
        //         Currency = currency
        //     };

        //     // creates a product with 50 % tax included :
        //     var product = new Product
        //     {
        //         Title = "heavy product",
        //         Weight = weight,
        //         Products = new Product[] {
        //             new Product { Weight = 200},
        //             new Product { Weight = 250}
        //         }
        //     };



        //     var item = this.databaseFixture.Mapper.Map<OrderItem>(product, order.Currency);
        //     item.Quantity = quantity;

        //     var shippingTemplate = this.databaseFixture.TestShippings.ElementAt(shippingIndex) as ShippingTemplate;

        //     await orderService.SetShipping(order, shippingTemplate, cancellationToken).ContinueWith(t =>
        //     {
        //         if (t.IsFaulted) throw t.Exception;
        //         Assert.NotNull(order.Shipping);
        //         Assert.Equal(order.Shipping.Title, String.Format(shippingTemplate.Title, order));
        //         // Assert.NotEqual(order.Shipping.FinalPrice, 0);
        //     });

        // }

        [Theory]
        [InlineData(5, 10, "EUR")]
        [InlineData(3, 50, "CHF")]
        public async Task CalculateIncludedTax(int quantity, decimal amount, string currency)
        {

            var order = new Order
            {
                Currency = currency
            };

            // creates a product with 50 % tax included :
            var product = new Product
            {
                Title = "high Tax product",
                BasePrice = new Price[] { new Price { Currency = currency, Value = amount } },
                TaxRateIncluded = 0.5m,

            };

            var mapper = this.databaseFixture.Mapper;
            var configuration = this.databaseFixture.Configuration;
            var settings = this.databaseFixture.AppSettings;
            var item = product.ToOrderItem(order, settings, mapper, configuration);

            item.Quantity = quantity;

            await orderService.AddItemAsync(order, item, cancellationToken).ContinueWith(t =>
            {
                if (t.IsFaulted) throw t.Exception;
                var expectedfinal = quantity * amount;
                Assert.Equal(expectedfinal, order.Total, 3);

                var expectedtax = expectedfinal / 2;
                Assert.Equal(expectedtax, order.Tax, 3);
            });

        }

        [Theory]
        [InlineData(5, 100, 0.2, "EUR")]
        [InlineData(1, 10, 0.05, "CHF")]
        public async Task CalculateExcludedTax(int quantity, decimal amount, decimal rate, string currency)
        {
            var order = new Order
            {
                Currency = currency
            };

            // creates a product with tax included :
            var product = new Product
            {
                Title = "high Tax product",
                BasePrice = new Price[] {
                    new Price {
                        Currency = currency,
                        Value = amount
                        }
                },
                TaxRateExcluded = rate,

            };

            var mapper = this.databaseFixture.Mapper;
            var configuration = this.databaseFixture.Configuration;
            var settings = this.databaseFixture.AppSettings;
            var item = product.ToOrderItem(order, settings, mapper, configuration);

            item.Quantity = quantity;

            await orderService.AddItemAsync(order, item, cancellationToken).ContinueWith(t =>
            {
                var expectedfinal = quantity * amount + (quantity * amount * product.TaxRateExcluded);
                Assert.Equal(expectedfinal.Value, order.Total, 3);

                var expectedtax = quantity * amount * rate;
                Assert.Equal(expectedtax, order.Tax, 3);
            });

        }

    }
}