using System;

namespace our.orders.Messaging
{
    public class MessagingConfiguration
    {

        public string From { get; set; }
        public string FromName { get; set; }
        public string Host { get; set; }

        public int Port { get; set; }

        public bool SSL { get; set; }


        public string User { get; set; }

        public string Password { get; set; }

        public Func<MailKit.Net.Smtp.SmtpClient> GetClient { get; set; }
    }
}