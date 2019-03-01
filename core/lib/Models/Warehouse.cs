
namespace our.orders.Models
{
    public class Warehouse : Model
    {
        public string Name { get; set; }

        public string Address { get; set; }

        public string City { get; set; }

        public string CountryIso { get; set; }
        public string Email { get; set; }

        public string Phone { get; set; }

        public string PostalCode { get; set; }

        public string State { get; set; }

        public string VATNumber { get; set; }

        public override string Preview() => $"{Name}";
    }
}