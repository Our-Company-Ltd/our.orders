using System;
using System.Collections.Generic;
using System.Linq;
using our.orders.Helpers;
using System.Threading.Tasks;
using System.Threading;
using our.orders.Services;
using our.orders.Repositories;
using our.orders.Models;

namespace our.orders.Services
{
    public class Service<TModel> : IService<TModel> where TModel : IModel
    {
        protected readonly IRepository<TModel> provider;
        protected readonly AppEvents appEvents;

        public Service(IRepository<TModel> provider, AppEvents appEvents)
        {
            this.provider = provider;
            this.appEvents = appEvents;
        }

        public virtual async Task<TModel> CreateAsync(TModel model, CancellationToken cancellationToken = default(CancellationToken))
        {
            model.Id = null;
            model.Creation = DateTime.UtcNow;
            var result = await provider.CreateAsync(model, cancellationToken);
            appEvents.OnEntryCreated(this, (result.Id, typeof(TModel), result));
            return result;
        }
        public virtual Task UpdateAsync(TModel model, CancellationToken cancellationToken = default(CancellationToken))
        {
            model.LastMod = DateTime.UtcNow;
            appEvents.OnEntryChanged(this, (model.Id, typeof(TModel), model));

            return provider.UpdateAsync(model, cancellationToken);
        }



        /// <summary>
        /// Delete the entry with the passed id
        /// </summary>
        /// <param name="id"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        public virtual Task DeleteAsync(string id, CancellationToken cancellationToken = default(CancellationToken))
        {
            appEvents.OnEntryRemoved(this, (id, typeof(TModel)));
            return provider.DeleteAsync(id, cancellationToken);
        }

        /// <summary>
        /// Delete the one entry with the passed filter
        /// </summary>
        /// <param name="id"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        public virtual Task DeleteManyAsync(Filter filter, CancellationToken cancellationToken = default(CancellationToken))
        {
            // TODO: There is a design problem here
            appEvents.OnEntryRemoved(this, (null, typeof(TModel)));
            return provider.DeleteManyAsync(filter, cancellationToken);
        }

        /// <summary>
        /// Delete the entry with the passed id
        /// </summary>
        /// <param name="id"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        public virtual Task<IEnumerable<TModel>> FindAsync(Filter filter = null, IEnumerable<string> sort = null, string query = null, CancellationToken cancellationToken = default(CancellationToken))
        {
            return provider.FindAsync(filter, sort, query, cancellationToken);
        }

        /// <summary>
        /// Gets the entry with the specified id
        /// </summary>
        /// <param name="id"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        public virtual Task<TModel> GetByIdAsync(string id, CancellationToken cancellationToken = default(CancellationToken))
        {
            return provider.GetByIdAsync(id, cancellationToken);
        }

        public virtual Task<TModel> PreviewAsync(TModel model, CancellationToken cancellationToken = default(CancellationToken))
        {

            return Task.FromResult(model);
        }


        public virtual async Task<IEnumerable<TModel>> CreateManyAsync(IEnumerable<TModel> models, CancellationToken cancellationToken = default(CancellationToken))
        {
            foreach(var model in models) {
                model.Id = null;
                model.Creation = DateTime.UtcNow;
            }
            var results = await provider.CreateManyAsync(models, cancellationToken);
            foreach (var model in results)
            {
                appEvents.OnEntryCreated(this, (model.Id, typeof(TModel), model));
            }
            return results;
        }

        public Task<long> CountAsync(Filter filter = null, CancellationToken cancellationToken = default(CancellationToken))
        {
            return provider.CountAsync(filter, cancellationToken);
        }

        public virtual Task<TModel> NewAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            return provider.NewAsync(cancellationToken);
        }

        // public Task ReplaceAsync(string id, TModel model, CancellationToken cancellationToken = default(CancellationToken))
        // {
        //     appEvents.OnEntryChanged(this, model);
        //     return provider.ReplaceAsync(id, model, cancellationToken);
        // }

        // public Task ReplaceAsync(Filter filter, TModel model, CancellationToken cancellationToken = default(CancellationToken))
        // {
        //     return provider.ReplaceAsync(filter, model, cancellationToken);
        // }
    }
}