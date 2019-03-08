using System.Collections.Generic;
using System.Threading.Tasks;
using System.Threading;
using our.orders.Models;
using System;

namespace our.orders.Services
{
    public interface IService<TModel> where TModel : IModel
    {

        Task<TModel> CreateAsync(TModel model, CancellationToken cancellationToken = default(CancellationToken));


        // // TODO: tests
        // Task ReplaceAsync(string id, TModel model, CancellationToken cancellationToken = default(CancellationToken));

        // // TODO: tests
        // Task ReplaceAsync(Filter filter, TModel model, CancellationToken cancellationToken = default(CancellationToken));

        Task<IEnumerable<TModel>> CreateManyAsync(IEnumerable<TModel> models, CancellationToken cancellationToken = default(CancellationToken));

        Task<TModel> NewAsync(CancellationToken cancellationToken = default(CancellationToken));


        Task<TModel> PreviewAsync(TModel model, CancellationToken cancellationToken = default(CancellationToken));

        Task UpdateAsync(TModel model, CancellationToken cancellationToken = default(CancellationToken));

        Task DeleteAsync(string id, CancellationToken cancellationToken = default(CancellationToken));

        // TODO: test this method
        Task DeleteManyAsync(Filter filter, CancellationToken cancellationToken = default(CancellationToken));

        Task<TModel> GetByIdAsync(string id, CancellationToken cancellationToken = default(CancellationToken));

        Task<IEnumerable<TModel>> FindAsync(Filter filter = null, IEnumerable<string> sort = null, string query = null, CancellationToken cancellationToken = default(CancellationToken));

        Task<long> CountAsync(Filter filter = null, CancellationToken cancellationToken = default(CancellationToken));
    }
}