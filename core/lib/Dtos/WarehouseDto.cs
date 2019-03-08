using System;
using System.Collections.Generic;
using System.Linq;
using api.Helpers;
using Newtonsoft.Json;
using our.orders.Models;
using our.orders.Repositories;

namespace our.orders.Dtos
{
    public class WarehouseDto : IModel
    {
        public string Id { get; set; }

        public DateTime? LastMod { get; set; }

        public DateTime? Creation { get; set; }

        public string Name { get; set; }

        public string Address { get; set; }

        public string City { get; set; }

        public string CountryIso { get; set; }


        public string Email { get; set; }


        public string Phone { get; set; }

        public string PostalCode { get; set; }

        public string State { get; set; }

        public string VATNumber { get; set; }

        public string Preview() => $"{Name}";
    }
}