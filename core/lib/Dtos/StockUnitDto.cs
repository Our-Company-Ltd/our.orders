
using System;
using System.Collections.Generic;
using System.Linq;

namespace our.orders.Models
{


    public class StockUnitDto : IModel
    {
        public string Id { get; set; }

        public DateTime? LastMod { get; set; }

        public DateTime? Creation { get; set; }

        public string SKU { get; set; }
        public string Detail { get; set; }

        public Dictionary<string, int> Units { get; set; } = new Dictionary<string, int>();

        public string Preview() => $"{SKU} ({Units})";

    }
}