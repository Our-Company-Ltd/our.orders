using System;
using System.Linq;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using our.orders.Builder;
using our.orders.Helpers;

namespace our.orders.Payments.Stripe
{
    public static class StripeBuilderExtension
    {
        public static OurOrdersBuilder UseStripe(this OurOrdersBuilder builder)
        {
            var configuration = new StripeConfiguration();
            builder.AppSettings.Configuration.bind("Stripe", configuration);
            return UseStripe(builder, configuration);
        }

        public static OurOrdersBuilder UseStripe(this OurOrdersBuilder builder, string secretKey, string publishableKey)
        {
            var configuration = new StripeConfiguration()
            {
                SecretKey = secretKey,
                PublishableKey = publishableKey
            };

            return UseStripe(builder, configuration);
        }

        public static OurOrdersBuilder UseStripe(this OurOrdersBuilder builder, StripeConfiguration configuration)
        {


            builder.AppEvents.Configure += (sender, services) =>
           {
               services.AddTransient<IPaymentProvider, StripePaymentProvider>();
           };

            builder.AppEvents.Configure += (sender, services) =>
            {
                services.AddSingleton(configuration);
            };

            builder.AppSettings.ExternalControllers.Add(typeof(StripePaymentProvider));

            builder.HostServices.AddSingleton(configuration);
            builder.HostServices.AddTransient<IPaymentProvider, StripePaymentProvider>();
            builder.HostServices.AddTransient<StripePaymentProvider>();

            return builder;
        }

    }
}