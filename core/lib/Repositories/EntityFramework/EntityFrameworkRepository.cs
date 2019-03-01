using System;
using System.Collections.Generic;
using System.Linq;
using our.orders.Helpers;
using System.Threading.Tasks;
using System.Threading;
using Microsoft.Extensions.DependencyInjection;
using our.orders.Models;
using our.orders.Services;
using Microsoft.EntityFrameworkCore;
using our.orders.Statistics;
using our.orders.Identity;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using JetBrains.Annotations;
using System.Linq.Expressions;
using System.ComponentModel.DataAnnotations.Schema;
using Innofactor.EfCoreJsonValueConverter;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace our.orders.Repositories.EntityFramework
{
    public class EntityFrameworkRepository<TImplementation, TModel> : IRepository<TModel> where TModel : IModel where TImplementation : class, TModel
    {
        private readonly DbContext dbContext;
        private readonly DbSet<TImplementation> dbSet;
        private readonly IQueryable<TImplementation> queryable;
        private readonly IServiceProvider services;

        public EntityFrameworkRepository(DbContext dbContext, DbSet<TImplementation> dbSet, IQueryable<TImplementation> queryable, IServiceProvider services)
        {
            this.services = services;
            this.dbContext = dbContext;

            this.dbSet = dbSet;
            this.queryable = queryable;
        }
        public IQueryable<TModel> Queryable => dbSet;


        public Task<long> CountAsync(Filter filter = null, CancellationToken cancellationToken = default(CancellationToken))
        {

            return dbSet.LongCountAsync(filter.Predicate<TModel>(), cancellationToken);
        }

        public async Task<TModel> CreateAsync(TModel model, CancellationToken cancellationToken = default(CancellationToken))
        {
            var result = await dbSet.AddAsync((TImplementation)model, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
            return model;
        }

        public async Task<IEnumerable<TModel>> CreateManyAsync(IEnumerable<TModel> models, CancellationToken cancellationToken = default(CancellationToken))
        {
            await dbSet.AddRangeAsync(models.Cast<TImplementation>(), cancellationToken).ContinueWith(t =>
            {
                var e = t.Exception;
            });
            await dbContext.SaveChangesAsync(cancellationToken);
            return models;
        }

        public async Task DeleteAsync(string id, CancellationToken cancellationToken = default(CancellationToken))
        {
            var model = await NewAsync(cancellationToken);
            model.Id = id;
            dbSet.Attach((TImplementation)model);
            dbSet.Remove((TImplementation)model);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        public async Task DeleteManyAsync(Filter filter, CancellationToken cancellationToken = default(CancellationToken))
        {
            var models = await FindAsync(filter, cancellationToken: cancellationToken);
            dbSet.RemoveRange(models.Cast<TImplementation>());
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        public async Task<IEnumerable<TModel>> FindAsync(Filter filter = null, IEnumerable<string> sort = null, string query = null, CancellationToken cancellationToken = default(CancellationToken))
        {
            var results = filter != null ? queryable.Where(filter.Predicate<TModel>()) : queryable;

            var sortKey = sort?.FirstOrDefault();
            if (sortKey != null)
                results = results.OrderBy(sortKey.TrimStart('-'), sortKey.StartsWith('-'));
            return await results.ToListAsync();
        }

        public async Task<TModel> GetByIdAsync(string id, CancellationToken cancellationToken = default(CancellationToken))
        {
            return await queryable.SingleOrDefaultAsync(b => b.Id == id, cancellationToken);
        }

        public Task<TModel> NewAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            var model = services.GetService<TModel>();
            return Task.FromResult(model);
        }

        public async Task UpdateAsync(TModel model, CancellationToken cancellationToken = default(CancellationToken))
        {
            dbSet.Update((TImplementation)model);
            await dbContext.SaveChangesAsync(cancellationToken);
        }
    }
    public class EFDbContextFactory : IDesignTimeDbContextFactory<EFDbContext>
    {
        public EFDbContext CreateDbContext(string[] args)
        {
            return new EFDbContext(null, null);
        }
    }
    public class EFDbContext : DbContext
    {
        private readonly IServiceProvider services;
        private readonly Action<DbContextOptionsBuilder> config;
        public EFDbContext(IServiceProvider services, Action<DbContextOptionsBuilder> config)
        {
            this.services = services;
            this.config = config;
        }
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (config != null)
                config(optionsBuilder);
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            foreach (var entity in builder.Model.GetEntityTypes())
            {
                foreach (var property in entity.ClrType.GetProperties())
                {
                    if (property.CustomAttributes.Any(a => a.AttributeType == typeof(JsonFieldAttribute)))
                    {
                        builder.Entity(entity.ClrType).Property(property.PropertyType, property.Name);
                    }
                }
                // builder.Entity(entity.ClrType)
                // entity.GetNavigations()
            }
            builder.AddJsonFields();
            // builder.Entity<Order>(c =>
            // {
            //     c.Property(e => e.Client).HasJsonValueConversion();
            //     c.Property(e => e.ShippingPerson).HasJsonValueConversion();
            //     c.Property(e => e.Items).HasJsonValueConversion();
            //     c.Property(e => e.Delivery).HasJsonValueConversion();
            // });


        }
        public DbSet<User> Users { get; set; }
        public IRepository<User> GetUsers() => new EntityFrameworkRepository<User, User>(this, Users, Users, services);

        public DbSet<Order> Orders { get; set; }
        public IRepository<IOrder> GetOrders() => new EntityFrameworkRepository<Order, IOrder>(this, Orders, Orders, services);

        public DbSet<Product> Products { get; set; }
        public IRepository<IProduct> GetProducts() => new EntityFrameworkRepository<Product, IProduct>(this, Products, Products.Include(p => p.Products), services);

        public DbSet<Client> Clients { get; set; }
        public IRepository<IClient> GetClients() => new EntityFrameworkRepository<Client, IClient>(this, Clients, Clients, services);


        public DbSet<ShippingTemplate> ShippingTemplates { get; set; }
        public IRepository<IShippingTemplate> GetShippingTemplate() => new EntityFrameworkRepository<ShippingTemplate, IShippingTemplate>(this, ShippingTemplates, ShippingTemplates, services);

        public DbSet<Shop> Shops { get; set; }
        public IRepository<Shop> GetShops() => new EntityFrameworkRepository<Shop, Shop>(this, Shops, Shops, services);


        public DbSet<Movement> Movements { get; set; }
        public IRepository<Movement> GetMovements() => new EntityFrameworkRepository<Movement, Movement>(this, Movements, Movements, services);


        public DbSet<Voucher> Vouchers { get; set; }
        public IRepository<Voucher> GetVouchers() => new EntityFrameworkRepository<Voucher, Voucher>(this, Vouchers, Vouchers, services);

        public DbSet<StockUnit> StockUnits { get; set; }
        public IRepository<StockUnit> GetStockUnits() => new EntityFrameworkRepository<StockUnit, StockUnit>(this, StockUnits, StockUnits, services);

        public DbSet<Warehouse> Warehouses { get; set; }
        public IRepository<Warehouse> GetWarehouses() => new EntityFrameworkRepository<Warehouse, Warehouse>(this, Warehouses, Warehouses, services);

        public DbSet<Category> Categories { get; set; }
        public IRepository<Category> GetCategories() => new EntityFrameworkRepository<Category, Category>(this, Categories, Categories, services);

        public DbSet<DocumentTemplate> DocumentTemplates { get; set; }
        public IRepository<DocumentTemplate> GetDocumentTemplates() => new EntityFrameworkRepository<DocumentTemplate, DocumentTemplate>(this, DocumentTemplates, DocumentTemplates, services);

    }


}