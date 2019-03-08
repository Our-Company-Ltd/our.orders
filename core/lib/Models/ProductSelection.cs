
using System.Collections.Generic;

namespace our.orders.Models
{
    public class ProductSelection : ProductSelectionBase
    {

        public IEnumerable<ProductSelectionBase> Products { get; set; }
    }

    public class ProductSelectionBase
    {
        public string ProductId { get; set; }
        public int Quantity { get; set; }
        public ProductOptionSelection Option { get; set; }
    }
}