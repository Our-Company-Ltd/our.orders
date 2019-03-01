using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using our.orders.Dtos;
using our.orders.Models;
using our.orders.Services;

namespace api
{
    public class Cart
    {
        private readonly IMapper mapper;
        private readonly OrderService orderService;
        private readonly ProductService productService;
        public Cart(IMapper mapper, OrderService orderService, ProductService productService)
        {
            this.productService = productService;
            this.orderService = orderService;
            this.mapper = mapper;

        }

        public async Task<OrderDto> NewAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            var order = await _NewAsync(cancellationToken);
            return this.mapper.Map<OrderDto>(order);
        }

        private async Task<IOrder> _NewAsync(CancellationToken cancellationToken = default(CancellationToken))
        {
            var newOrder = await this.orderService.NewAsync(cancellationToken);
            newOrder.OrderType = OrderType.Cart;
            var order = await this.orderService.CreateAsync(newOrder);
            return order;
        }

        public async Task<OrderDto> GetAsync(string id = null, CancellationToken cancellationToken = default(CancellationToken))
        {
            var order = await _GetAsync(id, cancellationToken);
            return this.mapper.Map<OrderDto>(order);
        }

        private async Task<IOrder> _GetAsync(string id = null, CancellationToken cancellationToken = default(CancellationToken))
        {
            if (string.IsNullOrEmpty(id)) return await _NewAsync();
            var order = await this.orderService.GetByIdAsync(id, cancellationToken);
            return order;
        }


        public async Task<OrderDto> AddAsync(IEnumerable<ProductSelection> selection, string id = null, CancellationToken cancellationToken = default(CancellationToken))
        {

            var order = await this._AddAsync(selection, id, cancellationToken);
            return this.mapper.Map<OrderDto>(order);
        }

        public async Task<IOrder> _AddAsync(IEnumerable<ProductSelection> selection, string id = null, CancellationToken cancellationToken = default(CancellationToken))
        {

            var order = await _GetAsync(id, cancellationToken);
            var result = await _addSelectionAsync(order, selection);

            return result;
        }



        private async Task<IOrder> _addSelectionAsync(IOrder order, IEnumerable<ProductSelection> selection, CancellationToken cancellationToken = default(CancellationToken))
        {
            var items = new List<OrderItem>();
            foreach (var item in selection)
            {
                var product = await productService.GetByIdAsync(item.ProductId, cancellationToken);
                var orderItem = productService.ToOrderItem(order, product, item);
                var subitems = new List<OrderItem>();
                if (item.Products != null)
                    foreach (var subSelection in item.Products)
                    {
                        var subproduct = product.Products?.FirstOrDefault(p => p.Id == subSelection.ProductId);
                        if (subproduct == null) continue;
                        var suborderItem = productService.ToOrderItem(order, subproduct, subSelection);
                        subitems.Add(suborderItem);
                    }
                orderItem.Items = subitems;
                items.Add(orderItem);
            }
            order.Items = order.Items.Concat(items);

            return order;
        }

    }
}