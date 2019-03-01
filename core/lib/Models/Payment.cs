using System;

namespace our.orders.Models
{
    public class Payment
    {

        public string Provider { get; set; }

        public string Title { get; set; }

        public string Id { get; set; } = Guid.NewGuid().ToString();
        

        public string Details { get; set; }

        public string Reference { get; set; }

        public DateTime Date { get; set; }

        public PaymentStatus Status { get; set; }

        public PaymentMethod Method { get; set; }

        public decimal Amount { get; set; }

        public decimal AmountOrderCurrency { get; set; }
        public string Currency { get; set; }
    }
}