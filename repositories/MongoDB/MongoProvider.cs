using System;
using System.Collections.Generic;
using System.Linq;
using our.orders.Helpers;
using System.Threading.Tasks;
using MongoDB.Driver;
using System.Threading;
using MongoDB.Bson.Serialization;
using our.orders.Models;
using our.orders.Services;
using our.orders.Repositories;
using MongoDB.Bson;
using System.Text.RegularExpressions;

namespace our.orders.Repositories.mongoDb
{

    public class MongoProvider<TImplementation, TInterface> : IRepository<TInterface> where TImplementation : TInterface where TInterface : IModel
    {
        public IMongoCollection<TImplementation> MongoCollection { get; }

        public IQueryable<TInterface> Queryable => MongoCollection.AsQueryable().Select(t => (TInterface)t);

        public virtual Task<TInterface> NewAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            var result = Activator.CreateInstance<TImplementation>();
            return Task.FromResult((TInterface)result);
        }

        public MongoProvider(IMongoCollection<TImplementation> mongoCollection)
        {
            this.MongoCollection = mongoCollection;
        }

        public virtual async Task<TInterface> CreateAsync(TInterface model, CancellationToken cancellationToken = default(CancellationToken))
        {
            await MongoCollection.InsertOneAsync((TImplementation)model, cancellationToken: cancellationToken);

            return model;
        }
        public virtual async Task UpdateAsync(TInterface model, CancellationToken cancellationToken = default(CancellationToken))
        {
            var filter = Builders<TImplementation>.Filter.Eq(o => o.Id, model.Id);
            await MongoCollection.ReplaceOneAsync(filter, (TImplementation)model, cancellationToken: cancellationToken);
        }

        public virtual async Task<TInterface> FindAndUpdateAsync(string id, IDictionary<string, object> updates, CancellationToken cancellationToken = default(CancellationToken))
        {
            var type = typeof(TImplementation);
            var classMap = BsonClassMap.LookupClassMap(type);

            var filter = Builders<TImplementation>.Filter.Eq(o => o.Id, id);
            var updateDefinition = Builders<TImplementation>.Update.Set(o => o.LastMod, DateTime.UtcNow);

            foreach (var update in updates)
            {
                var memberMap = classMap.GetMemberMap(update.Key);

                if (memberMap == null) continue;

                updateDefinition = _SetValue(memberMap, updateDefinition, update.Value);

            }

            return await MongoCollection.FindOneAndUpdateAsync(filter, updateDefinition, new FindOneAndUpdateOptions<TImplementation> { ReturnDocument = ReturnDocument.After }, cancellationToken);
        }


        private static object _GetSafeValue(BsonMemberMap memberMap, object newValue)
        {
            //This method is used to convert binding model properties to entity properties and set the new value
            var t = Nullable.GetUnderlyingType(memberMap.MemberType) ?? memberMap.MemberType;
            if (t.IsEnum && newValue is string newValueString) return Enum.Parse(t, newValueString);
            return (newValue == null) ? null : Convert.ChangeType(newValue, t);


        }
        private static UpdateDefinition<TImplementation> _SetValue(BsonMemberMap memberMap, UpdateDefinition<TImplementation> update, object newValue)
        {
            var safeVal = _GetSafeValue(memberMap, newValue);
            return update.Set(memberMap.ElementName, safeVal);

        }

        /// <summary>
        /// Delete the entry with the passed id
        /// </summary>
        /// <param name="id"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        public virtual async Task DeleteAsync(string id, CancellationToken cancellationToken = default(CancellationToken))
        {
            var filter = Builders<TImplementation>.Filter.Eq(o => o.Id, id);
            await MongoCollection.DeleteOneAsync(filter, cancellationToken);

        }


