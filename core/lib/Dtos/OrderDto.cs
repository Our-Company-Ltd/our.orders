using System;
using System.Collections.Generic;
using System.Linq;
using api.Helpers;
using Newtonsoft.Json;
using our.orders.Models;
using our.orders.Repositories;

namespace our.orders.Dtos
{
    public class OrderDto : IPreviewable
    {
        public string Type { get; set; }

        public OrderType OrderType { get; set; } = OrderType.Cart;

        public OrderStatus Status { get; set; } = OrderStatus.Empty;

        public Person Client { get; set; }

        public Person ShippingPerson { get; set; }

        public int Units { get; set; }
        public string ClientId { get; set; }

        public string UserId { get; set; }

        public IEnumerable<OrderItem> Items { get; set; } = new OrderItem[] { };

        public bool NeedsDispatch { get; set; }

        public bool Dispatched { get; set; }

        public bool NeedsStockUpdate { get; set; }

        public bool StockUpdated { get; set; }

        public decimal TotalDefaultCurrency { get; set; }
        public decimal Weight { get; set; }

        public bool ShipToClient { get; set; }

        public DateTime? Date { get; set; }

        public string Currency { get; set; }

        public string Category { get; set; }

        public string ShopId { get; set; }

        public string Reference { get; set; }

        public string ShippingTemplateId { get; set; }

        public string ShippingTemplateName { get; set; }

        public string Note { get; set; }


        public List<Payment> Payments { get; set; } = new List<Payment>();

        public List<Dispatch> Dispatches { get; set; } = new List<Dispatch>();

        public decimal PaidAmount { get; set; }

        public bool Paid { get; set; }
        public bool Canceled { get; set; }

        public string Id { get; set; }

        public DateTime? LastMod { get; set; }

        public DateTime? Creation { get; set; }


        public decimal Tax { get; set; }
        public Amount Delivery { get; set; }
        public decimal Price { get; set; }
        public decimal Total { get; set; }

        public string Preview() => $"{Reference} {Client?.FirstName} {Client?.LastName}";

    }
}