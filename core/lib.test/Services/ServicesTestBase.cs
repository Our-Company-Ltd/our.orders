using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using Microsoft.Extensions.DependencyInjection;
using System.Threading;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;
using our.orders.Identity;
using our.orders.Models;
using our.orders.Services;
using our.orders.test.Fixtures;
using Xunit;
using System;

namespace our.orders.test.Services
{
    public class ServicesTestBase<TService, TModel> : IClassFixture<DatabaseFixture> where TService : IService<TModel> where TModel : IModel
    {

        protected TService Service => this.databaseFixture.ServiceProvider.GetService<TService>();

        protected readonly CancellationToken cancellationToken = default(CancellationToken);
        protected readonly DatabaseFixture databaseFixture;
        public ServicesTestBase(DatabaseFixture databaseFixture)
        {
            this.databaseFixture = databaseFixture;
        }

        public virtual async Task BaseTests()
        {
            await ReturnCreatedEntries();
            await DeleteEntries();
            await PreviewEntries();
            await ReturnGetById();
        }

        protected virtual async Task ReturnCreatedEntries()
        {
            var model = await Service.NewAsync(cancellationToken);
            var result = await Service.CreateAsync(model, cancellationToken);

            Assert.Same(model.Id, result.Id);

        }

        protected virtual async Task DeleteEntries()
        {
            var model = await Service.NewAsync(cancellationToken);
            var result = await Service.CreateAsync(model, cancellationToken);

            var found = await Service.GetByIdAsync(result.Id, cancellationToken);

            Assert.NotNull(result);
            Assert.Equal(result.Id, found.Id);

            await Service.DeleteAsync(result.Id, cancellationToken);

            var deleted = await Service.GetByIdAsync(result.Id, cancellationToken);
            Assert.Null(deleted);
        }

        protected virtual async Task PreviewEntries()
        {
            var model = await Service.NewAsync(cancellationToken);


            var result = await Service.PreviewAsync(model, cancellationToken);

            Assert.NotNull(result);
            Assert.Equal(result.Id, result.Id);
        }



        public virtual async Task ReturnGetById()
        {
            var model = await Service.NewAsync(cancellationToken);
            var result = await Service.CreateAsync(model, cancellationToken);

            var found = await Service.GetByIdAsync(result.Id, cancellationToken);

            Assert.NotNull(result);
            Assert.Equal(result.Id, found.Id);

        }
    }
}