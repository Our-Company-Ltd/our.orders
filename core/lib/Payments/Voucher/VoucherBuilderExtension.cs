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
                services.AddTransient<VoucherPaymentProvider>();
                services.AddTransient<IPaymentProvider, VoucherPaymentProvider>((s) => s.GetService<VoucherPaymentProvider>());
            };

            builder.AppEvents.ApplicationStarted += (sender, app) =>
            {

                var voucherProvider = app.GetService<VoucherPaymentProvider>();

            };
            builder.HostServices.AddTransient<IPaymentProvider>((s) =>
            {
                return builder.appEvents.Services.GetService<VoucherPaymentProvider>();
            });
            
            builder.HostServices.AddTransient<VoucherPaymentProvider>((s) => {
                return builder.appEvents.Services.GetService<VoucherPaymentProvider>();
            });

            return builder;
        }

    }
}