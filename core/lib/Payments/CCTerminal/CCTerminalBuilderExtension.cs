using System;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using our.orders.Builder;
using our.orders.Helpers;
using our.orders.Payments;
using our.orders.Payments.CCTerminal;

namespace our.orders
{
    public static class CCTerminalBuilderExtension
    {
        public static OurOrdersBuilder UseCCTerminal(this OurOrdersBuilder builder)
        {
            builder.AppEvents.Configure += (sender, services) =>
                      {
                          services.AddTransient<IPaymentProvider, CCTerminalPaymentProvider>();
                          services.AddTransient<CCTerminalPaymentProvider>();
                      };


            builder.HostServices.AddTransient<IPaymentProvider, CCTerminalPaymentProvider>();
            builder.HostServices.AddTransient<CCTerminalPaymentProvider>();

            return builder;
        }

    }
}