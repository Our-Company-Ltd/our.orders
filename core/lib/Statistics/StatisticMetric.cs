using System.Collections.Generic;
using System.Linq;

namespace our.orders.Statistics
{

   
    public class StatisticMetric
    {
        /// <summary>
        /// number of sales represented
        /// </summary>
        /// <returns></returns>
        public int Sales { get; set; }

        /// <summary>
        /// The amount in the default currency
        /// </summary>
        /// <returns></returns>
        public decimal Amount { get; set; }

        /// <summary>
        /// number of products units represented
        /// </summary>
        /// <returns></returns>
        public int Units { get; set; }

        public static StatisticMetric operator +(StatisticMetric m1, StatisticMetric m2)
        {
            return new StatisticMetric
            {
                Sales = m1.Sales + m2.Sales,
                Amount = m1.Amount + m2.Amount,
                Units = m1.Units + m2.Units
            };
        }
    }
}