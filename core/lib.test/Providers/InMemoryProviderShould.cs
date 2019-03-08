using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Bogus;
using our.orders.Models;
using our.orders.Repositories;
using our.orders.Repositories.InMemory;
using our.orders.test.Fixtures;
using Xunit;


namespace our.orders.test.Services
{
    public class InMemoryRepositoryShould : IRepositoryShould<TestServiceModel, ITestServiceModel>, IClassFixture<DatabaseFixture>
    {
        private readonly DatabaseFixture databaseFixture;

        public InMemoryRepositoryShould(DatabaseFixture databaseFixture)
        {
            this.databaseFixture = databaseFixture;
        }

        public override Faker<TestServiceModel> Generator =>
                new Bogus.Faker<TestServiceModel>().StrictMode(false)
                    .Rules((f, o) =>
                        {
                            var person = f.Person;
                            o.FirstName = person.FirstName;
                            o.Creation = f.Date.Past(5);
                            o.LastMod = o.Creation.Value.Add(f.Date.Timespan());
                            o.LastName = person.LastName;
                            o.Number = f.Random.Int();
                            o.Price = f.Random.Decimal();
                        });

        public override IRepository<ITestServiceModel> CreateProvider()
        {
            return new InMemoryRepository<TestServiceModel, ITestServiceModel>(this.databaseFixture.ServiceProvider);
        }

        [Fact]
        public override Task ReturnCreatedEntries()
        {
            return base.ReturnCreatedEntries();
        }

        [Fact]
        public override Task ReturnGetById()
        {
            return base.ReturnGetById();
        }

        [Fact]
        public override Task FindEntriesWithEq()
        {
            return base.FindEntriesWithEq();
        }

        [Fact]
        public override Task FindEntriesWithNe()
        {
            return base.FindEntriesWithNe();
        }
    }

    public abstract class IRepositoryShould<TImplementation, TInterface> where TInterface : IModel where TImplementation : class, TInterface
    {


        private readonly CancellationToken cancellationToken = default(CancellationToken);

        public IRepositoryShould()
        {

        }

        public abstract IRepository<TInterface> CreateProvider();

        public abstract Bogus.Faker<TImplementation> Generator { get; }


        public virtual async Task ReturnCreatedEntries()
        {
            var provider = CreateProvider();
            var model = Generator.Generate();
            var result = await provider.CreateAsync(model, cancellationToken);

            Assert.NotNull(result?.Id);

        }



        public virtual async Task ReturnGetById()
        {
            var provider = CreateProvider();
            var model = Generator.Generate();
            var result = await provider.CreateAsync(model, cancellationToken);

            Assert.NotNull(result.Id);

            var found = await provider.GetByIdAsync(result.Id, cancellationToken);

            Assert.Same(found.Id, result.Id);
        }

        public class Member
        {
            public Member(string name, Type type, Func<object, object> Get, Action<object, object> Set)
            {
                this.Name = name;
                this.Type = type;
                this.Get = Get;
                this.Set = Set;
            }
            public string Name { get; set; }
            public Type Type { get; set; }

            public Func<object, object> Get { get; set; }

            public Action<object, object> Set { get; set; }
        }
        protected static IEnumerable<Member> _GetMembers()
        {
            var type = typeof(TImplementation);
            var properties = type
                .GetProperties()
                .Where(p => p.GetSetMethod() != null && p.GetGetMethod() != null)
                .Select(p => new Member(p.Name, p.PropertyType, (obj) => p.GetValue(obj), (obj, val) => p.SetValue(obj, val)));

            var fields = type
                .GetFields()
                .Select(p => new Member(p.Name, p.FieldType, (obj) => p.GetValue(obj), (obj, val) => p.SetValue(obj, val)));

            return properties.Concat(fields);
        }

        public Member[] Members = _GetMembers().ToArray();


        public virtual async Task FindEntriesWithEq()
        {
            var provider = CreateProvider();

            var faker = new Bogus.Faker();
            var model = Generator.Generate();
            var member = faker.Random.ArrayElement(Members);
            var created = await provider.CreateAsync(model, cancellationToken);

            var filter = Filter.Eq(member.Name, member.Get(model));

            var result = await provider.FindAsync(filter, cancellationToken: cancellationToken);

            Assert.All(result, (u) =>
            {
                Assert.Equal(member.Get(model), member.Get(u));
            });

        }


        public virtual async Task FindEntriesWithNe()
        {
            var provider = CreateProvider();

            var faker = new Bogus.Faker();
            var model = Generator.Generate();
            var member = faker.Random.ArrayElement(Members);
            var created = await provider.CreateAsync(model, cancellationToken);

            var filter = Filter.Ne(member.Name, member.Get(model));

            var result = await provider.FindAsync(filter, cancellationToken: cancellationToken);

            Assert.All(result, (u) =>
            {
                Assert.NotEqual(member.Get(model), member.Get(u));
            });
        }

        // public virtual async Task FindEntriesWithRegex()
        // {
        //     var provider = CreateProvider();

        //     var faker = new Bogus.Faker();
        //     var model = Generator.Generate();
        //     var member = faker.Random.ArrayElement(Members);
        //     var created = await provider.CreateAsync(model, cancellationToken);

        //     var escapedname = Regex.Escape(member.Get(model).ToString().ToLowerInvariant());
        //     var pattern = $"^{escapedname}";

        //     var filter = Filter.Regex(member.Name, $"/{pattern}/i");

        //     var regex = new Regex(pattern, RegexOptions.IgnoreCase);

        //     var result = await provider.FindAsync(filter, cancellationToken: cancellationToken);

        //     Assert.All(result, (u) =>
        //     {
        //         Assert.Matches(regex, member.Get(u).ToString());
        //     });

