
using System;
using our.orders.Models;

namespace our.orders.Dtos
{
    public class PaymentMessagingTemplateDto : IModel
    {
        public string Id { get; set; }

        public DateTime? LastMod { get; set; }

        public DateTime? Creation { get; set; }

        public string TemplateId { get; set; }
        public string Title { get; set; }

        public string Description { get; set; }

        public string Body { get; set; }

        public string Subject { get; set; }

        public string Styles { get; set; }

        public string Provider { get; set; }

        public PaymentStatus Status { get; set; }

        public PaymentMethod? Method { get; set; }

        public string Preview() => $"{Title}";
    }
}