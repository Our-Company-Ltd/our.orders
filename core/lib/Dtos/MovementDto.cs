using System;
using System.Collections.Generic;
using System.Linq;
using api.Helpers;
using Newtonsoft.Json;
using our.orders.Models;
using our.orders.Repositories;

namespace our.orders.Dtos
{
    public class MovementDto : IModel
    {

        public string Id { get; set; }

        public DateTime? LastMod { get; set; }

        public DateTime? Creation { get; set; }

        public DateTime Date { get; set; }

        public string UserId { get; set; }

        public string User { get; set; }

        public string Note { get; set; }

        public string Currency { get; set; }

        public decimal Amount { get; set; }

        public string ShopId { get; set; }

        public bool Archived { get; set; }

        public string Preview() => $"{Date} {Amount} {Currency}";

    }
}