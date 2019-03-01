using System.Collections.Generic;
using our.orders.Models;

namespace our.orders.Helpers
{

    public class FindResult<TModel> 
    {
        public int Count { get; set; }

        public int Start { get; set; }

        public int Take { get; set; }

        public string Next { get; set; }

        public string Previous { get; set; }

        public IEnumerable<TModel> Values { get; set; }

    }

    public class ListResultItem
    {

        public string Id { get; set; }

        public string Title { get; set; }

    }
    public class ListResult
    {
        public int Count { get; set; }

        public int Start { get; set; }

        public int Take { get; set; }

        public string Next { get; set; }

        public string Previous { get; set; }

        public IEnumerable<ListResultItem> Values { get; set; }

    }

}
