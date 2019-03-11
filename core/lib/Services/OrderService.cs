using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using our.orders.Helpers;
using our.orders.Models;
using our.orders.Repositories;
using our.orders.Statistics;

namespace our.orders.Services
{
    public class OrderService : Service<IOrder>
    {

        private readonly IRepository<IShippingTemplate> shippingTemplateProvider;
        private readonly IAppSettings appSettings;
        private readonly Configuration configuration;

        public OrderService(IRepository<IOrder> orderProvider, IRepository<IShippingTemplate> shippingTemplateProvider, AppEvents appEvents, IAppSettings appSettings, Configuration configuration) : base(orderProvider, appEvents)
        {
            this.appSettings = appSettings;
            this.configuration = configuration;

            this.shippingTemplateProvider = shippingTemplateProvider;
        }

        public override async Task<IOrder> NewAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            var newModel = await base.NewAsync(cancellationToken);
            newModel.Currency = configuration.Currencies.FirstOrDefault()?.Code;
            newModel.Reference = appSettings.OrderReferenceGenerator(newModel);
            return newModel;
        }

        public override async Task<IOrder> CreateAsync(IOrder model, CancellationToken cancellationToken = default(CancellationToken))
        {
            return await UpdateValuesAsync(model).ContinueWith(async t =>
            {
                return await base.CreateAsync(model, cancellationToken);
            }).Unwrap();
        }

        public override async Task<IEnumerable<IOrder>> CreateManyAsync(IEnumerable<IOrder> models, CancellationToken cancellationToken = default(CancellationToken))
        {
            await Task.WhenAll(models.Select(m => UpdateValuesAsync(m, cancellationToken)));

            return await base.CreateManyAsync(models, cancellationToken);

        }


        // public override async Task<IOrder> FindAndUpdateAsync(string id, IDictionary<string, object> updates, CancellationToken cancellationToken = default(CancellationToken))
        // {
        //     // first step : update in DB :
        //     var order = await base.FindAndUpdateAsync(id, updates, cancellationToken);

        //     // update with last infos :
        //     await UpdateAsync(order, cancellationToken);

        //     return order;
        // }

        public async Task AddItemAsync(IOrder order, OrderItem item, CancellationToken cancellationToken = default(CancellationToken))
        {
            order.Items = order.Items.Concat(new[] { item });

            await UpdateAsync(order, cancellationToken);
        }


        // public async Task SetShipping(IOrder order, IShippingTemplate template, CancellationToken cancellationToken = default(CancellationToken))
        // {

        //     order.Shipping = template.ToShipping(order, this.rateProvider);
        //     await UpdateAsync(order, cancellationToken);
        // }

        public async Task<IEnumerable<IShippingTemplate>> GetShippingsAsync(IOrder order, CancellationToken cancellationToken = default(CancellationToken))
        {
            var templates = await shippingTemplateProvider.FindAsync(cancellationToken: cancellationToken);
            return templates.Where(template => template.Accepts(order));
        }

        // public async Task UpdateShippingAsync(IOrder order)
        // {
        //     var templateId = order.Shipping?;
        //     if (templateId == null) return;
        //     var template = await shippingTemplateProvider.GetByIdAsync(templateId);
        //     order.Shipping = template.ToShipping(order, rateProvider);
        // }

        public async Task UpdateQuantityAsync(IOrder order, string itemUID, int quantity, CancellationToken cancellationToken = default(CancellationToken))
        {
            var items = order.Items.ToList();
            var item = items.FirstOrDefault(i => i.UID == itemUID);

            if (item == null) throw new AppException($"impossible to find item with ID {itemUID}");

            if (quantity <= 0)
            {
                items.Remove(item);
            }
            else
            {
                item.Quantity = quantity;
            }

            order.Items = items;

            await UpdateAsync(order, cancellationToken);

        }


        public async Task AddPayment(IOrder order, Payment payment, CancellationToken cancellationToken = default(CancellationToken))
        {
            order.OrderType = OrderType.Order;

            payment.AmountOrderCurrency = configuration.GetRate(payment.Currency, order.Currency);
            order.Payments.Add(payment);

            await UpdateAsync(order, cancellationToken);
            appEvents.OnPaymentAdded(this, (order, payment));
        }

        public async Task UpdatePayment(IOrder order, Payment payment, CancellationToken cancellationToken = default(CancellationToken))
        {
            order.OrderType = OrderType.Order;
            payment.AmountOrderCurrency = configuration.GetRate(payment.Currency, order.Currency);
            await UpdateAsync(order, cancellationToken);
            appEvents.OnPaymentChanged(this, (order, payment));
        }



        public async Task SetClientAsync(IOrder order, Person client, CancellationToken cancellationToken = default(CancellationToken))
        {
            order.Client = client;

            await UpdateAsync(order, cancellationToken);
        }

