using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using our.orders.helpers;
using our.orders.Identity;
using our.orders.Models;
using our.orders.test.Fixtures;
using Xunit;


namespace our.orders.test.Identity
{
    public class UserShould : IClassFixture<DatabaseFixture>
    {


        private readonly DatabaseFixture databaseFixture;


        // private readonly CancellationToken cancellationToken = default(CancellationToken);


        public UserShould(DatabaseFixture identityFixture)
        {
            this.databaseFixture = identityFixture;

        }
        protected UserManager<User> manager => databaseFixture.UserManager;

        [Theory]
        [InlineData("userName1")]
        [InlineData("userNameRandom")]
        public async Task SaveNewUsers(string userName)
        {

            var user = new User
            {
                UserName = userName
            };


            await manager.CreateAsync(user).ContinueWith(async t =>
            {
                var result = t.Result;
                Assert.True(result.Succeeded);
                Assert.Empty(result.Errors);
                await manager.DeleteAsync(user);
            }).Unwrap();
        }


        [Fact]
        public async Task AddNewRole()
        {
            var username = "userAddNewRole";
            var user = new User
            {
                UserName = username
            };

            // create user
            var resultCreation = await manager.CreateAsync(user);
            Assert.True(resultCreation.Succeeded);
            Assert.Empty(resultCreation.Errors);

            // add to admin role
            var resultAddToRole = await manager.AddToRoleAsync(user, RoleStore.ADMIN);
            Assert.True(resultAddToRole.Succeeded);
            Assert.Empty(resultAddToRole.Errors);

            // test if the user is in Admin role
            var found = await manager.FindByNameAsync(username);
            Assert.NotNull(found);

            var isInRole = await manager.IsInRoleAsync(user, RoleStore.ADMIN);
            Assert.True(isInRole);

            // delete user
            var resultDelete = await manager.DeleteAsync(user);
            Assert.True(resultDelete.Succeeded);
            Assert.Empty(resultDelete.Errors);

        }

        [Fact]
        public async Task RemoveFromRole()
        {
            var username = "userRemoveFromRole";
            var user = new User
            {
                UserName = username
            };

            // create user
            var resultCreation = await manager.CreateAsync(user);
            Assert.True(resultCreation.Succeeded);
            Assert.Empty(resultCreation.Errors);

            // add to admin role
            var resultAddToRole = await manager.AddToRoleAsync(user, RoleStore.ADMIN);
            Assert.True(resultAddToRole.Succeeded);
            Assert.Empty(resultAddToRole.Errors);

            // test if the user is in Admin role
            var found = await manager.FindByNameAsync(username);
            Assert.NotNull(found);

            // remove from admin role
            var resultRemove = await manager.RemoveFromRoleAsync(user, RoleStore.ADMIN);
            Assert.True(resultRemove.Succeeded);
            Assert.Empty(resultRemove.Errors);


            var isInRole = await manager.IsInRoleAsync(user, RoleStore.ADMIN);
            Assert.False(isInRole);

            // delete user
            var resultDelete = await manager.DeleteAsync(user);
            Assert.True(resultDelete.Succeeded);
            Assert.Empty(resultDelete.Errors);

        }

        [Theory]
        [InlineData(RoleStore.ADMIN)]
        [InlineData(RoleStore.CRUD_ALL_ORDERS)]
        [InlineData(RoleStore.CRUD_ALL_ORDERS, RoleStore.CRUD_CLIENTS)]
        public async Task CreateWithRoles(params string[] roles)
        {
            var username = "userCreateWithRoles";
            var user = new User
            {
                UserName = username,
                Roles = roles.Select(r => r.ToUpperInvariant())
            };

            // create user
            var resultCreation = await manager.CreateAsync(user);
            Assert.True(resultCreation.Succeeded);
            Assert.Empty(resultCreation.Errors);

            // test if the user is in role
            var found = await manager.FindByNameAsync(username);
            Assert.NotNull(found);

            foreach (var r in roles)
            {
                var isInRole = await manager.IsInRoleAsync(user, r);
                Assert.True(isInRole);
            }

            // delete user
            var resultDelete = await manager.DeleteAsync(user);
            Assert.True(resultDelete.Succeeded);
            Assert.Empty(resultDelete.Errors);

        }

        [Theory]
        [InlineData("containing  spaces")]
        [InlineData("containing—middle—dash")]
        [InlineData("containing$pe*cialCha&")]
        public async Task FailCreatingWithInvalidUsernames(string userName)
        {
            ;
            var user = new User
            {
                UserName = userName
            };


            var result = await manager.CreateAsync(user);
            Assert.False(result.Succeeded);
            Assert.NotEmpty(result.Errors);
        }

