
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using Innofactor.EfCoreJsonValueConverter;
using our.orders.Helpers;

namespace our.orders.Models
{

    public interface IProduct : IModel
    {
        string Title { get; set; }

        string Description { get; set; }

        string SKU { get; set; }

        string Src { get; set; }

        bool Favorite { get; set; }

        double BarCode { get; set; }

        IEnumerable<Price> BasePrice { get; set; }

        int? MinQuantity { get; set; }

        int? MaxQuantity { get; set; }

        IEnumerable<ProductOption> Options { get; set; }

        IEnumerable<IProduct> Products { get; }

        IEnumerable<string> Categories { get; set; }

        decimal? TaxRateIncluded { get; set; }

        decimal? TaxRateExcluded { get; set; }

        decimal? Weight { get; set; }


        bool NeedsDispatch { get; set; }


    }





    public class Product : Model, IProduct
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public string SKU { get; set; }

        public string Src { get; set; }

        public bool Favorite { get; set; }

        // TODO: check if we save the barcode as string as well for the search
        public double BarCode { get; set; }

        [JsonField]
        public IEnumerable<Price> BasePrice { get; set; }

        public int? MinQuantity { get; set; }

        public int? MaxQuantity { get; set; }

        [JsonField]
        public IEnumerable<string> Categories { get; set; }

        [JsonField]
        public IEnumerable<ProductOption> Options { get; set; } = Enumerable.Empty<ProductOption>();

        public IList<Product> Products { get; set; } = new List<Product>();

        public decimal? TaxRateIncluded { get; set; } = 0;

        public decimal? TaxRateExcluded { get; set; } = 0;

        public decimal? Weight { get; set; }
        IEnumerable<IProduct> IProduct.Products => Products.Cast<IProduct>();

        public override string Preview() => $"{Title} ({SKU})";

        public bool NeedsDispatch { get; set; }

    }
}