        // }

        // [Theory]
        // [InlineData(30)]
        // [InlineData(2)]
        // [InlineData(1000)]
        // public async Task FindEntriesWithLt(int val)
        // {
        //     var provider = CreateProvider();

        //     var faker = new Bogus.Faker();
        //     var model = Generator.Generate();
        //     var member = faker.Random.ArrayElement(Members);
        //     var created = await provider.CreateAsync(model, cancellationToken);

        //     var filter = Filter.Lt(member.Item1, member.Item2(model));

        //     var result = await provider.FindAsync(filter, cancellationToken);

        //     Assert.All(result, (u) =>
        //     {
        //         Assert.True(member.Item2(u));
        //     });

        //     var filter = Filter.Lt(nameof(TestServiceModel.Number), val);
        //     var result = await testService.FindAsync(filter, cancellationToken);

        //     Assert.All(result, (u) =>
        //     {
        //         Assert.True(u.Number < val);
        //     });
        //     // we expect count :
        //     Assert.Equal(models.Count(u => u.Number < val), result.Count());
        // }

        // [Theory]
        // [InlineData(30)]
        // [InlineData(2)]
        // [InlineData(1000)]
        // public async Task FindEntriesWithLte(int val)
        // {
        //     var filter = Filter.Lte(nameof(TestServiceModel.Number), val);
        //     var result = await testService.FindAsync(filter, cancellationToken);
        //     Assert.All(result, (u) =>
        //     {
        //         Assert.True(u.Number <= val);
        //     });
        //     // we expect 2 counts :
        //     Assert.Equal(models.Count(u => u.Number <= val), result.Count());
        // }



        // [Theory]
        // [InlineData(0, 1)]
        // [InlineData(10, 30)]
        // public async Task FindEntriesWithAnd(int index1, int index2)
        // {
        //     var name0 = models.ElementAt(index1).FirstName;
        //     var name1 = models.ElementAt(index2).FirstName;

        //     var filter = Filter.And(
        //         Filter.Eq(nameof(TestServiceModel.FirstName), name0),
        //         Filter.Ne(nameof(TestServiceModel.LastName), name1)
        //     );

        //     var result = await testService.FindAsync(filter, cancellationToken);
        //     Assert.All(result, (u) =>
        //      {
        //          Assert.Equal(name0, u.FirstName);
        //          Assert.NotEqual(name1, u.LastName);
        //      });

        //     // we expect 9 :
        //     Assert.Equal(models.Count(u => u.FirstName == name0 && u.LastName != name1), result.Count());
        // }

        // [Theory]
        // [InlineData(0, 11)]
        // [InlineData(20, 25)]
        // public async Task FindEntriesWithOr(int index1, int index2)
        // {
        //     var name0 = models.ElementAt(index1).FirstName;
        //     var name1 = models.ElementAt(index2).FirstName;

        //     var filter = Filter.Or(
        //         Filter.Eq(nameof(TestServiceModel.FirstName), name0),
        //         Filter.Eq(nameof(TestServiceModel.LastName), name1)
        //     );

        //     var result = await testService.FindAsync(filter, cancellationToken);
        //     Assert.All(result, (u) =>
        //      {
        //          Assert.True(name0 == u.FirstName || name1 == u.LastName);
        //      });

        //     // we expect 19 :
        //     Assert.Equal(models.Count(u => u.FirstName == name0 || u.LastName == name1), result.Count());
        // }

        // [Theory]
        // [InlineData(3)]
        // [InlineData(19)]
        // [InlineData(21)]
        // public async Task FindEntriesWithText(int index)
        // {
        //     var user = models.ElementAt(index);
        //     var firstname = user.FirstName;


        //     var filter = Filter.Text(firstname);

        //     var result = await testService.FindAsync(filter, cancellationToken);


        //     Assert.True(result.Any(r => r.FirstName == firstname));

        // }
        // [Fact]
        // public async Task DeleteEntries()
        // {
        //     var cancellationToken = default(CancellationToken);
        //     var user = new TestServiceModel { FirstName = "DeleteEntries FirstName", LastName = "DeleteEntries LastName" };
        //     var task = testService.CreateAsync(user, cancellationToken).ContinueWith(async (t) =>
        //     {
        //         var result = t.Result;
        //         // delete async 
        //         await testService.DeleteAsync(user.Id, cancellationToken);
        //     }).Unwrap()
        //     .ContinueWith(async (t) =>
        //     {
        //         var i = await testService.GetByIdAsync(user.Id, cancellationToken);
        //         Assert.Null(i);
        //     }).Unwrap();
        //     await task;
        // }

        // [Fact]
        // public async Task UpdateEntries()
        // {
        //     var cancellationToken = default(CancellationToken);
        //     var user = new TestServiceModel { FirstName = "UpdateEntries FirstName", LastName = "UpdateEntries LastName" };
        //     var task = testService.CreateAsync(user, cancellationToken).ContinueWith(async (t) =>
        //     {
        //         var result = t.Result;
        //         // update async 
        //         await testService.FindAndUpdateAsync(user.Id, new Dictionary<string, object> { { "FirstName", "New First Name" } }, cancellationToken);
        //     }).Unwrap()
        //     .ContinueWith(async (t) =>
        //     {
        //         var i = await testService.GetByIdAsync(user.Id, cancellationToken);
        //         // updated the first name
        //         Assert.Equal("New First Name", i.FirstName);
        //         // did not update not explicitly set
        //         Assert.Equal(user.LastName, i.LastName);
        //     }).Unwrap()
        //     .ContinueWith(async (t) =>
        //     {
        //         await testService.DeleteAsync(user.Id, cancellationToken);
        //     }).Unwrap();
        //     await task;
        // }
    }
}