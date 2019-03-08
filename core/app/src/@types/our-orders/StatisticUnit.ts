export type StatisticMetric = 'Sales' | 'Amount' | 'Expected' | 'Units';
export type StatisticUnit = {
    [key in StatisticMetric]: number;  
};
