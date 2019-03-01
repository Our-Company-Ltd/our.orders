using System;
using Microsoft.AspNetCore.Authorization;

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