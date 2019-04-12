using System;
using System.IO;
using System.Net.Mail;
using System.Net.Mime;
using MailKit.Security;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace our.orders.Messaging
{
    public class MessageSender : IMessageSender
    {

        public MessageSender(IHostingEnvironment hostingEnvironment, MessagingConfiguration messagingConfiguration)
        {
            this.hostingEnvironment = hostingEnvironment;
            this.messagingConfiguration = messagingConfiguration;
        }

        protected string MapPath(string path) => Path.Combine(hostingEnvironment.ContentRootPath, path);

        private static Random _Random = new Random();
        private readonly IHostingEnvironment hostingEnvironment;
        private readonly MessagingConfiguration messagingConfiguration;

        private MailMessage _GetMailMessage(OurOrdersMessage message)
        {
            var mail = new MailMessage
            {
                From = new MailAddress(messagingConfiguration.From),
                Subject = message.Subject,
                Body = message.Body,
                IsBodyHtml = true
            };

            mail.To.Add(message.Destination);

           
            var htmview = AlternateView.CreateAlternateViewFromString(message.Body, new ContentType("text/html"));

            foreach (var linkedResource in message.LinkedResources)
                htmview.LinkedResources.Add(linkedResource);
            mail.AlternateViews.Add(htmview);

            return mail;
        }

        public virtual void Send(OurOrdersMessage message)
        {
            var mailMessage = _GetMailMessage(message);
            Send(message, mailMessage);
        }
        public void Send(string destination, string subject, string body)
        {
            var message = new OurOrdersMessage { Destination = destination, Subject = subject, Body = body };
            Send(message);
        }
        private MailKit.Net.Smtp.SmtpClient _GetClient()
        {
            if (messagingConfiguration.GetClient != null)
            {
                return messagingConfiguration.GetClient();
            }

            var client = new MailKit.Net.Smtp.SmtpClient();

            client.ServerCertificateValidationCallback = (s, c, h, e) => true;

            client.Connect(messagingConfiguration.Host, messagingConfiguration.Port, messagingConfiguration.SSL);

            client.Authenticate(messagingConfiguration.User, messagingConfiguration.Password);

            return client;
        }

        protected virtual void Send(OurOrdersMessage message, System.Net.Mail.MailMessage mailMessage)
        {
            using (var client = _GetClient())
            {
                client.Send((MimeKit.MimeMessage)mailMessage);
                client.Disconnect(true);
            }
        }
    }
}