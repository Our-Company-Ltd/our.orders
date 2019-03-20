using System.Collections.Generic;
using our.orders.Helpers;
using our.orders.Models;

namespace our.orders.Dtos
{
    public class ConfigurationDto
    {
        public string assemblyVersion { get; set; }
        public string fileVersion { get; set; }
        public string productVersion { get; set; }

        public bool ShowWeight { get; set; }

        public bool ShowTaxRateExcluded { get; set; }

        public bool ShowTaxRateIncluded { get; set; }

        public decimal? TaxRateExcluded { get; set; }

        public decimal? TaxRateIncluded { get; set; }

        public Currency[] Currencies { get; set; }

        public string Path { get; set; }

        public IEnumerable<string> PaymentProviders { get; set; }

        public IEnumerable<string> NewsletterProviders { get; set; }

        public string[] HidePaymentProviders { get; set; }

        public string TransferMessage { get; set; }

    }
}