using System;
using AutoMapper;
using our.orders.Models;

namespace our.orders.Helpers
{
    public class OrderItemQuantityResolver : IValueResolver<IProduct, OrderItem, int>
    {   

        public OrderItemQuantityResolver(IServiceProvider serviceprovider) 
        {
        }

        public  int Resolve(IProduct source, OrderItem destination, int destMember, ResolutionContext context)
        {
            return source.MinQuantity ?? 1;
        }
    }
}