using System;
using System.Collections.Generic;
using System.Linq;
using our.orders.Helpers;
using our.orders.Models;
using our.orders.Repositories;

namespace our.orders.Dtos
{
    public class VoucherDto : IPreviewable
    {
        public string Id { get; set; }
        public DateTime? LastMod { get; set; }
        public DateTime? Creation { get; set; }
        public decimal Value { get; set; }
        public decimal InitialValue { get; set; }
        public bool Used { get; set; }
        public string Code { get; set; }
        public string Currency { get; set; }
        public DateTime? Expiration { get; set; }
        public bool MultipleUse { get; set; }
        public IEnumerable<string> OrderIds { get; set; }

        public bool Expired { get; set; }
        public bool Valid { get; set; }
        public string Preview() => Code;
    }
}