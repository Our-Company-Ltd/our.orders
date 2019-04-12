using System;
using System.Linq;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using our.orders.Builder;
using our.orders.Helpers;

namespace our.orders.Newsletter.MailChimp
{
    public static class MailChimpBuilderExtension
    {
        public static OurOrdersBuilder UseMailChimp(this OurOrdersBuilder builder)
        {
            var configuration = new MailChimpConfiguration();
            builder.AppSettings.Configuration.Bind("MailChimp", configuration);
            return UseMailChimp(builder, configuration);
        }
        public static OurOrdersBuilder UseMailChimp(this OurOrdersBuilder builder, string apiKey, string listId)
        {
            var configuration = new MailChimpConfiguration
            {
                ApiKey = apiKey,
                ListId = listId
            };


            return UseMailChimp(builder, configuration);
        }

        public static OurOrdersBuilder UseMailChimp(this OurOrdersBuilder builder, MailChimpConfiguration configuration)
        {


            builder.AppEvents.Configure += (sender, services) =>
            {
                services.AddTransient<INewsletterProvider, MailChimpProvider>();
                services.AddSingleton<MailChimpConfiguration>(configuration);
            };

            builder.HostServices.AddSingleton<MailChimpConfiguration>(configuration);

            builder.AppSettings.ExternalControllers.Add(typeof(MailChimpProvider));
            return builder;
        }

    }
}