        public override async Task UpdateAsync(IOrder model, CancellationToken cancellationToken = default(CancellationToken))
        {
            await UpdateValuesAsync(model).ContinueWith(async t =>
            {
                await base.UpdateAsync(model, cancellationToken);
            }).Unwrap();
        }

        public override async Task<IOrder> PreviewAsync(IOrder model, CancellationToken cancellationToken = default(CancellationToken))
        {
            await UpdateValuesAsync(model);

            return model;
        }

        public async Task UpdateValuesAsync(IOrder order, CancellationToken cancellationToken = default(CancellationToken))
        {
            _UpdateCategories(order);
            _UpdateWeight(order);
            _UpdateUnits(order);
            _UpdateNeedsStockUpdate(order);
            _UpdateNeedsDispatch(order);

            await _UpdateShippingAsync(order, cancellationToken).ContinueWith(t =>
            {

                _UpdatePrice(order);

                _UpdatePaid(order);
                _UpdateStatus(order);
            });


        }

        private IEnumerable<string> _GetCategories(OrderItem item)
        {
            var result = new List<string>();
            if (item.Categories != null)
            {
                result.AddRange(item.Categories);
            }
            if (item.Items != null)
            {
                foreach (var subitems in item.Items)
                {
                    result.AddRange(_GetCategories(subitems));
                }
            }
            return result;

        }
        private void _UpdateCategories(IOrder order)
        {
            var items = order.Items ?? Enumerable.Empty<OrderItem>();
            var categories = new List<string>();
            foreach (var item in items)
            {
                categories.AddRange(_GetCategories(item));
            }
            order.Categories = categories;

        }


        private void _UpdatePrice(IOrder order)
        {
            var items = order.Items ?? Enumerable.Empty<OrderItem>();
            foreach (var item in items)
            {
                item.UpdatePrice(appSettings);
            }


            order.Price = items.Sum(i => i.FinalPrice);


            order.Total = appSettings.RoundPolicy(order.Price + (order.Delivery?.Final ?? 0));

            order.TotalDefaultCurrency = order.Total;
            var defaultCurrency = configuration.DefaultCurrency();
            if (order.Total != 0 && order.Currency != defaultCurrency?.Code)
            {

                order.TotalDefaultCurrency *= configuration.GetRate(order.Currency, defaultCurrency.Code);
                order.TotalDefaultCurrency = appSettings.RoundPolicy(order.TotalDefaultCurrency);
            }

            order.Tax = items.Sum(i => i.Tax) + (order.Delivery?.Tax ?? 0);

            // round policy :

        }




        private int _CountUnits(OrderItem orderItem)
        {
            return orderItem.Quantity + (orderItem.Items?.Sum(i => _CountUnits(i)) ?? 0);
        }
        private void _UpdateUnits(IOrder order)
        {

            order.Units = order.Items?.Sum(i => _CountUnits(i)) ?? 0;

        }

        private void _UpdateStatus(IOrder order)
        {
            if (order.Units == 0)
            {
                order.Status = OrderStatus.Empty;
                return;
            }

            if (order.Canceled)
            {
                order.Status = OrderStatus.Canceled;
                return;
            }

            if (!order.Paid)
            {
                order.Status = OrderStatus.PendingPayment;
                return;
            }

            if (order.NeedsDispatch && !order.Dispatched)
            {
                if (!order.StockUpdated || !order.Dispatches.Any(d => d.Status > DispatchStatus.ReadyForDelivery))
                {
                    order.Status = OrderStatus.ToDispatch;
                    return;
                }
                else
                {
                    order.Status = OrderStatus.Dispatching;
                    return;
                }
            }

            order.Status = OrderStatus.Done;

        }

        private void _UpdateNeedsDispatch(IOrder order)
        {
            order.NeedsDispatch = order.Items.Any(i => _NeedDispatch(i));
            order.Dispatched = !order.NeedsDispatch ||
                (order.StockUpdated && order.Dispatches.All(d => d.Status >= DispatchStatus.Undeliverable) && order.Dispatches.Any(d => d.Status >= DispatchStatus.Delivered));

        }
        private bool _NeedDispatch(OrderItem item)
        {
            return item.NeedsDispatch || (item.Items != null && item.Items.Any(_NeedDispatch));
        }

        private void _UpdateNeedsStockUpdate(IOrder order)
        {
            foreach (var item in order.Items)
            {
                _UpdateStockUpdated(item);
            }
            order.StockUpdated = order.Items.All(_IsStockUpdated);
            order.NeedsStockUpdate = order.Items.Any(_NeedsStockUpdate);
        }
        private void _UpdateStockUpdated(OrderItem item)
        {
            var sku = item.SKU;
            item.StockUpdated = (string.IsNullOrEmpty(sku) || (item.DispatchInfos?.Quantity ?? 0) >= item.Quantity);
            if (item.Items != null)
            {
                foreach (var subItem in item.Items)
                {
                    _UpdateStockUpdated(subItem);
                }
            }
        }
        private bool _IsStockUpdated(OrderItem item)
        {
            var items = item.Items;
            return item.StockUpdated && (items == null || items.All(_IsStockUpdated));
        }

