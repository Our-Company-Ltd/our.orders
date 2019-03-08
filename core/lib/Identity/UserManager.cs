using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace our.orders.Identity
{
    /// <summary>
    /// Provides the APIs for managing user in a MongoDB persistence store. 
    /// </summary>
    public class UserManager : UserManager<User>
    {
        /// <summary>
        /// Initializes a new instance of the <see cref="UserManager" /> class. 
        /// </summary>
        /// <param name="store"> The store. </param>
        /// <param name="optionsAccessor"> The options accessor. </param>
        /// <param name="passwordHasher"> The password hasher. </param>
        /// <param name="userValidators"> The user validators. </param>
        /// <param name="passwordValidators"> The password validators. </param>
        /// <param name="keyNormalizer"> The key normalizer. </param>
        /// <param name="errors"> The errors. </param>
        /// <param name="services"> The services. </param>
        /// <param name="logger"> The logger. </param>
        public UserManager(IUserStore<User> store, IOptions<IdentityOptions> optionsAccessor, IPasswordHasher<User> passwordHasher, IEnumerable<IUserValidator<User>> userValidators, IEnumerable<IPasswordValidator<User>> passwordValidators, ILookupNormalizer keyNormalizer, IdentityErrorDescriber errors, IServiceProvider services, ILogger<UserManager<User>> logger)
            : base(store, optionsAccessor, passwordHasher, userValidators, passwordValidators, keyNormalizer, errors, services, logger)
        {
        }

        /// <summary>
        /// Sets the <see cref="User.LastLog" /> for the specified user 
        /// </summary>
        /// <param name="user"> The user. </param>
        /// <param name="lastlog"> The lastlog. </param>
        /// <param name="token"> The token. </param>
        /// <returns></returns>
        public async Task SetLastLogAsync(User user, DateTime lastlog, CancellationToken token = default(CancellationToken))
        {
            user.LastLog = lastlog;
            await Store.UpdateAsync(user, token);
        }

        /// <summary>
        /// Sets the <see cref="User.LastLog" /> for the specified user 
        /// </summary>
        /// <param name="user"> The user. </param>
        /// <param name="preferedLanaguage"> The prefered lanaguage. </param>
        /// <param name="token"> The token. </param>
        /// <returns></returns>
        public async Task SetPreferedLanguageAsync(User user, string preferedLanaguage, CancellationToken token = default(CancellationToken))
        {
            user.PreferedLanguage = preferedLanaguage;
            await Store.UpdateAsync(user, token);
        }
        
        public override string NormalizeKey(string key) => Role.Normalize(key);

    }
}