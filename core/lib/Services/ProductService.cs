using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using our.orders.Helpers;
using our.orders.Models;
using our.orders.Repositories;

namespace our.orders.Services
{
    public class ProductService : Service<IProduct>
    {

        private readonly IMapper mapper;
        private readonly Configuration configuration;

        public ProductService(IRepository<IProduct> provider, AppEvents appEvents, IMapper mapper, Configuration configuration) : base(provider, appEvents)
        {

            this.mapper = mapper;
            this.configuration = configuration;
        }

        public override async Task<IProduct> NewAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            var entry = await base.NewAsync(cancellationToken);
            entry.TaxRateExcluded = configuration.TaxRateExcluded;
            entry.TaxRateIncluded = configuration.TaxRateIncluded;
            return entry;
        }
        public OrderItem ToOrderItem(IOrder order, IProduct product, ProductSelectionBase selection)
        {
            return ToOrderItem(order.Currency, product, selection);
        }
        public OrderItem ToOrderItem(string currency, IProduct product, ProductSelectionBase selection)
        {


            var item = mapper.Map<OrderItem>(product);
            item.UID = Guid.NewGuid().ToString();


            var baseprice = product.BasePrice?.GetInCurrency(configuration, currency?.ToString()) ?? 0;

            var opt = selection?.Option;
            if (opt != null)
            {

                var option = product.Options.ElementAtOrDefault(opt.index);
                var extra = option?.BasePrice?.GetInCurrency(configuration, currency?.ToString()) ?? 0;

                item.Option = new OrderItemOption
                {
                    Value = opt.value,
                    SKU = option?.SKU,
                    Title = option?.Title,
                    OptionId = option?.Id,
                    ExtraPrice = extra
                };
            }

            item.Price = item.Price ?? new Amount();

            item.Price.Base = baseprice;
            item.Price.TaxRateExcluded = product.TaxRateExcluded ?? 0;
            item.Price.TaxRateIncluded = product.TaxRateIncluded ?? 0;


            item.Quantity = selection.Quantity;

            item.ProductId = product.Id;

            return item;

        }
    }
}