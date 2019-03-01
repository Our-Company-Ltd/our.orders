using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;
using our.orders.Identity;
using our.orders.Models;
using our.orders.test.Fixtures;
using Xunit;


namespace our.orders.test.Services
{
    public class ServiceShould : IClassFixture<TestServiceFixture>
    {

        private TestService testService => this.databaseFixture.TestService;

        private readonly CancellationToken cancellationToken = default(CancellationToken);
        private readonly TestServiceFixture databaseFixture;

        private IEnumerable<TestServiceModel> models => this.databaseFixture.TestServiceModels;
        public ServiceShould(TestServiceFixture databaseFixture)
        {
            this.databaseFixture = databaseFixture;
        }


        [Fact]
        public async Task ReturnCreatedEntries()
        {
            var user = new TestServiceModel { FirstName = "ReturnCreatedEntries FirstName", LastName = "ReturnCreatedEntries LastName" };
            var result = await testService.CreateAsync(user, cancellationToken);
            Assert.Same(user.Id, result.Id);
            Assert.Same(user.FirstName, result.FirstName);
            Assert.Same(user.LastName, result.LastName);

            await testService.DeleteAsync(user.Id, cancellationToken);
        }

        [Theory]
        [InlineData(2)]
        [InlineData(9)]
        [InlineData(3)]
        [InlineData(8)]
        public async Task ReturnGetById(int index)
        {
            var user = models.ElementAt(index);
            var result = await testService.GetByIdAsync(user.Id, cancellationToken);

            Assert.NotNull(result);

            Assert.Equal(user.Id, result.Id);
            Assert.Equal(user.FirstName, result.FirstName);
            Assert.Equal(user.LastName, result.LastName);
            Assert.Equal(user.Number, result.Number);

        }

        [Theory]
        [InlineData(3)]
        [InlineData(19)]
        [InlineData(21)]
        public async Task FindEntriesWithEq(int index)
        {
            var user = models.ElementAt(index);
            var firstname = user.FirstName;

            var filter = Filter.Eq(nameof(user.FirstName), firstname);


            var result = await testService.FindAsync(filter, cancellationToken: cancellationToken);

            Assert.All(result, (u) =>
            {
                Assert.Equal(firstname, u.FirstName);
            });

            Assert.Equal(models.Count(u => u.FirstName == firstname), result.Count());
        }

        [Theory]
        [InlineData(6)]
        public async Task FindEntriesWithNe(int index)
        {
            var user = models.ElementAt(index);
            var filter = Filter.Ne(nameof(user.FirstName), user.FirstName);
            var result = await testService.FindAsync(filter, cancellationToken: cancellationToken);
            Assert.All(result, (u) =>
            {
                Assert.NotEqual(user.FirstName, u.FirstName);
            });
            // we expect 90 :
            Assert.Equal(models.Count(u => u.FirstName != user.FirstName), result.Count());
        }

        // [Theory]
        // [InlineData(0)]
        // [InlineData(30)]
        // public async Task FindEntriesWithRegex(int index)
        // {
        //     var model = models.ElementAt(index);
        //     var escapedname = Regex.Escape(model.FirstName.ToLowerInvariant());
        //     var pattern = $"^{escapedname}";
        //     var filter = Filter.Regex(nameof(TestServiceModel.FirstName), $"/{pattern}/i");
        //     var result = await testService.FindAsync(filter, cancellationToken: cancellationToken);
        //     var regex = new Regex(pattern, RegexOptions.IgnoreCase);
        //     Assert.All(result, (u) =>
        //     {
        //         Assert.Matches(regex, u.FirstName);
        //     });
        //     // we expect half :
        //     Assert.Equal(models.Count(u => regex.IsMatch(u.FirstName)), result.Count());
        // }

        [Theory]
        [InlineData(30)]
        [InlineData(2)]
        [InlineData(1000)]
        public async Task FindEntriesWithLt(int val)
        {
            var filter = Filter.Lt(nameof(TestServiceModel.Number), val);
            var result = await testService.FindAsync(filter, cancellationToken: cancellationToken);

            Assert.All(result, (u) =>
            {
                Assert.True(u.Number < val);
            });
            // we expect count :
            Assert.Equal(models.Count(u => u.Number < val), result.Count());
        }

        [Theory]
        [InlineData(30)]
        [InlineData(2)]
        [InlineData(1000)]
        public async Task FindEntriesWithLte(int val)
        {
            var filter = Filter.Lte(nameof(TestServiceModel.Number), val);
            var result = await testService.FindAsync(filter, cancellationToken: cancellationToken);
            Assert.All(result, (u) =>
            {
                Assert.True(u.Number <= val);
            });
            // we expect 2 counts :
            Assert.Equal(models.Count(u => u.Number <= val), result.Count());
        }



        [Theory]
        [InlineData(0, 1)]
        [InlineData(10, 30)]
        public async Task FindEntriesWithAnd(int index1, int index2)
        {
            var name0 = models.ElementAt(index1).FirstName;
            var name1 = models.ElementAt(index2).FirstName;

            var filter = Filter.And(
                Filter.Eq(nameof(TestServiceModel.FirstName), name0),
                Filter.Ne(nameof(TestServiceModel.LastName), name1)
            );

            var result = await testService.FindAsync(filter, cancellationToken: cancellationToken);
            Assert.All(result, (u) =>
             {
                 Assert.Equal(name0, u.FirstName);
                 Assert.NotEqual(name1, u.LastName);
             });

            // we expect 9 :
            Assert.Equal(models.Count(u => u.FirstName == name0 && u.LastName != name1), result.Count());
        }

        [Theory]
        [InlineData(0, 11)]
        [InlineData(20, 25)]
        public async Task FindEntriesWithOr(int index1, int index2)
        {
            var name0 = models.ElementAt(index1).FirstName;
            var name1 = models.ElementAt(index2).FirstName;

            var filter = Filter.Or(
                Filter.Eq(nameof(TestServiceModel.FirstName), name0),
                Filter.Eq(nameof(TestServiceModel.LastName), name1)
            );

            var result = await testService.FindAsync(filter, cancellationToken: cancellationToken);
            Assert.All(result, (u) =>
             {
                 Assert.True(name0 == u.FirstName || name1 == u.LastName);
             });

            // we expect 19 :
            Assert.Equal(models.Count(u => u.FirstName == name0 || u.LastName == name1), result.Count());
        }

        [Theory]
        [InlineData(3)]
        [InlineData(19)]
        [InlineData(21)]
        public async Task FindEntriesWithText(int index)
        {
            var user = models.ElementAt(index);
            var firstname = user.FirstName;


            var filter = Filter.Like("FirstName", firstname);

            var result = await testService.FindAsync(filter, cancellationToken: cancellationToken);

            Assert.Contains(result, r => r.FirstName == firstname);

        }
        [Fact]
        public async Task DeleteEntries()
        {
            var cancellationToken = default(CancellationToken);
            var user = new TestServiceModel { FirstName = "DeleteEntries FirstName", LastName = "DeleteEntries LastName" };
            var task = testService.CreateAsync(user, cancellationToken).ContinueWith(async (t) =>
            {
                var result = t.Result;
                // delete async 
                await testService.DeleteAsync(user.Id, cancellationToken);
            }).Unwrap()
            .ContinueWith(async (t) =>
            {
                var i = await testService.GetByIdAsync(user.Id, cancellationToken);
                Assert.Null(i);
            }).Unwrap();
            await task;
        }
    }
}