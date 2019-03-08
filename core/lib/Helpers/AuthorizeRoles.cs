using System;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using our.orders.Identity;

namespace our.orders.Helpers
{
    public class AuthorizeRolesAttribute : AuthorizeAttribute
    {
        public AuthorizeRolesAttribute(params string[] roles) : base()
        {
            Roles = String.Join(",", roles);
        }

    }
}