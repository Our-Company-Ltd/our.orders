using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using our.orders.Identity;
using our.orders.Models;
using our.orders.Repositories;

namespace our.orders.Identity
{
    public class RoleStore : IQueryableRoleStore<Role>
    {

        public const string ADMIN = "Admin";
        public const string LIST_ORDERS = "List_Orders";
        public const string VIEW_DASHBOARD = "View_Dashboard";
        public const string CRUD_ORDERS = "CRUD_Orders";
        public const string CRUD_OWN_ORDERS = "CRUD_Own_Orders";
        public const string CRUD_ALL_ORDERS = "CRUD_All_Orders";
        public const string CRUD_CLIENTS = "CRUD_Clients";
        public const string CRUD_PRODUCTS = "CRUD_Products";
        public const string LIST_VOUCHERS = "List_Vouchers";
        public const string CRUD_VOUCHERS = "CRUD_Vouchers";
        public const string VIEW_SHOPS_MOVEMENTS = "View_Shops_Movements";
        public const string CRUD_SHOPS_MOVEMENTS = "CRUD_Shops_Movements";
        public const string CRUD_STOCKS_UNITS_MOVEMENTS = "CRUD_Stocks_Units_Movements";
        public const string CRUD_USERS = "CRUD_Users";
        public const string CRUD_CATEGORIES = "CRUD_Categories";
        public const string VIEW_SHOPS = "View_Shops";
        public const string CRUD_SHOPS = "CRUD_Shops";
        public const string VIEW_WAREHOUSES = "View_Warehouses";
        public const string CRUD_WAREHOUSES = "CRUD_Warehouses";
        public const string VIEW_TEMPLATES = "View_Templates";
        public const string CRUD_TEMPLATES = "CRUD_Templates";
        public const string VIEW_PAYMENTS = "View_Payments";
        public const string VIEW_CONFIGURATION = "View_Configuration";

        public static List<Role> Store = new List<Role> {
            new Role(RoleStore.ADMIN),
            new Role(RoleStore.LIST_ORDERS),
            new Role(RoleStore.CRUD_ORDERS),
            new Role(RoleStore.CRUD_OWN_ORDERS),
            new Role(RoleStore.CRUD_CLIENTS),
            new Role(RoleStore.CRUD_PRODUCTS),
            new Role(RoleStore.LIST_VOUCHERS),
            new Role(RoleStore.CRUD_VOUCHERS),
            new Role(RoleStore.VIEW_SHOPS_MOVEMENTS),
            new Role(RoleStore.CRUD_SHOPS_MOVEMENTS),
            new Role(RoleStore.CRUD_STOCKS_UNITS_MOVEMENTS),
            new Role(RoleStore.CRUD_USERS),
            new Role(RoleStore.CRUD_CATEGORIES),
            new Role(RoleStore.VIEW_SHOPS),
            new Role(RoleStore.CRUD_SHOPS),
            new Role(RoleStore.VIEW_WAREHOUSES),
            new Role(RoleStore.CRUD_WAREHOUSES),
            new Role(RoleStore.VIEW_TEMPLATES),
            new Role(RoleStore.CRUD_TEMPLATES),
            new Role(RoleStore.VIEW_PAYMENTS),
            new Role(RoleStore.VIEW_CONFIGURATION)
        };

        public RoleStore()
        {
        }

        public IQueryable<Role> Roles => Store.AsQueryable();

        public Task<IdentityResult> CreateAsync(Role role, CancellationToken cancellationToken)
        {
            Store.Add(role);
            return Task.FromResult(IdentityResult.Success);
        }

        public Task<IdentityResult> DeleteAsync(Role role, CancellationToken cancellationToken)
        {
            Store.Remove(role);
            return Task.FromResult(IdentityResult.Success);
        }

        public void Dispose()
        {

        }

        public Task<Role> FindByIdAsync(string roleId, CancellationToken cancellationToken)
        {
            var result = Store.FirstOrDefault(r => r.Id == roleId);
            return Task.FromResult(result);
        }

        public Task<string> GetNormalizedRoleNameAsync(Role role, CancellationToken cancellationToken)
        {
            return Task.FromResult(role.NormalizedName);
        }
        public Task<string> GetRoleIdAsync(Role role, CancellationToken cancellationToken)
        {
            return Task.FromResult(role.Id);
        }

        public Task<string> GetRoleNameAsync(Role role, CancellationToken cancellationToken)
        {
            return Task.FromResult(role.Name);
        }

        public Task SetNormalizedRoleNameAsync(Role role, string normalizedName, CancellationToken cancellationToken)
        {
            role.NormalizedName = normalizedName;
            return Task.CompletedTask;
        }

        public Task SetRoleNameAsync(Role role, string roleName, CancellationToken cancellationToken)
        {
            role.Name = roleName;
            return Task.CompletedTask;
        }

        public Task<IdentityResult> UpdateAsync(Role role, CancellationToken cancellationToken)
        {
            Store.RemoveAll(r => r.Id == role.Id);
            Store.Add(role);
            return Task.FromResult(IdentityResult.Success);
        }

        Task<Role> IRoleStore<Role>.FindByNameAsync(string normalizedRoleName, CancellationToken cancellationToken)
        {
            var result = Store.FirstOrDefault(r => r.NormalizedName == normalizedRoleName);
            return Task.FromResult(result);
        }
    }
}