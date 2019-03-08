using System.Collections.Generic;

namespace our.orders.Dtos
{
    public class AccountDto
    {
        public virtual bool IsAuthenticated { get; set; }

        public virtual string Id { get; set; }
        public virtual string UserName { get; set; }

        public virtual string ShopId { get; set; }

        public virtual string WarehouseId { get; set; }
        
        public virtual string Email { get; set; }

        public virtual string NormalizedUserName => UserName?.ToLowerInvariant() ?? "";

        public virtual string Password { get; set; }

        public virtual bool RememberMe { get; set; }

        public virtual List<string> Roles { get; set; }
        
        public virtual string FirstName { get; set; }

        public virtual string PhoneNumber { get; set; }
        public virtual string LastName { get; set; }
        public virtual string Token { get; set; }
        public virtual bool isLockedOut { get; set; }
        public virtual bool requiresTwoFactor { get; set; }
        public virtual bool isNotAllowed { get; set; }

        public override string ToString() => $"{UserName}";
    }
}