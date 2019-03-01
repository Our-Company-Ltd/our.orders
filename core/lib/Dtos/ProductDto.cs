using System;
using System.Collections.Generic;
using System.Linq;
using our.orders.Models;

namespace our.orders.Dtos
{
    public class ProductPreviewDto
    {
        public string Id { get; set; }
        public string Title { get; set; }

        public string Src { get; set; }

        public string SKU { get; set; }
        public bool Favorite { get; set; }
        public IEnumerable<string> Categories { get; set; }
    }
    public class ProductDto : IProduct
    {
        public string Id { get; set; }

        public DateTime? LastMod { get; set; }

        public DateTime? Creation { get; set; }

        public OrderItem ToItem(IOrder order) => null;

        public string Title { get; set; }

        public bool Favorite { get; set; }

        public string Description { get; set; }

        public string SKU { get; set; }

        public string Src { get; set; }

        public object Blob { get; set; }

        public double BarCode { get; set; }

        public IEnumerable<Price> BasePrice { get; set; } = new Price[] { };

        public int? MinQuantity { get; set; }

        public int? MaxQuantity { get; set; }

        public IEnumerable<ProductOption> Options { get; set; } = new ProductOption[] { };

        public IEnumerable<ProductDto> Products { get; set; } = new ProductDto[] { };

        public IEnumerable<string> Categories { get; set; } = Enumerable.Empty<string>();

        public decimal? TaxRateIncluded { get; set; }

        public decimal? TaxRateExcluded { get; set; }

        public decimal? Weight { get; set; }

        IEnumerable<IProduct> IProduct.Products => Products.Cast<IProduct>();

        public bool NeedsDispatch { get; set; }

        public string Preview() => $"{Title} ({SKU})";

        public IDictionary<string, int> Stock { get; set; }
    }
}