using System;

namespace our.orders.Models
{
    public class Movement : Model
    {
        public DateTime Date { get; set; }

        public string UserId { get; set; }

        public string User { get; set; }

        public string Note { get; set; }

        public string Currency { get; set; }

        public decimal Amount { get; set; }

        public string ShopId { get; set; }

        public bool Archived { get; set; }

        public override string Preview() => $"{Date} {Amount} {Currency}";
    }
}