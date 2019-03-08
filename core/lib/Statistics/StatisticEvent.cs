using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using Innofactor.EfCoreJsonValueConverter;
using our.orders.Helpers;
using our.orders.Models;
namespace our.orders.Statistics
{
    // public class StatisticEvent : Model, IStatisticEvent
    // {
    //     public StatisticEventType Type { get; protected set; }



    //     [JsonField]
    //     public StatisticMetric Value { get; set; }
    //     public string Currency { get; protected set; }

    //     public string Category { get; protected set; }

    //     public string CountryIso { get; protected set; }

    //     public string ShopId { get; protected set; }

    //     public string OrderId { get; protected set; }

    //     public string ProductId { get; protected set; }

    //     public string UserId { get; protected set; }

    //     public string Method { get; protected set; }

    //     public DateTime OrderDate { get; protected set; }

    //     public override string Preview()
    //     {
    //         return $"{Id}";
    //     }
    //     public static StatisticEvent FromOrder(IOrder order, IRateProvider rateProvider, string defaultCurrency, IAppSettings appSettings)
    //     {

    //         var amount = order.Total;
    //         if (amount != 0 && defaultCurrency != order.Currency)
    //         {
    //             amount *= rateProvider.GetRate(order.Currency, defaultCurrency).Value;
    //         }

    //         return new StatisticEvent
    //         {
    //             Type = StatisticEventType.Order,
    //             Currency = order.Currency ?? defaultCurrency,
    //             Category = order.Category ?? "",
    //             CountryIso = order.Client?.CountryIso ?? "",
    //             ShopId = order.ShopId ?? "",
    //             OrderId = order.Id,
    //             UserId = order.UserId,
    //             OrderDate = order.Date ?? order.Creation ?? DateTime.UtcNow,
    //             Value = new StatisticMetric
    //             {
    //                 Sales = 1,
    //                 Units = order.Units,
    //                 Amount = appSettings.RoundPolicy(amount)
    //             }
    //         };
    //     }

    //     public static IEnumerable<StatisticEvent> FromProducts(IOrder order, IRateProvider rateProvider, string defaultCurrency, IAppSettings appSettings)
    //     {
    //         var rate = 1m;

    //         if (defaultCurrency != order.Currency)
    //         {
    //             rate = rateProvider.GetRate(order.Currency, defaultCurrency).Value;
    //         }
    //         var items = order.Items.SelectMany(i => i.Items.Concat(new List<OrderItem> { i }));
    //         return items.Select(i => new StatisticEvent
    //         {
    //             Type = StatisticEventType.Product,
    //             Currency = order.Currency ?? defaultCurrency,
    //             Category = order.Category ?? "",
    //             CountryIso = order.Client?.CountryIso ?? "",
    //             ShopId = order.ShopId ?? "",
    //             OrderId = order.Id,
    //             ProductId = i.ProductId,
    //             UserId = order.UserId,
    //             OrderDate = order.Date ?? order.Creation ?? DateTime.UtcNow,
    //             Value = new StatisticMetric
    //             {
    //                 Sales = 1,
    //                 Units = i.Quantity,
    //                 Amount = appSettings.RoundPolicy(i.FinalPrice* rate)
    //             }
    //         });
    //     }

    //     public static StatisticEvent FromPayment(IOrder order, Payment payment, IRateProvider rateProvider, string defaultCurrency, IAppSettings appSettings)
    //     {
    //         var amount = payment.Status >= PaymentStatus.Paid ? payment.Amount : 0;
    //         if (amount != 0 && defaultCurrency != order.Currency)
    //         {
    //             amount *= rateProvider.GetRate(order.Currency, defaultCurrency).Value;
    //         }

    //         return new StatisticEvent
    //         {
    //             Type = StatisticEventType.Payment,
    //             Currency = order.Currency ?? defaultCurrency,
    //             Category = order.Category ?? "",
    //             CountryIso = order.Client?.CountryIso ?? "",
    //             ShopId = order.ShopId ?? "",
    //             OrderId = order.Id,
    //             UserId = order.UserId,
    //             OrderDate = order.Date ?? order.Creation ?? DateTime.UtcNow,
    //             Method = payment.Method.ToString(),
    //             Value = new StatisticMetric
    //             {
    //                 Amount = appSettings.RoundPolicy(amount)
    //             }
    //         };
    //     }
    // }
}
