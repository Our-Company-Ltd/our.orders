import { TimeInterval, StatisticUnit, StatisticPeriodReport } from '.';

export type StatisticReport = {
    Currency: string;
    StartDate: string;
    EndDate: string;
    Interval: TimeInterval;
    Global: StatisticUnit;

    Report: StatisticPeriodReport[];
};
