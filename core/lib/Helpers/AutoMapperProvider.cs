using System;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using AutoMapper;
using AutoMapper.Configuration;

namespace our.orders.Helpers
{
    public class AutoMapperProvider
    {
        

        public AutoMapperProvider(IServiceCollection serviceCollection)
        {
            serviceCollection.AddTransient<OrderItemBasePriceResolver>();
            serviceCollection.AddTransient<OrderItemQuantityResolver>();
        }

        public IMapper GetMapper(IServiceProvider serviceProvider)
        {
            var mce = new MapperConfigurationExpression();
            mce.ConstructServicesUsing((t) =>
            {
                return serviceProvider.GetService(t);
            });

            var profile = serviceProvider.GetService<Profile>();

            mce.AddProfile(profile);

            var mc = new MapperConfiguration(mce);
            // mc.AssertConfigurationIsValid(());

            var mapper = new Mapper(mc, t =>
            {
                return serviceProvider.GetService(t);
            });

            return mapper;
        }
    }
}