using System;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using our.orders.Builder;
using our.orders.Helpers;

namespace our.orders.Newsletter.MailChimp
{
    public static class MailChimpBuilderExtension
    {
        public static OurOrdersBuilder UseMailChimp(this OurOrdersBuilder builder, string apiKey, string listId)
        {
            var config = new MailChimpConfiguration
            {
                ApiKey = apiKey,
                ListId = listId
            };

            builder.AppEvents.Configure += (sender, services) =>
            {
                services.AddTransient<INewsletterProvider, MailChimpProvider>();
                services.AddSingleton<MailChimpConfiguration>(config);
            };
            
            builder.HostServices.AddSingleton<MailChimpConfiguration>(config);

            builder.AppSettings.ExternalControllers.Add(typeof(MailChimpProvider));
            return builder;
        }

    }
}