using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Security.Claims;
using Innofactor.EfCoreJsonValueConverter;
using Microsoft.AspNetCore.Identity;
using our.orders.Helpers;
using our.orders.Models;

namespace our.orders.Identity
{

    /// <summary>
    /// Respresents a user with Access to Our Orders
    /// </summary>
    /// <seealso cref="Microsoft.AspNetCore.Identity.MongoDB.IdentityUser" />
    public class User : IUser, IModel
    {
        public User()
        {
        }
        [Key]
        public virtual string Id { get; set; }

        public virtual string UserName { get; set; }

        public virtual string NormalizedUserName { get; set; }

        /// <summary>
        ///     A random value that must change whenever a users credentials change
        ///     (password changed, login removed)
        /// </summary>
        public virtual string SecurityStamp { get; set; }

        public virtual string Email { get; set; }

        public virtual string NormalizedEmail { get; set; }

        public virtual bool EmailConfirmed { get; set; }

        public virtual string PhoneNumber { get; set; }

        public virtual bool PhoneNumberConfirmed { get; set; }

        public virtual bool TwoFactorEnabled { get; set; }

        public virtual DateTime? LockoutEndDateUtc { get; set; }

        public virtual bool LockoutEnabled { get; set; }

        public virtual int AccessFailedCount { get; set; }


        [JsonField]
        public IEnumerable<string> Roles { get; set; } = Enumerable.Empty<string>();

        public virtual void AddRole(Role role)
        {
            Roles = Roles.Concat(new string[] { role.NormalizedName });
        }

        public virtual void RemoveRole(Role role)
        {
            Roles = Roles.Where(r => role.NormalizedName != r);
        }
        public virtual string PasswordHash { get; set; }



        [JsonField]
        public IEnumerable<IdentityUserLogin> Logins
        { get; set; }

        public virtual void AddLogin(UserLoginInfo login)
        {
            Logins = Logins.Concat(new IdentityUserLogin[] { new IdentityUserLogin(login) });
        }

        public virtual void RemoveLogin(string loginProvider, string providerKey)
        {
            Logins = Logins.Where(l => l.LoginProvider == loginProvider && l.ProviderKey == providerKey);
        }

        public virtual bool HasPassword()
        {
            return false;
        }

        [JsonField]
        public IEnumerable<IdentityUserClaim> Claims { get; set; } = Enumerable.Empty<IdentityUserClaim>();
        public virtual void AddClaim(Claim claim)
        {
            Claims = Claims.Concat(new IdentityUserClaim[] { new IdentityUserClaim(claim) });
        }

        public virtual void RemoveClaim(Claim claim)
        {
            Claims = Claims.Where(c => c.Type == claim.Type && c.Value == claim.Value);
        }

        public virtual void ReplaceClaim(Claim existingClaim, Claim newClaim)
        {
            var claimExists = Claims
                .Any(c => c.Type == existingClaim.Type && c.Value == existingClaim.Value);
            if (!claimExists)
            {
                // note: nothing to update, ignore, no need to throw
                return;
            }
            RemoveClaim(existingClaim);
            AddClaim(newClaim);
        }

        [JsonField]
        public IEnumerable<IdentityUserToken> Tokens
        { get; set; }

        private IdentityUserToken GetToken(string loginProider, string name)
            => Tokens
                .FirstOrDefault(t => t.LoginProvider == loginProider && t.Name == name);

        public virtual void SetToken(string loginProider, string name, string value)
        {
            var existingToken = GetToken(loginProider, name);
            if (existingToken != null)
            {
                existingToken.Value = value;
                return;
            }
            Tokens = Tokens.Concat(new IdentityUserToken[] {
                new IdentityUserToken
                            {
                                LoginProvider = loginProider,
                                Name = name,
                                Value = value
                            }
                });

        }

        public virtual string GetTokenValue(string loginProider, string name)
        {
            return GetToken(loginProider, name)?.Value;
        }

        public virtual void RemoveToken(string loginProvider, string name)
        {
            Tokens = Tokens.Where(t => t.LoginProvider == loginProvider && t.Name == name);
        }

        public virtual string FirstName { get; set; }
        public virtual string LastName { get; set; }

        public virtual string ShopId { get; set; }

        public virtual string WarehouseId { get; set; }
        /// <summary>
        /// Gets or sets the last successfull login date
        /// </summary>
        /// <value>
        /// The last log.
        /// </value>
        public virtual DateTime? LastLog { get; set; }

        /// <summary>
        /// Gets or sets the last successfull login attempts
        /// </summary>
        /// <value>
        /// The last log.
        /// </value>
        public virtual IEnumerable<LoginAttempt> LastLogs { get; set; }

        /// <summary>
        /// Gets or sets the prefered language
        /// </summary>
        /// <value>
        /// The  the prefered language
        /// </value>
        public string PreferedLanguage { get; set; }

        // TODO: implement LastMod and Creation using usermanager
        public DateTime? LastMod { get; set; }
        public DateTime? Creation { get; set; }

        public string Note { get; set; }

        public string Preview() => $"{FirstName} {LastName}";
    }
}