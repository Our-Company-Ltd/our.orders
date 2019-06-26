using System;
using System.Threading;
using System.Threading.Tasks;
using our.orders.Models;
using our.orders.Repositories;
using our.orders.Services;
namespace our.orders.Payments.BankTransfer
{
    public class BankTransferPaymentProvider : PaymentProvider<BankTransferChargeBindings>
    {
        private readonly OrderService orderService;

        public BankTransferPaymentProvider(OrderService orderService)
        {
            this.orderService = orderService;
        }

        public override string Name => "transfer";

        public override async Task<IOrder> ChargeAsync(BankTransferChargeBindings bindings, CancellationToken cancellationToken = default(CancellationToken))
        {

            var order = await this.orderService.GetByIdAsync(bindings.OrderID, cancellationToken);
            order.OrderType = OrderType.Order;
            var payment = new Payment()
            {
                Title = "Bank Transfer Payment",
                Provider = Name,
                Reference = $"transfer {DateTime.UtcNow.ToString("dd/MM/yyyy")}  {DateTime.UtcNow.ToString("HH:mm")}",
                Status = PaymentStatus.Pending,
                Date = DateTime.UtcNow,
                Method = PaymentMethod.Electronic,
                Details = $"Payment Order #{order.Reference}",
                Currency = order.Currency,
                Amount = bindings.Amount
            };

            await orderService.AddPayment(order, payment, cancellationToken);

            return order;
        }
    }
}