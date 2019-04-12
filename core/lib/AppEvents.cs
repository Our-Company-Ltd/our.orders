using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using our.orders.Models;

namespace our.orders
{
    public class AppEvents : IAppEvents
    {
        public IServiceProvider Services { get; internal set; }
        public event EventHandler<IServiceCollection> Configure;

        public event EventHandler<IServiceProvider> ApplicationStarting;

        public event EventHandler<IApplicationBuilder> ApplicationConfigure;

        public event EventHandler<IServiceProvider> ApplicationStarted;
        public event EventHandler<IServiceProvider> ApplicationStopping;

        public event EventHandler<AutoMapper.Profile> TypeMapping;


        internal void OnOrderStatusChanged(object sender, IOrder arg)
        {
            if (OrderStatusChanged != null)
            {
                OrderStatusChanged(sender, arg);
            }
        }
        public event EventHandler<IOrder> OrderStatusChanged;

        internal void OnTypeMapping(object sender, AutoMapper.Profile profile)
        {
            if (TypeMapping != null)
            {
                TypeMapping(sender, profile);
            }
        }

        internal void OnEntryCreated(object sender, (string id, Type Type, IModel entry) arg)
        {
            if (EntryCreated != null)
            {
                EntryCreated(sender, arg);
            }
        }

        public event EventHandler<(string id, Type Type, IModel entry)> EntryCreated;



        internal void OnEntryRemoved(object sender, (string id, Type Type) arg)
        {
            if (EntryRemoved != null)
            {
                EntryRemoved(sender, arg);
            }
        }

        public event EventHandler<(string id, Type Type)> EntryRemoved;





        internal void OnEntryChanged(object sender, (string id, Type Type, IModel entry) arg)
        {
            if (EntryChanged != null)
            {
                EntryChanged(sender, arg);
            }
        }
        public event EventHandler<(string id, Type Type, IModel entry)> EntryChanged;

        internal void OnPaymentAdded(object sender, (IOrder order, Payment payment) arg)
        {
            if (PaymentAdded != null)
            {
                PaymentAdded(sender, arg);
            }
        }
        public event EventHandler<(IOrder order, Payment payment)> PaymentAdded;

        internal void OnPaymentChanged(object sender, (IOrder order, Payment payment) arg)
        {
            if (PaymentChanged != null)
            {
                PaymentChanged(sender, arg);
            }
        }
        public event EventHandler<(IOrder order, Payment payment)> PaymentChanged;

        internal void OnConfigure(IServiceCollection services)
        {
            if (Configure != null)
            {
                Configure(this, services);
            }
        }
        internal void OnApplicationConfigure(IApplicationBuilder appBuilder)
        {
            if (ApplicationConfigure != null)
            {
                ApplicationConfigure(this, appBuilder);
            }
        }

        internal void OnApplicationStarted(IServiceProvider serviceProvider)
        {
            if (ApplicationStarted != null)
            {
                ApplicationStarted(this, serviceProvider);
            }
        }

        internal void OnApplicationStarting(IServiceProvider serviceProvider)
        {
            if (ApplicationStarting != null)
            {
                ApplicationStarting(this, serviceProvider);
            }
        }

        internal void OnApplicationStopping(IServiceProvider serviceProvider)
        {
            if (ApplicationStopping != null)
            {
                ApplicationStopping(this, serviceProvider);
            }
        }


    }
    public interface IAppEvents
    {
        event EventHandler<IServiceCollection> Configure;


        event EventHandler<IServiceProvider> ApplicationStarted;

        event EventHandler<IServiceProvider> ApplicationStopping;

        event EventHandler<AutoMapper.Profile> TypeMapping;

        event EventHandler<(string id, Type Type, IModel entry)> EntryCreated;
        event EventHandler<(string id, Type Type, IModel entry)> EntryChanged;
        event EventHandler<(string id, Type Type)> EntryRemoved;

        event EventHandler<(IOrder order, Payment payment)> PaymentAdded;

        event EventHandler<(IOrder order, Payment payment)> PaymentChanged;
    }
}
