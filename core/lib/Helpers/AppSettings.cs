
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using our.orders.Builder;
using our.orders.Identity;
using our.orders.Models;
using our.orders.Payments;
using our.orders.Repositories;
using our.orders.Statistics;

namespace our.orders.Helpers
{
    public class AppSettings : IAppSettings
    {
        // TODO: write in our orders we should implement a JwtSecret !!
        public string JwtSecret { get; set; } = "this is a valid very very very long secret";

        public string Path { get; set; } = "/orders";

        public string DefaultUploadPath { get; set; } = "../dropbox/orders";

        public Type OrderType { get; set; } = typeof(Order);

        public Type ProductType { get; set; } = typeof(Product);
        public Type ShippingType { get; set; } = typeof(ShippingTemplate);
        public Type ClientType { get; set; } = typeof(Client);

        public List<Type> ExternalControllers { get; set; } = new List<Type>();

        public Func<decimal, decimal> RoundPolicy { get; set; } = (value) => Math.Round(value, 2);

    };

    public interface IAppSettings
    {

        string JwtSecret { get; set; }

        string Path { get; set; }

        string DefaultUploadPath { get; set; }


        Type OrderType { get; set; }

        Type ProductType { get; set; }

        Type ShippingType { get; set; }

        Type ClientType { get; set; }

        Func<decimal, decimal> RoundPolicy { get; set; }

        List<Type> ExternalControllers { get; set; }

    }
}