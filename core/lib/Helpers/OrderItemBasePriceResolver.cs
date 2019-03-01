using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Microsoft.Extensions.DependencyInjection;
using our.orders.Models;

namespace our.orders.Helpers
{
    public class OrderItemBasePriceResolver : IValueResolver<IProduct, OrderItem, Amount>
    {
        public const string CURRENCY_KEY = nameof(OrderItemBasePriceResolver) + "Currency";
        public const string OPTIONS_KEY = nameof(OrderItemBasePriceResolver) + "Options";
        private readonly IAppSettings appSettings;
        private readonly Configuration configuration;

        public OrderItemBasePriceResolver(IAppSettings appSettings, Configuration configuration)
        {
            this.appSettings = appSettings;
            this.configuration = configuration;
        }

        public Amount Resolve(IProduct source, OrderItem destination, Amount destMember, ResolutionContext context)
        {
            if (!context.Items.TryGetValue(CURRENCY_KEY, out object currency))
            {
                currency = configuration.Currencies.First();
            }

            var baseprice = source.BasePrice.GetInCurrency(configuration, currency?.ToString()) ?? 0;

            if (!context.Items.TryGetValue(OPTIONS_KEY, out object options))
            {
                options = new string[] { };
            }

            var extra = 0m;

            foreach (var optionId in options as IEnumerable<string>)
            {
                var option = source.Options.FirstOrDefault(o => o.Id == optionId);
                if (option == null) continue;

                extra += option.BasePrice.GetInCurrency(configuration, currency?.ToString()) ?? 0;

            }
            
            var amount = destMember == null ? new Amount() : destMember;

            amount.Base = baseprice;
            amount.TaxRateExcluded = source.TaxRateExcluded ?? 0;
            amount.TaxRateIncluded = source.TaxRateIncluded ?? 0;
            amount.Extra = extra;

            return amount;
        }
    }
}