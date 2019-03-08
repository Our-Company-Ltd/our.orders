import { StatisticUnit } from '.';

export type StatisticsDimension = 
    'Categories' | 
    'Currencies' | 
    'Countries' | 
    'Shops' | 
    'Methods' | 
    'Users' | 
    'Products';
export type StatisticPeriodReport = {
    StartDate: string;
    EndDate: string;
    Global: StatisticUnit;
    Dimension: { [label: string]: StatisticUnit; }
};