        private static FilterDefinition<TImplementation> _ConvertToFilterDefinition(Filter filter)
        {

            switch (filter.Operator)
            {
                case FilterOperator.and:
                    return filter.Children.Count() > 1 ? Builders<TImplementation>.Filter.And(filter.Children.Select(f => _ConvertToFilterDefinition(f))) : _ConvertToFilterDefinition(filter.Children.FirstOrDefault());
                case FilterOperator.or:
                    return filter.Children.Count() > 1 ? Builders<TImplementation>.Filter.Or(filter.Children.Select(f => _ConvertToFilterDefinition(f))) : _ConvertToFilterDefinition(filter.Children.FirstOrDefault());
                    // case FilterOperator.text:
                    //     return Builders<TImplementation>.Filter.Text(filter.Value as string, new TextSearchOptions { CaseSensitive = false, DiacriticSensitive = false });
            }

            var type = typeof(TImplementation);
            var classMap = BsonClassMap.LookupClassMap(type);
            var memberMap = classMap.GetMemberMap(filter.Property);

            while (memberMap == null && (classMap = classMap.BaseClassMap) != null)
            {
                memberMap = classMap.GetMemberMap(filter.Property);
            }

            if (memberMap == null)
            {
                // alias properties here
                return Builders<TImplementation>.Filter.Empty;
            }
            switch (filter.Operator)
            {
                case FilterOperator.isnull:
                    return Builders<TImplementation>.Filter.Eq(memberMap.MemberName, null as object);
                case FilterOperator.isnotnull:
                    return Builders<TImplementation>.Filter.Ne(memberMap.MemberName, null as object);
                    // case FilterOperator.text:
                    //     return Builders<TImplementation>.Filter.Text(filter.Value as string, new TextSearchOptions { CaseSensitive = false, DiacriticSensitive = false });
            }


            var value = _GetSafeValue(memberMap, filter.Value);
            switch (filter.Operator)
            {
                case FilterOperator.eq:
                    return Builders<TImplementation>.Filter.Eq(memberMap.MemberName, value);
                case FilterOperator.gt:
                    return Builders<TImplementation>.Filter.Gt(memberMap.MemberName, value);
                case FilterOperator.gte:
                    return Builders<TImplementation>.Filter.Gte(memberMap.MemberName, value);
                case FilterOperator.lt:
                    return Builders<TImplementation>.Filter.Lt(memberMap.MemberName, value);
                case FilterOperator.lte:
                    return Builders<TImplementation>.Filter.Lte(memberMap.MemberName, value);
                case FilterOperator.ne:
                    return Builders<TImplementation>.Filter.Ne(memberMap.MemberName, value);
                case FilterOperator.like:
                    return Builders<TImplementation>.Filter.Regex(memberMap.MemberName, new BsonRegularExpression($"{Regex.Escape(value.ToString())}"));
                    // case FilterOperator.regex:
                    //     if (value == null) throw new AppException("a regex filter needs a not null value");
                    //     if (!(value is string stringvalue)) throw new AppException("a regex filter needs a string value");
                    //     // value can be 'pattern' or '/pattern/' or '/pattern/options'
                    //     var array = stringvalue.Trim('/').Split('/').ToList();

                    //     if (array.Count == 1 || array.Last().EndsWith("\\")) array.Add("");

                    //     var pattern = string.Join("/", array.Take(array.Count - 1));
                    //     var options = array.Last();

                    //     return Builders<TImplementation>.Filter.Regex(memberMap.MemberName, new BsonRegularExpression(pattern, options));
            }
            return Builders<TImplementation>.Filter.Empty;
        }

        /// <summary>
        /// Delete the entry with the passed id
        /// </summary>
        /// <param name="id"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        public virtual Task<IEnumerable<TInterface>> FindAsync(Filter filter = null, IEnumerable<string> sort = null, string query = null, CancellationToken cancellationToken = default(CancellationToken))
        {
            var findFilter = filter != null ? _ConvertToFilterDefinition(filter) : FilterDefinition<TImplementation>.Empty;

            // TODO: check performance
            // return await MongoCollection.Find(findFilter).ToListAsync(cancellationToken);
            // proabably better to use Enumerable because we will most of the time use page system
            // we don't need the whole list as it will be .Skip() and .Take()
            var fluent = MongoCollection.Find(findFilter);
            if (sort != null && sort.Any())
            {
                var sortDef = Builders<TImplementation>.Sort.Combine(
                    sort.Select((s) =>
                    {
                        if (s.StartsWith("-")) return Builders<TImplementation>.Sort.Descending(s.Trim('-'));
                        else return Builders<TImplementation>.Sort.Ascending(s);
                    })
                );
                fluent = fluent.Sort(sortDef);
            }
            else
            {
                fluent = fluent.SortByDescending(s => s.Creation);
            }
            return Task.FromResult(fluent.ToEnumerable(cancellationToken).Cast<TInterface>());

        }

        /// <summary>
        /// Gets the entry with the specified id
        /// </summary>
        /// <param name="id"></param>
        /// <param name="cancellationToken"></param>
        /// <returns></returns>
        public virtual async Task<TInterface> GetByIdAsync(string id, CancellationToken cancellationToken = default(CancellationToken))
        {
            var filter = Builders<TImplementation>.Filter.Eq(o => o.Id, id);
            var fluent = MongoCollection.Find(filter);
            return await fluent.FirstOrDefaultAsync(cancellationToken);
        }


        public virtual async Task<IEnumerable<TInterface>> CreateManyAsync(IEnumerable<TInterface> models, CancellationToken cancellationToken = default(CancellationToken))
        {
            var casted = models.Cast<TImplementation>();
            if (casted.Any())
                await MongoCollection.InsertManyAsync(casted, new InsertManyOptions { }, cancellationToken);
            return models;
        }

        public Task<long> CountAsync(Filter filter = null, CancellationToken cancellationToken = default(CancellationToken))
        {
            var findFilter = filter != null ? _ConvertToFilterDefinition(filter) : FilterDefinition<TImplementation>.Empty;
            return MongoCollection.CountAsync(findFilter, cancellationToken: cancellationToken);
        }

        public async Task DeleteManyAsync(Filter filter, CancellationToken cancellationToken = default(CancellationToken))
        {
            var deleteFilter = _ConvertToFilterDefinition(filter);
            await MongoCollection.DeleteManyAsync(deleteFilter, cancellationToken);
        }

        public async Task ReplaceAsync(string id, TInterface model, CancellationToken cancellationToken = default(CancellationToken))
        {
            var replaceFilter = Builders<TImplementation>.Filter.Eq(o => o.Id, id);
            await MongoCollection.ReplaceOneAsync(replaceFilter, (TImplementation)model, cancellationToken: cancellationToken);
        }

        public async Task ReplaceAsync(Filter filter, TInterface model, CancellationToken cancellationToken = default(CancellationToken))
        {
            var replaceFilter = _ConvertToFilterDefinition(filter);
            await MongoCollection.ReplaceOneAsync(replaceFilter, (TImplementation)model, cancellationToken: cancellationToken);
        }

    }
}