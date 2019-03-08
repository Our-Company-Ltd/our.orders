using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using Innofactor.EfCoreJsonValueConverter;
using our.orders.Helpers;
using our.orders.Repositories;

namespace our.orders.Models
{
    public class Voucher : Model
    {
        public decimal InitialValue { get; set; }
        public decimal Value { get; set; }
        public string Code { get; set; }
        public string Currency { get; set; }
        public DateTime? Expiration { get; set; }
        public bool Used { get; set; }
        public bool MultipleUse { get; set; }


        [JsonField]
        public IEnumerable<string> OrderIds  { get; set; }

        public bool Valid { get => !Expired && !Used; set { } }

        public bool Expired { get => Expiration.HasValue && Expiration.Value.CompareTo(DateTime.UtcNow) < 0; set { } }
        public override string Preview() => Code;
    }
}