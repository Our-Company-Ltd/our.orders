using System;
using System.ComponentModel;
using System.Linq;
using our.orders.Helpers;
using our.orders.Models;
using our.orders.Repositories;
using our.orders.Services;
namespace our.orders.Statistics
{
    // public class StatisticListener
    // {
    //     private readonly Service<IStatisticEvent> statsEventService;
    //     private readonly AppEvents appEvents;

    //     private readonly IRateProvider rateProvider;
    //     private readonly IAppSettings appSettings;

    //     public StatisticListener(AppEvents appEvents, IAppSettings appSettings, IRepository<IStatisticEvent> statsEventProvider, IRateProvider rateProvider)
    //     {
    //         this.appSettings = appSettings;
    //         this.rateProvider = rateProvider;
    //         this.appEvents = appEvents;
    //         this.statsEventService = new StatisticsEventService(statsEventProvider, appEvents, appSettings);

    //     }

    //     EventHandler<(string id, Type Type, IModel entry)> _OnEntryCreated;
    //     EventHandler<(string id, Type Type, IModel entry)> _OnEntryChanged;
    //     EventHandler<(string id, Type Type)> _OnEntryRemoved;


    //     public void StartListening()
    //     {
    //         var defaultCurrency = appSettings.Currencies.First();
    //         // TODO: check why async event handler create test problems
    //         if (this._OnEntryCreated == null)
    //         {
    //             this._OnEntryCreated = (sender, arg) =>
    //             {
    //                 var (id, Type, entry) = arg;
    //                 if (!(entry is IOrder order)) return;
    //                 var bgw = new BackgroundWorker();
    //                 bgw.DoWork += (_, __) =>
    //                 {

    //                     var newevent = StatisticEvent.FromOrder(order, rateProvider, defaultCurrency, appSettings);
    //                     AsyncHelper.RunSync(() => statsEventService.CreateAsync(newevent));

    //                     var fromProducts = StatisticEvent.FromProducts(order, rateProvider, defaultCurrency, appSettings);
    //                     AsyncHelper.RunSync(() => statsEventService.CreateManyAsync(fromProducts));

    //                     var fromPayment = order.Payments.Select(p => StatisticEvent.FromPayment(order, p, rateProvider, defaultCurrency, appSettings));
    //                     AsyncHelper.RunSync(() => statsEventService.CreateManyAsync(fromPayment));
    //                 };
    //                 bgw.RunWorkerAsync();

    //             };
    //             appEvents.EntryCreated += this._OnEntryCreated;
    //         }
    //         if (this._OnEntryRemoved == null)
    //         {
    //             this._OnEntryRemoved = (sender, arg) =>
    //             {
    //                 var (id, Type) = arg;
    //                 if (!Type.Implements<IOrder>()) return;
    //                 var bgw = new BackgroundWorker();
    //                 bgw.DoWork += (_, __) =>
    //                 {
    //                     var filter = Filter.Eq(nameof(IStatisticEvent.OrderId), id);
    //                     // remove all related to orders: payments, orders, products....
    //                     AsyncHelper.RunSync(() => statsEventService.DeleteManyAsync(filter));
    //                 };
    //                 bgw.RunWorkerAsync();
    //             };
    //             appEvents.EntryRemoved += this._OnEntryRemoved;
    //         }

    //         if (this._OnEntryChanged == null)
    //         {
    //             this._OnEntryChanged = (sender, arg) =>
    //             {
    //                 var (id, Type, entry) = arg;
    //                 if (!(entry is IOrder order)) return;
    //                 var bgw = new BackgroundWorker();
    //                 bgw.DoWork += (_, __) =>
    //                 {

    //                     var filter = Filter.Eq(nameof(IStatisticEvent.OrderId), order.Id);
    //                     // remove all related to orders: payments and orders....
    //                     AsyncHelper.RunSync(() => statsEventService.DeleteManyAsync(filter));

    //                     var newevent = StatisticEvent.FromOrder(order, rateProvider, defaultCurrency, appSettings);
    //                     AsyncHelper.RunSync(() => statsEventService.CreateAsync(newevent));

    //                     var fromProducts = StatisticEvent.FromProducts(order, rateProvider, defaultCurrency, appSettings);
    //                     AsyncHelper.RunSync(() => statsEventService.CreateManyAsync(fromProducts));

    //                     var fromPayment = order.Payments.Select(p => StatisticEvent.FromPayment(order, p, rateProvider, defaultCurrency, appSettings));
    //                     AsyncHelper.RunSync(() => statsEventService.CreateManyAsync(fromPayment));
    //                 };
    //             };
    //             appEvents.EntryChanged += this._OnEntryChanged;
    //         }
    //     }

    //     public void StopListening()
    //     {
    //         if (this._OnEntryCreated != null)
    //         {
    //             appEvents.EntryCreated -= this._OnEntryCreated;
    //             this._OnEntryCreated = null;
    //         }

    //         if (this._OnEntryRemoved != null)
    //         {
    //             appEvents.EntryRemoved -= this._OnEntryRemoved;
    //             this._OnEntryRemoved = null;
    //         }

    //         if (this._OnEntryChanged != null)
    //         {
    //             appEvents.EntryChanged -= this._OnEntryChanged;
    //             this._OnEntryChanged = null;
    //         }




    //     }
    // }
}
