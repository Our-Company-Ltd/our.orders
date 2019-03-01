using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using our.orders.Models;
using our.orders.Services;

namespace our.orders.Repositories
{
    public interface IRepository<TInterface>
    {
        IQueryable<TInterface> Queryable {get;}

        Task<TInterface> NewAsync(CancellationToken cancellationToken = default(CancellationToken));

        Task<TInterface> GetByIdAsync(string id, CancellationToken cancellationToken = default(CancellationToken));

        Task<IEnumerable<TInterface>> FindAsync(Filter filter = null, IEnumerable<string> sort = null, string query = null, CancellationToken cancellationToken = default(CancellationToken));

        Task<TInterface> CreateAsync(TInterface model, CancellationToken cancellationToken = default(CancellationToken));

        Task<IEnumerable<TInterface>> CreateManyAsync(IEnumerable<TInterface> models, CancellationToken cancellationToken = default(CancellationToken));

        Task UpdateAsync(TInterface model, CancellationToken cancellationToken = default(CancellationToken));

        Task DeleteAsync(string id, CancellationToken cancellationToken = default(CancellationToken));

        // TODO: test this method implementation for Mongo
        Task DeleteManyAsync(Filter filter, CancellationToken cancellationToken = default(CancellationToken));

        Task<long> CountAsync(Filter filter = null, CancellationToken cancellationToken = default(CancellationToken));
    }


}