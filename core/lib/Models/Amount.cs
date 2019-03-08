using our.orders.Helpers;

namespace our.orders.Models
{
    public class Amount
    {
        public decimal Base { get; set; }

        public decimal Extra { get; set; }

        public decimal? TaxRateExcluded { get; set; }

        public decimal? TaxRateIncluded { get; set; }

        public decimal Final { get; private set; }

        public decimal Tax { get; private set; }

        public void Update(IAppSettings appSettings)
        {
            var amount = appSettings.RoundPolicy(Base + Extra);
            var rateExcluded = TaxRateExcluded ?? 0;
            var rateIncluded = TaxRateIncluded ?? 0;
            var excludedTax = appSettings.RoundPolicy(amount * rateExcluded);
            var includedTax = appSettings.RoundPolicy(amount * rateIncluded);

            Final = amount + excludedTax;
            Tax = includedTax + excludedTax;
        }
    }




}