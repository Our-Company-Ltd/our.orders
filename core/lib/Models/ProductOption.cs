
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using Innofactor.EfCoreJsonValueConverter;
using our.orders.Helpers;

namespace our.orders.Models
{
    public class ProductOption
    {
        public string Title { get; set; }
        public string Id { get; set; }

        public string SKU { get; set; }

        public string Src { get; set; }

        [JsonField]
        public IEnumerable<Price> BasePrice
        { get; set; }
    }
}