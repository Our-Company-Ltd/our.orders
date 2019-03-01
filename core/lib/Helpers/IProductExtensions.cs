using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using our.orders.Models;

namespace our.orders.Helpers
{
    public static class IProductExtensions
    {

        public static OrderItem ToOrderItem(this IProduct product, IOrder order, IAppSettings appSettings, IMapper mapper, Configuration configuration, IEnumerable<string> options = null)
        {
            var result = mapper.Map<OrderItem>(product);

            result.ProductId = product.Id;
            result.Quantity = product.MinQuantity ?? 1;
            var currency = order.Currency;

            var baseprice = product.BasePrice.GetInCurrency(configuration, currency?.ToString()) ?? 0;

            var extra = 0m;
            if (options != null)
            {
                foreach (var optionId in options)
                {
                    var option = product.Options.FirstOrDefault(o => o.Id == optionId);
                    if (option == null) continue;

                    extra += option.BasePrice.GetInCurrency(configuration, currency?.ToString()) ?? 0;

                }
            }

            result.Items = product.Products?.Select(p => p.ToOrderItem(order, appSettings, mapper, configuration, options));

            result.Price = result.Price ?? new Amount();

            result.Price.Base = baseprice;
            result.Price.TaxRateExcluded = product.TaxRateExcluded ?? configuration.TaxRateExcluded;
            result.Price.TaxRateIncluded = product.TaxRateIncluded ?? configuration.TaxRateIncluded;
            result.Price.Extra = extra;
            result.ProductId = product.Id;
            result = result.UpdateWeight();
            
            result.UpdatePrice(appSettings);

            return result;

        }

    }
}