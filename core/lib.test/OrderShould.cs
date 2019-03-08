using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using MongoDB.Driver;
using our.orders.Models;
using our.orders.Repositories;
using our.orders.Services;
using our.orders.test.Fixtures;
using our.orders.test.Services;
using Xunit;


namespace our.orders.test
{
    public class OrderShould : IClassFixture<DatabaseFixture>
    {
        private readonly DatabaseFixture databaseFixture;
        private OrderService orderService => this.databaseFixture.RandomData.orderService;

        private readonly CancellationToken cancellationToken = default(CancellationToken);

        public OrderShould(DatabaseFixture databaseFixture)
        {
            this.databaseFixture = databaseFixture;
        }


        [Theory]
        [InlineData("EUR", 500, 300)]
        [InlineData("CHF", 500, 500)]
        public async Task RegisterPayment(string currency, decimal total, decimal amount)
        {
            var order = new Order
            {
                Currency = currency,

            };

            var item = new OrderItem() { Price = new Amount { Base = total } };
            await orderService.AddItemAsync(order, item, cancellationToken).ContinueWith(async t =>
            {
                if (t.IsFaulted) throw t.Exception;
                var payment = new Payment
                {
                    Amount = amount,
                    Status = PaymentStatus.Paid
                };

                await orderService.AddPayment(order, payment, cancellationToken).ContinueWith(ta =>
                {
                    if (ta.IsFaulted) throw ta.Exception;
                    Assert.Equal(total <= amount, order.Paid);
                });

            }).Unwrap();
        }


    }
}