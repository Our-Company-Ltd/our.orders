using System;
using System.Linq;
using System.Threading.Tasks;
using HandlebarsDotNet;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using our.orders.Builder;
using our.orders.Helpers;
using our.orders.Models;
using our.orders.Services;

namespace our.orders.Messaging
{
    
    public static class MessagingBuilderExtension
    {
        public static OurOrdersBuilder UseMessaging(this OurOrdersBuilder builder)
        {
            var configuration = new MessagingConfiguration();
            builder.AppSettings.Configuration.Bind("Messaging", configuration);
            return UseMessaging(builder, configuration);
        }

        public static OurOrdersBuilder UseMessaging(this OurOrdersBuilder builder, MessagingConfiguration configuration)
        {


            builder.AppEvents.Configure += (sender, services) =>
            {
                services.AddSingleton(configuration);
                services.AddTransient<IMessageSender, MessageSender>();
            };
            builder.HostServices.AddSingleton(configuration);
            builder.HostServices.AddTransient<IMessageSender, MessageSender>();

            return builder;
        }

    }
}