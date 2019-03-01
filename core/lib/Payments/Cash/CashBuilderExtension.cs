using System;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using our.orders.Builder;
using our.orders.Helpers;

namespace our.orders.Payments.Cash
{
    public static class CashBuilderExtension
    {
        public static OurOrdersBuilder UseCashPayments(this OurOrdersBuilder builder)
        {
            builder.AppEvents.Configure += (sender, services) =>
            {
                services.AddTransient<IPaymentProvider, CashPaymentProvider>();
            };

            return builder;
        }

    }
}