using System;
using System.Collections.Generic;
using our.orders.Models;

namespace our.orders.Identity
{

    /// <summary>
    /// Respresents a role
    /// </summary>
    /// <seealso cref="Microsoft.AspNetCore.Identity.MongoDB.IdentityRole" />
    public class Role
    {
        public Role(string roleName)
        {
            Name = roleName;
            NormalizedName = Normalize(roleName);
            Id = Normalize(roleName);
        }
        public string Id { get; set; }
        public string Name { get; set; }

        public string NormalizedName { get; set; }

        public override string ToString() => Name;

        public static string Normalize(string role) => role?.ToUpperInvariant();

    }
}