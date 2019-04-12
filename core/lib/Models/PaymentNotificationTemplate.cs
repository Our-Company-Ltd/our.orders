
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using our.orders.Helpers;

namespace our.orders.Models
{

    public class PaymentNotificationTemplate : Model
    {
        public string TemplateId { get; set; }
        
        public string Title { get; set; }

        public string Description { get; set; }

        public string Body { get; set; }

        public string Subject { get; set; }

        /// <summary>
        /// Payment providers in a dropdown with "all" option
        /// </summary>
        /// <value></value>
        public string Provider { get; set; }

        public PaymentStatus Status { get; set; }

        /// <summary>
        /// Payment providers in a dropdown with "all" option
        /// </summary>
        /// <value></value>
        public PaymentMethod? Method { get; set; }

        public override string Preview() => $"{Title}";
    }
}