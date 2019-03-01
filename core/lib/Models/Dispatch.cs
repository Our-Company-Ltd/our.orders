using System;

namespace our.orders.Models
{
    public class Dispatch
    {
        public string Id { get; set; } = Guid.NewGuid().ToString();

        public DateTime Date { get; set; }

        public bool StockUpdated { get; set; }

        public DispatchMethod Method { get; set; }

        public DispatchStatus Status { get; set; }

        public string Notes { get; set; }
    }
}