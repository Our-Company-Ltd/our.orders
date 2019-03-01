using System;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using our.orders.Builder;
using our.orders.Helpers;

namespace our.orders.Payments.Paypal
{
    public static class PayPalBuilderExtension
    {
        public static OurOrdersBuilder UsePayPal(this OurOrdersBuilder builder, string clientIdSandbox, string clientIdProduction, string secretSandbox, string secretProduction, string environment)
        {
            var paypalConfiguration = new PaypalConfiguration()
            {
                Environment = environment,
                ClientIdSandbox = clientIdSandbox,
                ClientIdProduction = clientIdProduction,
                SecretSandbox = secretSandbox,
                SecretProduction = secretProduction,
            };

            return builder.UsePayPal(paypalConfiguration);
        }

        public static OurOrdersBuilder UsePayPal(this OurOrdersBuilder builder, PaypalConfiguration paypalConfiguration)
        {
            builder.AppEvents.Configure += (sender, services) =>
            {
                services.AddTransient<IPaymentProvider, PayPalPaymentProvider>();
                services.AddTransient<PayPalPaymentProvider>();
                services.AddSingleton(paypalConfiguration);
            };
            
            builder.AppSettings.ExternalControllers.Add(typeof(PayPalPaymentController));

            builder.HostServices.AddSingleton(paypalConfiguration);
            builder.HostServices.AddTransient<IPaymentProvider, PayPalPaymentProvider>();
            builder.HostServices.AddTransient<PayPalPaymentProvider>();
            
            return builder;
        }

    }
}