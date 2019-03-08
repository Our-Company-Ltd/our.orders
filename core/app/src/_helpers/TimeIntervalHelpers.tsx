import { defineMessages, InjectedIntl } from 'react-intl';
import { TimeInterval } from 'src/@types/our-orders';

export const TimeIntervalMessages = defineMessages({
    Hour: {
        id: `TimeInterval.Hour`,
        defaultMessage: '{itemCount, plural, one {Hour} other {Hours}}',
        description: 'Legend for timeinterval - Hour'
    },
    Day: {
        id: `TimeInterval.Day`,
        defaultMessage: '{itemCount, plural, one {Day} other {Days}}',
        description: 'Legend for timeinterval - Day'
    },
    Week: {
        id: `TimeInterval.Week`,
        defaultMessage: '{itemCount, plural, one {Week} other {Weeks}}',
        description: 'Legend for timeinterval - Week'
    },
    Month: {
        id: `TimeInterval.Month`,
        defaultMessage: '{itemCount, plural, one {Month} other {Months}}',
        description: 'Legend for timeinterval - Month'
    },
    Year: {
        id: `TimeInterval.Year`,
        defaultMessage: '{itemCount, plural, one {Year} other {Years}}',
        description: 'Legend for timeinterval - Year'
    }
});

export const GetTimeIntervalLegend = (intl: InjectedIntl, interval: TimeInterval, value?: number): string => {
    var message = TimeIntervalMessages[interval] ||
        { defaultMessage: interval.toString(), id: `TimeInterval.${interval}` };

    return intl.formatMessage(message, { itemCount: value === undefined ? 1 : value });
};