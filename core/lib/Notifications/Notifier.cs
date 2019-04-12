
using System.Threading;
using System.Threading.Tasks;
using HandlebarsDotNet;
using Microsoft.Extensions.DependencyInjection;
using our.orders.Builder;
using our.orders.Helpers;
using our.orders.Models;
using our.orders.Services;

namespace our.orders.Messaging
{
    public class Notifier
    {

        private readonly AppEvents appEvents;
        private readonly IService<PaymentMessagingTemplate> templates;
        private readonly IMessageSender messageSender;

        public Notifier(AppEvents appEvents, IService<PaymentMessagingTemplate> templates, IMessageSender messageSender)
        {
            this.appEvents = appEvents;
            this.templates = templates;
            this.messageSender = messageSender;

        }

        public void Listen()
        {
            appEvents.PaymentChanged += (sender, args) => AsyncHelper.RunSync(() => _PaymentChangedAsync(sender, args));
            appEvents.PaymentAdded += (sender, args) => AsyncHelper.RunSync(() => _PaymentChangedAsync(sender, args));
        }
        private async Task _PaymentChangedAsync(object sender, (IOrder order, Payment payment) args)
        {
            var order = args.order;
            var payment = args.payment;

            var mail = order.Client?.Email;
            if (string.IsNullOrEmpty(mail))
            {
                return;
            }

            var filter = Filter.And(
                Filter.Eq(nameof(PaymentMessagingTemplate.Status), payment.Status),
                Filter.Or(
                    Filter.Eq(nameof(PaymentMessagingTemplate.Provider), payment.Provider),
                    Filter.Eq(nameof(PaymentMessagingTemplate.Provider), ""),
                    Filter.Eq(nameof(PaymentMessagingTemplate.Provider), null)
                ),
                Filter.Or(
                    Filter.Eq(nameof(PaymentMessagingTemplate.Method), payment.Method),
                    Filter.Eq(nameof(PaymentMessagingTemplate.Method), ""),
                    Filter.Eq(nameof(PaymentMessagingTemplate.Method), null)
                )
            );

            var validTemplates = await templates.FindAsync(filter);

            foreach (var validTemplate in validTemplates)
            {
                var bodyCompiled = Handlebars.Compile(validTemplate.Body);
                var body = bodyCompiled(new
                {
                    order,
                    payment
                });

                var subjectCompiled = Handlebars.Compile(validTemplate.Subject);
                var subject = subjectCompiled(new
                {
                    order,
                    payment
                });

                messageSender.Send(mail, subject, body);
            }

        }
    }

    public static class NotiferBuilderExtension
    {


        public static OurOrdersBuilder UseNotifier(this OurOrdersBuilder builder)
        {


            builder.AppEvents.Configure += (sender, services) =>
            {
                services.AddSingleton<Notifier>();
            };

            builder.AppEvents.ApplicationStarted += (sender, app) =>
            {
                app.GetService<Notifier>().Listen();
            };
            

            return builder;
        }

    }
}
