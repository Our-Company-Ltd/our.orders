using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using our.orders.Helpers;
using our.orders.Statistics;

namespace our.orders.Services
{
    public interface IStatisticsService
    {
        Task<StatisticsReport> GetStatsAsync(StatisticEventType type, StatisticEventDimension dimension, DateTime start, int count, TimeInterval timeInterval, CancellationToken cancellationToken = default(CancellationToken));
    }
}