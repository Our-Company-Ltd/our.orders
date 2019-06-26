import * as React from 'react';
import { FormattedDate } from 'react-intl';
import { FC } from 'react';

export const PrettyDate: FC<{ value: string | number | Date }> = ({ value }) => {
    const weekday = <FormattedDate value={value} weekday="short" />;
    const month = <FormattedDate value={value} month="2-digit" />;
    const day = <FormattedDate value={value} day="2-digit" />;
    const year = <FormattedDate value={value} year="2-digit" />;
    return (
        <React.Fragment>
            {weekday}, {day}/{month}/{year}
        </React.Fragment>);
};