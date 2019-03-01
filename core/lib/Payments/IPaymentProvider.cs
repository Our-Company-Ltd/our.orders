using System.Threading;
using System.Threading.Tasks;
using our.orders.Models;

namespace our.orders.Payments
{
    public interface IPaymentProvider
    {
        string Name { get; }

    }


   

    public abstract class PaymentProvider<TransactionBinding> : IPaymentProvider
    {
        public abstract string Name { get; }

        public abstract Task<IOrder> ChargeAsync(TransactionBinding bindings, CancellationToken cancellationToken = default(CancellationToken));
    }


}
