using System;
using System.Linq;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using our.orders.Builder;
using our.orders.Helpers;

namespace our.orders.Newsletter.CampaignMonitor
{
    public static class CampaignMonitorBuilderExtension
    {
        public static OurOrdersBuilder UseCampaignMonitor(this OurOrdersBuilder builder)
        {
            var configuration = new CampaignMonitorConfiguration();
            builder.AppSettings.Configuration.Bind("CampaignMonitor", configuration);
            return UseCampaignMonitor(builder, configuration);
        }
        public static OurOrdersBuilder UseCampaignMonitor(this OurOrdersBuilder builder, string apiKey, string listId)
        {
            var configuration = new CampaignMonitorConfiguration
            {
                ApiKey = apiKey,
                ListId = listId
            };

            return UseCampaignMonitor(builder, configuration);
        }
        public static OurOrdersBuilder UseCampaignMonitor(this OurOrdersBuilder builder, CampaignMonitorConfiguration configuration)
        {

            builder.AppEvents.Configure += (sender, services) =>
            {
                services.AddTransient<INewsletterProvider, CampaignMonitorProvider>();
                services.AddSingleton<CampaignMonitorConfiguration>(configuration);
            };

            builder.HostServices.AddSingleton<CampaignMonitorConfiguration>(configuration);

            builder.AppSettings.ExternalControllers.Add(typeof(CampaignMonitorProvider));

            return builder;
        }

    }
}