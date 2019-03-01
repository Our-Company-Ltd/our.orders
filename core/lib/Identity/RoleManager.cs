
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;

using Microsoft.Extensions.Logging;
using System.Collections.Generic;

namespace our.orders.Identity
{
    /// <summary>
    /// Provides the APIs for managing roles in a MongoDB persistence store.
    /// </summary>
    public class RoleManager : RoleManager<Role>
    {

        public RoleManager(IRoleStore<Role> store, IEnumerable<IRoleValidator<Role>> roleValidators, ILookupNormalizer keyNormalizer, IdentityErrorDescriber errors, ILogger<RoleManager<Role>> logger) : base(store, roleValidators, keyNormalizer, errors, logger)
        {
        }


    }
}