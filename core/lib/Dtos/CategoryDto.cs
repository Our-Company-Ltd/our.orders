using System;

namespace our.orders.Models
{
    public class CategoryDto : IModel
    {
        public string Id { get; set; }

        public DateTime? LastMod { get; set; }

        public DateTime? Creation { get; set; }

        public string Title { get; set; }

        public string Preview() =>  Title;
    }
}