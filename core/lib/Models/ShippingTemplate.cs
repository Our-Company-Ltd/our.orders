
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text.RegularExpressions;
using Innofactor.EfCoreJsonValueConverter;
using Newtonsoft.Json;
using our.orders.Helpers;

namespace our.orders.Models
{
    public interface IShippingTemplate : IModel
    {
        string Title { get; set; }

        string Description { get; set; }
        bool Accepts(IOrder order);
        void ApplyTo(IOrder order, Configuration configuration, IAppSettings appSettings);
    }
    public class ShippingPrice
    {
        public string Id { get; set; }
        
        [JsonField]
        public IEnumerable<Price> Base { get; set; }


        [JsonField]
        public IEnumerable<Price> PerUnit { get; set; }

        public int MaxUnit { get; set; } = 0;

    }
    public abstract class ShippingTemplateBase : Model, IShippingTemplate
    {
        public string Title { get; set; }

        public string Description { get; set; }





        [JsonField]
        public IEnumerable<ShippingPrice> PerGram { get; set; }


        [JsonField]
        public IEnumerable<ShippingPrice> PerUnit { get; set; }
        public decimal PercentItemPrice { get; set; } = 0;

        public decimal TaxRateIncluded { get; set; } = 0;

        public decimal TaxRateExcluded { get; set; } = 0;


        [JsonField]
        public IEnumerable<Price> BasePrice { get; set; }
        public override string Preview() => $"{Title}";

        public void ApplyTo(IOrder order, Configuration configuration, IAppSettings appSettings)
        {
            var finalBase = BasePrice?.GetInCurrency(configuration, order.Currency) ?? 0;

            var grams = order.Weight;
            var weightPrice = PerGram?.Where(p => p.MaxUnit < grams).OrderByDescending(p => p.MaxUnit).FirstOrDefault();

            if (weightPrice != null)
            {
                var baseWeightPrice = weightPrice.Base.GetInCurrency(configuration, order.Currency) ?? 0;
                var perWeight = weightPrice.PerUnit.GetInCurrency(configuration, order.Currency) ?? 0;
                finalBase += baseWeightPrice + perWeight * grams;
            }

            var units = order.Units;
            var unitsPrice = PerUnit?.Where(p => p.MaxUnit < units).OrderByDescending(p => p.MaxUnit).FirstOrDefault();

            if (unitsPrice != null)
            {
                var baseUnitPrice = unitsPrice.Base.GetInCurrency(configuration, order.Currency) ?? 0;
                var perUnit = weightPrice.PerUnit.GetInCurrency(configuration, order.Currency) ?? 0;
                finalBase += baseUnitPrice + perUnit * units;
            }

            finalBase += order.Price * PercentItemPrice;

            var final =
                new Amount
                {
                    Base = finalBase,
                    TaxRateExcluded = TaxRateExcluded,
                    TaxRateIncluded = TaxRateIncluded
                };

            final.Update(appSettings);

            order.ShippingTemplateName = this.Title;

            order.Delivery = final;

        }

        public abstract bool Accepts(IOrder order);
    }

    public class ShippingTemplate : ShippingTemplateBase
    {


        [JsonField]
        public List<string> InCountries { get; set; }


        [JsonField]
        public List<string> OutCountries { get; set; }


        public decimal? MinAmount { get; set; }

        public decimal? MaxAmount { get; set; }



        public DateTime? MinDate { get; set; }

        public DateTime? MaxDate { get; set; }

        public string ExcludeSKUPattern { get; set; }

        public override string Preview() => $"{Title}";



        public override bool Accepts(IOrder order)
        {

            if (MinAmount.HasValue && order.Price < MinAmount) return false;

            if (MaxAmount.HasValue && MaxAmount != 0 && order.Price > MaxAmount) return false;

            var countryIso = order.ShippingPerson?.CountryIso;
            if (InCountries != null && InCountries.Any() && (countryIso == null || InCountries.All(c => c != countryIso))) return false;

            if (OutCountries != null && OutCountries.Any() && (countryIso == null || OutCountries.Any(c => c == countryIso))) return false;

            if (MinDate.HasValue && DateTime.UtcNow.CompareTo(MinDate) < 0) return false;

            if (MaxDate.HasValue && DateTime.UtcNow.CompareTo(MaxDate) > 0) return false;

            if (!string.IsNullOrWhiteSpace(ExcludeSKUPattern))
            {
                var regex = new Regex(ExcludeSKUPattern);
                var check = order.Items?.All(i => _CheckSKU(i, regex)) ?? false;
                if (!check) return false;
            }
            return true;
        }
        private bool _CheckSKU(OrderItem item, Regex regex)
        {
            var subitems = (item.Items?.All(i => _CheckSKU(i, regex)) ?? true);
            return (string.IsNullOrWhiteSpace(item.SKU) || !regex.IsMatch(item.SKU)) && subitems;
        }
    }
}