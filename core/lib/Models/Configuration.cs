using System.Linq;
using Innofactor.EfCoreJsonValueConverter;
using our.orders.Helpers;

namespace our.orders.Models
{
    public class Configuration : Model
    {
        public bool ShowWeight { get; set; }

        public bool ShowTaxRateExcluded { get; set; }

        public bool ShowTaxRateIncluded { get; set; }

        public decimal? TaxRateExcluded { get; set; }

        public decimal? TaxRateIncluded { get; set; }

        [JsonField]
        public Currency[] Currencies { get; set; } = new Currency[] { new Currency { Name = "euros", Code = "EUR", Rate = 1 } };

        [JsonField]
        public string[] HidePaymentProviders { get; set; }

        public string TransferMessage { get; set; }
        public override string Preview() => "";
    }
    public static class ConfigurationExtensions
    {
        public static Currency DefaultCurrency(this Configuration configuration)
        {
            return configuration.Currencies.FirstOrDefault();

        }
        public static decimal GetRate(this Configuration configuration, string from, string to)
        {
            var currencies = configuration.Currencies;
            if (from == to || !currencies.Any(c => c.Code == from) || !currencies.Any(c => c.Code == to))
            {
                return 1;
            }
            var fromCurrency = currencies.First(c => c.Code == from);
            var toCurrency = currencies.First(c => c.Code == to);
            return fromCurrency.Rate / toCurrency.Rate;
        }
    }
}