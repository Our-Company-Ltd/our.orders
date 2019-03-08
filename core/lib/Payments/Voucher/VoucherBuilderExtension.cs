using System;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using our.orders.Builder;
using our.orders.Helpers;

namespace our.orders.Payments.Voucher
{
    public static class VoucherBuilderExtension
    {
        public static OurOrdersBuilder UseVouchers(this OurOrdersBuilder builder)
        {

            builder.AppEvents.Configure += (sender, services) =>
            {
                services.AddTransient<IPaymentProvider, VoucherPaymentProvider>();
            };

            return builder;
        }

    }
}