using System;
using System.Threading;
using System.Threading.Tasks;
using our.orders.Models;
using our.orders.Repositories;
using our.orders.Services;
namespace our.orders.Payments.CCTerminal
{
    public class CCTerminalPaymentProvider : PaymentProvider<CCTerminalChargeBindings>
    {
        private readonly OrderService orderService;

        public CCTerminalPaymentProvider(OrderService orderService)
        {
            this.orderService = orderService;
        }

        public override string Name => "ccterminal";

        public override async Task<IOrder> ChargeAsync(CCTerminalChargeBindings bindings, CancellationToken cancellationToken = default(CancellationToken))
        {

            var order = await this.orderService.GetByIdAsync(bindings.OrderID, cancellationToken);

            var payment = new Payment()
            {
                Title = "Credit Card Terminal Payment",
                Provider = Name,
                Reference = bindings.Reference,
                Status = PaymentStatus.Paid,
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