        private bool _NeedsStockUpdate(OrderItem item)
        {
            var sku = item.SKU;
            return (!string.IsNullOrEmpty(sku)) ||
            (item.Items != null && item.Items.Any(_NeedsStockUpdate));
        }

        private void _UpdateWeight(IOrder order)
        {
            var items = order.Items ?? Enumerable.Empty<OrderItem>();
            var subWeight = 0m;
            foreach (var item in items)
            {
                item.UpdateWeight();
                subWeight += item.FinalWeight;
            }

            order.Weight = subWeight;
        }

        private void _UpdatePaid(IOrder order)
        {
            order.PaidAmount = order.Payments.Where(p => p.Status == PaymentStatus.Paid).Sum(p => p.Amount);
            order.Paid = order.PaidAmount >= order.Total;
        }


        private async Task _UpdateShippingAsync(IOrder order, CancellationToken cancellationToken = default(CancellationToken))
        {
            var shippingID = order.ShippingTemplateId;
            if (order.NeedsDispatch && string.IsNullOrEmpty(shippingID))
            {
                var allTemplates = await this.GetShippingsAsync(order, cancellationToken);
                shippingID = allTemplates.FirstOrDefault(t => t.Accepts(order))?.Id;
            }
            if (string.IsNullOrEmpty(shippingID)) return;

            order.ShippingTemplateId = shippingID;
            var shipingTemplate = await shippingTemplateProvider.GetByIdAsync(order.ShippingTemplateId, cancellationToken);
            shipingTemplate.ApplyTo(order, configuration, appSettings);

        }



        private static string _GetDimension(IOrder order, StatisticEventDimension dimension)
        {
            switch (dimension)
            {
                case StatisticEventDimension.Categories:
                    return order.Category;
                case StatisticEventDimension.Countries:
                    return order.Client?.CountryIso;
                case StatisticEventDimension.Currencies:
                    return order.Currency;
                case StatisticEventDimension.Shops:
                    return order.ShopId;
                case StatisticEventDimension.Users:
                    return order.UserId;
            }
            throw new Exception($"unknown dimension {dimension}");
        }

        public async Task<StatisticsReport> GetStatsAsync(StatisticEventType type, StatisticEventDimension dimension, DateTime start, int count, TimeInterval timeInterval, CancellationToken cancellationToken = default(CancellationToken))
        {
            var current = start;

            var results = new StatisticsReport()
            {
                StartDate = start,
                Interval = timeInterval,
                Global = new StatisticMetric { },
                Report = new List<StatisticsPeriodReport>()
            };
            while (results.Report.Count() < count)
            {
                var currentEnd = start;
                switch (timeInterval)
                {
                    case TimeInterval.Year:
                        currentEnd = current.AddYears(1);
                        break;
                    case TimeInterval.Month:
                        currentEnd = current.AddMonths(1);
                        break;
                    case TimeInterval.Day:
                        currentEnd = current.AddDays(1);
                        break;
                    case TimeInterval.Hour:
                        currentEnd = current.AddHours(1);
                        break;
                    case TimeInterval.Week:
                        currentEnd = current.AddDays(7);
                        break;
                }

                var filter = Filter.And(
                    Filter.Gte(nameof(IOrder.Date), current),
                    Filter.Lt(nameof(IOrder.Date), currentEnd),
                    Filter.Ne(nameof(IOrder.Canceled), true),
                    Filter.Eq(nameof(IOrder.OrderType), OrderType.Order)
                );

                var periodResult = await FindAsync(filter, cancellationToken: cancellationToken);


                var dimensionsGroup = periodResult.GroupBy(r => _GetDimension(r, dimension) ?? "");
                var perdimensions = dimensionsGroup.ToDictionary(
                    group => group.Key,
                    group => group.Select(g => new StatisticMetric()
                    {
                        Amount = g.Total,
                        Sales = 1,
                        Units = g.Units
                    }).Aggregate((m1, m2) => m1 + m2)
                );

                var allevents = periodResult.Select(g => new StatisticMetric() { Amount = g.Total, Sales = 1, Units = g.Units }).Where(e => e != null);
                var global = allevents.Any() ? allevents.Where(e => e != null).Aggregate((m1, m2) => m1 + m2) : new StatisticMetric();

                var stats = new StatisticsPeriodReport
                {
                    StartDate = current,
                    EndDate = currentEnd,
                    Global = global,
                    Dimension = perdimensions
                };

                results.Global += global;
                results.Report.Add(stats);
                current = currentEnd;


            }
            results.Currency = configuration.DefaultCurrency().Code;

            return results;
        }
    }
}