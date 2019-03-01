using System;
using System.Collections.Generic;
using System.Linq;
using our.orders.Helpers;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;

using System.Threading;
using System.Collections.Concurrent;
using our.orders.Models;
using our.orders.Services;
using our.orders.Repositories;

using System.Reflection;
using System.Text.RegularExpressions;

namespace our.orders.Repositories.InMemory
{
    public class InMemoryRepository<TImplementation, TInterface> : IRepository<TInterface> where TImplementation : class, TInterface where TInterface : IModel
    {
        private readonly IServiceProvider services;

        public InMemoryRepository(IServiceProvider services)
        {
            this.services = services;
        }
        public static ConcurrentDictionary<string, TImplementation> Store = new ConcurrentDictionary<string, TImplementation>();

        public IQueryable<TInterface> Queryable => Store.Values.Cast<TInterface>().AsQueryable();

        public virtual Task<TInterface> NewAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            var model = services.GetService<TInterface>();
            return Task.FromResult(model);
        }

        public virtual Task<TInterface> CreateAsync(TInterface model, CancellationToken cancellationToken = default(CancellationToken))
        {
            if (string.IsNullOrEmpty(model.Id)) model.Id = InMemoryObjectId.GenerateNewId().ToString();
            Store[model.Id] = (TImplementation)model;
            return Task.FromResult(model);
        }
        public virtual Task UpdateAsync(TInterface model, CancellationToken cancellationToken = default(CancellationToken))
        {
            if (string.IsNullOrEmpty(model.Id)) model.Id = InMemoryObjectId.GenerateNewId().ToString();
            Store[model.Id] = (TImplementation)model;
            return Task.CompletedTask;
        }

        public virtual Task<TInterface> FindAndUpdateAsync(string id, IDictionary<string, object> updates, CancellationToken cancellationToken = default(CancellationToken))
        {

            var model = Store[id];

            var type = typeof(TImplementation);

            foreach (var update in updates)
            {
                var memberInfo = type.GetMember(update.Key).FirstOrDefault();
                if (memberInfo == null) continue; // no member with this name

                var value = update.Value;

                switch (memberInfo)
                {
                    case PropertyInfo propertyInfo:
                        {
                            var safeValue = _GetSafeValue(propertyInfo.PropertyType, value);
                            propertyInfo.SetValue(model, safeValue);
                        }
                        break;
                    case FieldInfo fieldInfo:
                        {
                            var safeValue = _GetSafeValue(fieldInfo.FieldType, value);
                            fieldInfo.SetValue(model, safeValue);
                        }
                        break;

                }
            }

            return Task.FromResult((TInterface)model);
        }


        private static object _GetSafeValue(Type type, object newValue)
        {
            //This method is used to convert binding model properties to entity properties and set the new value
            var t = Nullable.GetUnderlyingType(type) ?? type;
            return (newValue == null) ? null : Convert.ChangeType(newValue, t);


        }

        /// <summary>
        /// Delete the entry with the passed id
        /// </summary>
        /// <param name="id"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        public virtual Task DeleteAsync(string id, CancellationToken cancellationToken = default(CancellationToken))
        {
            Store.Remove(id, out TImplementation deleted);
            return Task.CompletedTask;
        }



        /// <summary>
        /// Delete the entry with the passed id
        /// </summary>
        /// <param name="id"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        public virtual Task<IEnumerable<TInterface>> FindAsync(Filter filter = null, IEnumerable<string> sort = null, string query = null, CancellationToken cancellationToken = default(CancellationToken))
        {
            IQueryable<TImplementation> fluent;
            if (filter != null)
            {
                var predicate = filter.Predicate<TImplementation>().Compile();
                fluent = Store.Values.Where(predicate).AsQueryable();
            }
            else
            {
                fluent = Store.Values.AsQueryable();
            }

            var sortKey = sort?.FirstOrDefault();
            if (sortKey != null)
                fluent = fluent.OrderBy(sortKey.TrimStart('-'), sortKey.StartsWith('-'));

            return Task.FromResult(fluent.Cast<TInterface>().AsEnumerable());
        }

        /// <summary>
        /// Gets the entry with the specified id
        /// </summary>
        /// <param name="id"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        public virtual Task<TInterface> GetByIdAsync(string id, CancellationToken cancellationToken = default(CancellationToken))
        {
            if(!Store.ContainsKey(id)) {
                return Task.FromResult<TInterface>(default(TInterface));
            }
            return Task.FromResult((TInterface)Store[id]);
        }


        public virtual Task<IEnumerable<TInterface>> CreateManyAsync(IEnumerable<TInterface> models, CancellationToken cancellationToken = default(CancellationToken))
        {
            foreach (var model in models)
            {
                if (string.IsNullOrEmpty(model.Id)) model.Id = InMemoryObjectId.GenerateNewId().ToString();
                Store[model.Id] = (TImplementation)model;
            }
            return Task.FromResult(models);
        }

        public Task<long> CountAsync(Filter filter = null, CancellationToken cancellationToken = default(CancellationToken))
        {
            if (filter == null) return Task.FromResult(Convert.ToInt64(Store.Count()));
            var predicate = filter.Predicate<TImplementation>().Compile(); ;
            return Task.FromResult(Convert.ToInt64(Store.Values.Where(predicate).Count()));
        }

        public Task DeleteManyAsync(Filter filter, CancellationToken cancellationToken = default(CancellationToken))
        {
            var predicate = filter.Predicate<TImplementation>().Compile();
            foreach (var toDelete in Store.Values.Where(predicate))
            {
                Store.Remove(toDelete.Id, out TImplementation deleted);
            }

            return Task.CompletedTask;
        }

        public Task ReplaceAsync(string id, TInterface model, CancellationToken cancellationToken = default(CancellationToken))
        {
            Store[id] = (TImplementation)model;
            return Task.CompletedTask;
        }

        public Task ReplaceAsync(Filter filter, TInterface model, CancellationToken cancellationToken = default(CancellationToken))
        {
            var predicate = filter.Predicate<TImplementation>().Compile();

            var i = Store.Values.FirstOrDefault(o => predicate(o));
            Store[i.Id] = (TImplementation)model;
            return Task.CompletedTask;
        }
    }
}