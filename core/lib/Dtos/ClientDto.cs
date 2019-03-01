using System;
using System.Collections.Generic;
using System.Linq;
using our.orders.Models;

namespace our.orders.Dtos
{
    public class PersonDto : IPerson
    {
        public string Address { get; set; }

        public string CellPhone { get; set; }

        public string City { get; set; }

        public string CountryIso { get; set; }

        public string Email { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string OrganizationName { get; set; }

        public string Phone { get; set; }

        public string PostalCode { get; set; }

        public string State { get; set; }

        public string VATNumber { get; set; }

        public string Preview() => $"{FirstName} {LastName}";
    }
    public class ClientDto : IClient
    {
        public string Address { get; set; }

        public string CellPhone { get; set; }

        public string City { get; set; }

        public string CountryIso { get; set; }

        public string Email { get; set; }

        public string FirstName { get; set; }

        public string LastName { get; set; }

        public string OrganizationName { get; set; }

        public string Phone { get; set; }

        public string PostalCode { get; set; }

        public string State { get; set; }

        public string VATNumber { get; set; }
        public string Id { get; set; }

        public DateTime? LastMod { get; set; }

        public DateTime? Creation { get; set; }

        public string Preview() => $"{FirstName} {LastName}";
    }
}