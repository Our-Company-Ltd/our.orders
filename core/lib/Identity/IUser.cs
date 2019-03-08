using System;
using System.Collections.Generic;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;

namespace our.orders.Identity
{
    public interface IUser
    {
        DateTime? LastLog { get; set; }

        IEnumerable<LoginAttempt> LastLogs { get; set; }

        string PreferedLanguage { get; set; }


        string Id { get; set; }

        string UserName { get; set; }

        string NormalizedUserName { get; set; }

        /// <summary>
        ///     A random value that must change whenever a users credentials change
        ///     (password changed, login removed)
        /// </summary>
        string SecurityStamp { get; set; }

        string Email { get; set; }

        string NormalizedEmail { get; set; }

        bool EmailConfirmed { get; set; }

        string PhoneNumber { get; set; }

        bool PhoneNumberConfirmed { get; set; }

        bool TwoFactorEnabled { get; set; }

        DateTime? LockoutEndDateUtc { get; set; }

        bool LockoutEnabled { get; set; }

        int AccessFailedCount { get; set; }


        IEnumerable<string> Roles { get; set; }

        string PasswordHash { get; set; }

        IEnumerable<IdentityUserLogin> Logins { get; set; }

        void AddLogin(UserLoginInfo login);

        void RemoveLogin(string loginProvider, string providerKey);

        bool HasPassword();

        string Note { get; set; }

        IEnumerable<IdentityUserClaim> Claims { get; set; }

        void AddClaim(Claim claim);

        void RemoveClaim(Claim claim);

        void ReplaceClaim(Claim existingClaim, Claim newClaim);

        IEnumerable<IdentityUserToken> Tokens { get; set; }
        void SetToken(string loginProider, string name, string value);
        string GetTokenValue(string loginProider, string name);

        void RemoveToken(string loginProvider, string name);


    }
}