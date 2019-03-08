
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using our.orders.Helpers;
using our.orders.Models;

namespace our.orders.Dtos
{
    public class ShippingTemplateDto : IModel
    {

        public string Id { get; set; }

        public DateTime? LastMod { get; set; }

        public DateTime? Creation { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }


        // public IEnumerable<ShippingPrice> PerGram { get; set; } = new ShippingPrice[] { };

        // public IEnumerable<ShippingPrice> PerUnit { get; set; } = new ShippingPrice[] { };



        public double TaxRateIncluded { get; set; } = 0;

        public double TaxRateExcluded { get; set; } = 0;

        public IEnumerable<Price> BasePrice { get; set; } = new Price[] { };


        // public List<string> InCountries { get; set; } = new List<string> {};

        // public List<string> OutCountries { get; set; } = new List<string> {};


        // public double? MinAmount { get; set; }

        // public double? MaxAmount { get; set; }



        // public DateTime? MinDate { get; set; }

        // public DateTime? MaxDate { get; set; }

        // public string ExcludeSKUPattern { get; set; }

        public string Preview() => $"{Title}";
    }
}