using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Globalization;
using System.Linq;
using our.orders.Helpers;
using our.orders.Repositories;
using our.orders.Repositories.EntityFramework;
using Innofactor.EfCoreJsonValueConverter;

namespace our.orders.Models
{

    public interface IOrder : IModel
    {
        /// <summary>
        /// The type of the order (i.e. Cart / Order / Offer)
        /// </summary>
        /// <value></value>
        OrderType OrderType { get; set; }

        /// <summary>
        /// the current status of the order
        /// </summary>
        /// <value></value>
        OrderStatus Status { get; set; }

        Person Client { get; set; }

        string ClientId { get; set; }

        string UserId { get; set; }

        bool ShipToClient { get; set; }

        DateTime? Date { get; set; }

        IEnumerable<OrderItem> Items { get; set; }

        decimal Tax { get; set; }

        Amount Delivery { get; set; }

        /// <summary>
        /// The price of the order items (ie. the sum of the final price of each item, subitems, etc…)
        /// </summary>
        /// <remarks>
        /// Shipping and tax excluded
        /// </remarks>
        /// <value></value>
        decimal Price { get; set; }

        decimal Total { get; set; }

        decimal TotalDefaultCurrency { get; set; }

        decimal Weight { get; set; }

        int Units { get; set; }

        string Currency { get; set; }

        string ShippingTemplateId { get; set; }

        string ShippingTemplateName { get; set; }

        Person ShippingPerson { get; set; }

        List<Payment> Payments { get; set; }

        List<Dispatch> Dispatches { get; set; }

        decimal PaidAmount { get; set; }

        bool Paid { get; set; }
        bool Canceled { get; set; }

        bool NeedsDispatch { get; set; }

        bool Dispatched { get; set; }


        bool NeedsStockUpdate { get; set; }

        bool StockUpdated { get; set; }

        string Reference { get; set; }

        string Note { get; set; }


        string Category { get; set; }

        string ShopId { get; set; }

        bool IsOrder { get; }

        bool IsCart { get; }

        bool IsOffer { get; }

        string PrettyDate { get; }

        string PrettyTotal { get; }

        string PrettyDelivery { get; }
    }
    public class Order : Model, IOrder
    {
        public string Type { get; set; }

        public OrderType OrderType { get; set; } = OrderType.Cart;

        public OrderStatus Status { get; set; } = OrderStatus.Empty;


        [JsonField]
        public Person Client { get; set; } = new Person();

        [JsonField]
        public Person ShippingPerson { get; set; } = new Person();

        public DateTime? Date { get; set; } = DateTime.UtcNow;

        public string ClientId { get; set; }
        public string UserId { get; set; }

        public int Units { get; set; }

        [JsonField]
        public IEnumerable<OrderItem> Items { get; set; } = new OrderItem[] { };
        public decimal Tax { get; set; }


        [JsonField]
        public Amount Delivery { get; set; } = new Amount();

        public decimal Price { get; set; }

        public decimal Total { get; set; }

        public decimal TotalDefaultCurrency { get; set; }

        public decimal Weight { get; set; }


        public string Currency { get; set; }

        public string Category { get; set; }

        public string ShopId { get; set; }

        public string ShippingTemplateId { get; set; }

        public string ShippingTemplateName { get; set; }

        [JsonField]
        public List<Payment> Payments { get; set; } = new List<Payment>();

        [JsonField]
        public List<Dispatch> Dispatches { get; set; } = new List<Dispatch>();


        public decimal PaidAmount { get; set; }

        public bool Paid { get; set; }
        public bool Canceled { get; set; }

        public bool NeedsDispatch { get; set; }

        public bool Dispatched { get; set; }

        public bool NeedsStockUpdate { get; set; }

        public bool StockUpdated { get; set; }

        public bool ShipToClient { get; set; }
        public string Reference { get; set; }
        public string Note { get; set; }

        public override string Preview() => $"{Reference} {Client?.FirstName} {Client?.LastName}";

        public bool IsOrder => OrderType == OrderType.Order;

        public bool IsCart => OrderType == OrderType.Cart;

        public bool IsOffer => OrderType == OrderType.Offer;

        public string PrettyDate => Date?.ToString("dd.MM.yyyy");

        public string PrettyTotal => Total.ToString("0.00", CultureInfo.InvariantCulture);

        public string PrettyDelivery => Delivery?.Final.ToString("0.00", CultureInfo.InvariantCulture) ?? "0.00";
    }
}