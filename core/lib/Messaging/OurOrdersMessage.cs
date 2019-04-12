using System.Collections.Generic;
using System.Net.Mail;

namespace our.orders.Messaging
{
    public class OurOrdersMessage
    {
        public virtual string Footer { get; set; }
        public virtual string Body { get; set; }
        public virtual string Destination { get; set; }
        public virtual string Subject { get; set; }
        public IList<LinkedResource> LinkedResources { get; private set; } = new List<LinkedResource>();
    }
}