        [Theory]
        [InlineData(1)]
        [InlineData(0)]
        public async Task FindByName(int index)
        {
            var users = this.databaseFixture.GetUsers();
            var user = users.ElementAt(index);

            // manager.Users.ToList();
            var foundUser = await manager.FindByNameAsync(user.NormalizedUserName);
            Assert.NotNull(foundUser);
            Assert.Equal(user.UserName, foundUser.UserName);

        }

        [Theory]
        [InlineData(1)]
        [InlineData(0)]
        public async Task FindById(int index)
        {
            var users = this.databaseFixture.GetUsers();
            var user = users.ElementAt(index);

            // manager.Users.ToList();
            var foundUser = await manager.FindByIdAsync(user.Id);
            Assert.NotNull(foundUser);
            Assert.Equal(user.UserName, foundUser.UserName);
            Assert.Equal(user.Id, foundUser.Id);
        }


        [Theory]
        [InlineData("nouserbyname")]
        public async Task FindByName_NoUser_ReturnsNull(string userName)
        {

            var found = await manager.FindByNameAsync(userName);

            Assert.Null(found);
        }

        [Theory]
        [InlineData("userName1")]
        [InlineData("userNameRandom")]
        [InlineData("containing.dot")]
        [InlineData("containing_underscore")]
        [InlineData("containing-dash")]

        public async Task FindById_SavedUser_ReturnsUser(string userName)
        {
            var user = RandomObjects.RandomUser(new string[] { }).Generate();
            user.UserName = userName;

            await manager.CreateAsync(user).ContinueWith(async t =>
            {
                // manager.Users.ToList();
                var foundUser = await manager.FindByNameAsync(userName);
                Assert.NotNull(foundUser);
                Assert.Equal(userName, foundUser.UserName);

            }).Unwrap()
            .ContinueWith(async t =>
            {
                // put it back :
                await manager.DeleteAsync(user);
            }).Unwrap();

        }


        // [Fact]

        // public async Task Delete_ExistingUser()
        // {


        //     var user = new User
        //     {
        //         UserName = "usertodelete"
        //     };

        //     await manager.CreateAsync(user).ContinueWith(async t =>
        //     {
        //         Assert.True(t.Result.Succeeded);


        //         return await manager.DeleteAsync(user);


        //     }).Unwrap()
        //     .ContinueWith(async tt =>
        //     {
        //         Assert.True(tt.Result.Succeeded);

        //         var any = await Users.Find(Builders<User>.Filter.Eq(u => u.Id, user.Id)).AnyAsync();

        //         Assert.False(any);

        //     }).Unwrap();

        // }




        // [Theory]
        // [InlineData("username", "newusername")]
        // [InlineData("user.name", "new.user.name")]
        // public async Task Update_ExistingUser_Updates(string oldusername, string newusername)
        // {

        //     var user = new User
        //     {
        //         UserName = oldusername
        //     };
        //     await manager.CreateAsync(user).ContinueWith(async t =>
        //     {
        //         user.UserName = newusername;
        //         // todo why do we need that ?
        //         user.SecurityStamp = "";

        //         return await manager.UpdateAsync(user);
        //     }).Unwrap()
        //     .ContinueWith(async tt =>
        //     {
        //         var result = tt.Result;

        //         Assert.True(result.Succeeded);
        //         Assert.Empty(result.Errors);

        //         var anyOld = await RandomData.TestUsers Users.Find(Builders<User>.Filter.Eq(u => u.UserName, oldusername)).AnyAsync();
        //         Assert.False(anyOld);

        //         var anyNew = await Users.Find(Builders<User>.Filter.Eq(u => u.UserName, newusername)).AnyAsync();
        //         Assert.True(anyNew);
        //     }).Unwrap()
        //     .ContinueWith(async t =>
        //     {
        //         await manager.DeleteAsync(user);
        //     }).Unwrap();


        // }

        // [Theory]
        // [InlineData("username", "newusername")]
        // [InlineData("user.name", "new.user.name")]

        // public async Task SimpleAccessorsAndGetters(string oldusername, string newusername)

        // {
        //     var user = new User
        //     {
        //         UserName = oldusername
        //     };

        //     Assert.Equal(await manager.GetUserIdAsync(user), user.Id);
        //     Assert.Equal(await manager.GetUserNameAsync(user), user.UserName);

        //     await manager.SetUserNameAsync(user, newusername).ContinueWith(async t =>
        //     {
        //         var result = t.Result;
        //         Assert.True(result.Succeeded);
        //         Assert.Empty(result.Errors);

        //         var anyOld = await Users.Find(Builders<User>.Filter.Eq(u => u.UserName, oldusername)).AnyAsync();
        //         Assert.False(anyOld);

        //         var anyNew = await Users.Find(Builders<User>.Filter.Eq(u => u.UserName, newusername)).AnyAsync();
        //         Assert.True(anyNew);

        //     }).Unwrap()
        //     .ContinueWith(async t =>
        //     {
        //         // put it back :
        //         await manager.SetUserNameAsync(user, oldusername);
        //     }).Unwrap();
        // }

    }
}