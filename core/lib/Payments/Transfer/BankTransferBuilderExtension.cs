using System;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using our.orders.Builder;
using our.orders.Helpers;
using our.orders.Payments;
using our.orders.Payments.BankTransfer;

namespace our.orders
{
    public static class BankTransferBuilderExtension
    {
        public static OurOrdersBuilder UseBankTransfers(this OurOrdersBuilder builder)
        {
            builder.AppEvents.Configure += (sender, services) =>
                      {
                          services.AddTransient<IPaymentProvider, BankTransferPaymentProvider>();
                          services.AddTransient<BankTransferPaymentProvider>();
                      };

            builder.HostServices.AddTransient<IPaymentProvider, BankTransferPaymentProvider>();
            builder.HostServices.AddTransient<BankTransferPaymentProvider>();

            return builder;
        }

    }
}