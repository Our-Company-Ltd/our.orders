using System.Collections.Generic;
using System.Linq;
using our.orders.Helpers;

namespace our.orders.Models
{
    public class Price
    {
        public string Id { get; set; }
        public string Currency { get; set; }

        public decimal Value { get; set; }
    }


    

    public static class PriceExtensions
    {

        public static decimal? GetInCurrency(this IEnumerable<Price> prices, Configuration configuration, string currency)
        {
            var contained = prices?.FirstOrDefault(p => p.Currency == currency);
            if (contained != null) return contained.Value;
            var from = prices?.FirstOrDefault();
            if (from == null) return 0;
            var rate = configuration.GetRate(from.Currency, currency);
            return rate * from.Value;
        }
    }
}