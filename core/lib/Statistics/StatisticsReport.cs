using System;
using System.Collections.Generic;
using our.orders.Helpers;

namespace our.orders.Statistics
{
    public class StatisticsReport
    {
        public string Currency { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public TimeInterval Interval { get; set; }
        public StatisticMetric Global { get; set; }
        public List<StatisticsPeriodReport> Report { get; set; }

    }
    public class StatisticsPeriodReport
    {
        public DateTime StartDate { get; set; }

        public DateTime EndDate { get; set; }

        public StatisticMetric Global { get; set; }
        public IDictionary<string, StatisticMetric> Dimension { get; set; }


    }
}