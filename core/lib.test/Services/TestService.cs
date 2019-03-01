using MongoDB.Driver;
using our.orders.Models;
using our.orders.Repositories;
using our.orders.Services;

namespace our.orders.test.Services
{
    public class TestService : Service<TestServiceModel>
        {
            public TestService(IRepository<TestServiceModel> provider, AppEvents appEvents) : base(provider, appEvents)
            {
                
            }
        }
}