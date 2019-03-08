using System;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using our.orders.Builder;
using our.orders.Helpers;

namespace our.orders.Newsletter.CampaignMonitor
{
    public static class CampaignMonitorBuilderExtension
    {
        public static OurOrdersBuilder UseCampaignMonitor(this OurOrdersBuilder builder, string apiKey, string listId)
        {
            var config = new CampaignMonitorConfiguration
            {
                ApiKey = apiKey,
                ListId = listId
            };

            builder.AppEvents.Configure += (sender, services) =>
            {
                services.AddTransient<INewsletterProvider, CampaignMonitorProvider>();
                services.AddSingleton<CampaignMonitorConfiguration>(config);
            };
            
            builder.HostServices.AddSingleton<CampaignMonitorConfiguration>(config);

            builder.AppSettings.ExternalControllers.Add(typeof(CampaignMonitorProvider));

            return builder;
        }

    }
}