namespace our.orders.Models
{
    public class Category : Model
    {
        public string Title { get; set; }

        public override string Preview() => Title;
    }
}