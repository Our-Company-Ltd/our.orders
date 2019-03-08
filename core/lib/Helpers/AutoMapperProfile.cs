using System;
using System.Collections.Generic;
using System.Linq;
using AutoMapper;
using Microsoft.AspNetCore.JsonPatch;
using Microsoft.AspNetCore.JsonPatch.Operations;
using Microsoft.Extensions.DependencyInjection;
using our.orders.Dtos;
using our.orders.Identity;
using our.orders.Models;
using our.orders.Newsletter;
using our.orders.Payments;

namespace our.orders.Helpers
{
    public class AutoMapperProfile : Profile
    {
        public AutoMapperProfile(IServiceProvider sp, IAppSettings appsettings, Configuration configuration, AppEvents appEvents)
        {

            // https://github.com/aspnet/JsonPatch/issues/31
            CreateMap(typeof(JsonPatchDocument<>), typeof(JsonPatchDocument<>));
            CreateMap(typeof(Operation<>), typeof(Operation<>));

            CreateMap<User, AccountDto>();
            CreateMap<AccountDto, User>();

            CreateMap<User, UserDto>();
            CreateMap<UserDto, User>().ForMember(u => u.Roles, d => d.MapFrom(x => x.Roles.Select(Role.Normalize)));

            CreateMap(typeof(OrderDto), appsettings.OrderType);
            CreateMap<IOrder, OrderDto>();
            CreateMap(typeof(OrderDto), typeof(IOrder)).As(appsettings.OrderType);

            CreateMap<IPerson, Person>();
            // CreateMap<IPerson, PersonDto>();

            CreateMap<Person, IPerson>();
            // CreateMap<PersonDto, IPerson>();

            CreateMap(typeof(ProductDto), appsettings.ProductType);
            CreateMap<IProduct, ProductDto>();
            CreateMap<IProduct, ProductPreviewDto>();
            CreateMap(typeof(ProductDto), typeof(IProduct)).As(appsettings.ProductType);


            CreateMap<IClient, ClientDto>();

            CreateMap(typeof(ClientDto), appsettings.ClientType);
            CreateMap(typeof(ClientDto), typeof(IClient))
                .As(appsettings.ClientType);

            // mapper from order to product 
            CreateMap<IProduct, OrderItem>();


            CreateMap<Configuration, ConfigurationDto>();

            appEvents.OnTypeMapping(this, this);
        }
    }
    public static class AutoMapperExtensions
    {
        public static TDestination Map<TDestination>(this IMapper mapper, IProduct product, string currency = null, IEnumerable<string> options = null) where TDestination : OrderItem
        {

            return mapper.Map<TDestination>(product, (opts) =>
            {
                if (currency != null)
                    opts.Items.Add(OrderItemBasePriceResolver.CURRENCY_KEY, currency);
                if (options != null)
                    opts.Items.Add(OrderItemBasePriceResolver.OPTIONS_KEY, options);
            });
        }
    }
}