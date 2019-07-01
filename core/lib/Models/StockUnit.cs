
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using Innofactor.EfCoreJsonValueConverter;

namespace our.orders.Models
{

    public class StockUnitEntry
    {
        public string WarehouseId { get; set; }

        public int Stock { get; set; }
    }
    public class StockUnit : Model
    {
        public string SKU { get; set; }

        public string Detail { get; set; }

        [JsonField]
        public Dictionary<string, int> Units { get; set; } = new Dictionary<string, int>();

        public override string Preview() => $"{SKU} ({Units})";
    }
}