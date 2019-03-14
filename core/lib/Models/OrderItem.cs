
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Globalization;
using System.Linq;
using Innofactor.EfCoreJsonValueConverter;
using our.orders.Helpers;

namespace our.orders.Models
{
    public class DispatchInfo
    {
        public string Warehouse { get; set; }

        public int Quantity { get; set; }

        public string UserId { get; set; }

        public DateTime Date { get; set; }

    }


    public class OrderItem
    {
        [Key]
        public string UID { get; set; } = Guid.NewGuid().ToString();

        public string ProductId { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }

        public int Quantity { get; set; } = 1;

        [JsonField]
        public Amount Price { get; set; } = new Amount();

        public decimal Tax { get; set; }

        public decimal Weight { get; set; }

        public decimal UnitPrice { get; set; }

        public decimal FinalPrice { get; set; }

        public decimal FinalWeight { get; private set; }

        public string Src { get; set; }

        public string SKU { get; set; }

        [JsonField]
        public IEnumerable<string> Categories { get; set; }

        [JsonField]
        public DispatchInfo DispatchInfos { get; set; }

        public bool NeedsDispatch { get; set; }

        public bool StockUpdated { get; set; }


        [JsonField]
        public OrderItemOption Option { get; set; }




        [JsonField]
        public IEnumerable<OrderItem> Items { get; set; }

        public string PrettyUnitPrice => UnitPrice.ToString("0.00", CultureInfo.InvariantCulture);
        public string PrettyFinalPrice => FinalPrice.ToString("0.00", CultureInfo.InvariantCulture);


        public OrderItem UpdateWeight()
        {
            var items = this.Items ?? Enumerable.Empty<OrderItem>();
            var subWeight = 0m;
            foreach (var item in items)
            {
                item.UpdateWeight();
                subWeight += item.FinalWeight;
            }

            var weight = this.Weight * this.Quantity;

            this.FinalWeight = weight + subWeight;

            return this;
        }

        public OrderItem UpdatePrice(IAppSettings appSettings)
        {
            var items = this.Items ?? Enumerable.Empty<OrderItem>();
            var subPrice = 0m;
            var subTaxes = 0m;
            foreach (var item in items)
            {
                item.UpdatePrice(appSettings);
                subPrice += item.FinalPrice;
                subTaxes += item.Tax;
            }


            Price.Extra = Option?.ExtraPrice ?? 0;

            Price.Update(appSettings);

            UnitPrice = Price.Final + subPrice;

            FinalPrice = (UnitPrice) * Quantity;

            Tax = Price.Tax * Quantity + subTaxes;

            return this;
        }
    }



}