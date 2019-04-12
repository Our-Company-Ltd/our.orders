using System;
using System.Linq;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using our.orders.Builder;
using our.orders.Helpers;

namespace our.orders.Payments.PostFinance
{
    public static class PostFinanceBuilderExtension
    {

        public static OurOrdersBuilder UsePostFinance(this OurOrdersBuilder builder)
        {
            var configuration = new PostFinanceConfiguration();
            builder.AppSettings.Configuration.Bind("PostFinance", configuration);
            return UsePostFinance(builder, configuration);
        }

        public static OurOrdersBuilder UsePostFinance(this OurOrdersBuilder builder, string PSPID, string COM, string USERID, string PSWD, string SHASIGN, bool sandbox = false)
        {

            if (string.IsNullOrEmpty(PSPID))
            {
                throw new ArgumentNullException(nameof(PSPID));
            }

            if (string.IsNullOrEmpty(USERID))
            {
                throw new ArgumentNullException(nameof(USERID));
            }

            if (string.IsNullOrEmpty(PSWD))
            {
                throw new ArgumentNullException(nameof(PSWD));
            }

            if (string.IsNullOrEmpty(SHASIGN))
            {
                throw new ArgumentNullException(nameof(SHASIGN));
            }

            if (string.IsNullOrEmpty(COM))
            {
                throw new ArgumentNullException(nameof(COM));
            }


            var configuration = new PostFinanceConfiguration(SHASIGN, PSPID, COM, USERID, PSWD, sandbox);


            return UsePostFinance(builder, configuration);
        }

        public static OurOrdersBuilder UsePostFinance(this OurOrdersBuilder builder, PostFinanceConfiguration configuration)
        {
            builder.AppEvents.Configure += (sender, services) =>
                     {
                         services.AddTransient<IPaymentProvider, PostFinancePaymentProvider>();
                         services.AddTransient<PostFinancePaymentProvider>();
                         services.AddSingleton(configuration);
                     };


            builder.HostServices.AddSingleton(configuration);
            builder.HostServices.AddTransient<IPaymentProvider, PostFinancePaymentProvider>();
            builder.HostServices.AddTransient<PostFinancePaymentProvider>();

            builder.AppSettings.ExternalControllers.Add(typeof(PostFinancePaymentController));
            return builder;
        }

    }
}