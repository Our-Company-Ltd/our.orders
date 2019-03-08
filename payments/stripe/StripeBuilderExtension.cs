using System;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using our.orders.Builder;
using our.orders.Helpers;

namespace our.orders.Payments.Stripe
{
    public static class StripeBuilderExtension
    {
        public static OurOrdersBuilder UseStripe(this OurOrdersBuilder builder, string secretKey, string publishableKey)
        {
            var stripeConfiguration = new StripeConfiguration()
            {
                SecretKey = secretKey,
                PublishableKey = publishableKey
            };

            builder.AppEvents.Configure += (sender, services) =>
           {
               services.AddTransient<IPaymentProvider, StripePaymentProvider>();
           };

            builder.AppEvents.Configure += (sender, services) =>
            {
                services.AddSingleton(stripeConfiguration);
            };

            builder.AppSettings.ExternalControllers.Add(typeof(StripePaymentProvider));

            return builder;
        }

    }
}