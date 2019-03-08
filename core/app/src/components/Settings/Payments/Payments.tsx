import * as React from 'react';

import { InjectedIntlProps } from 'react-intl';
import PaymentsFields from './PaymentsFields';
import { InjectedSettingsProps } from '../../../_context';
import { Setting } from 'src/@types/our-orders';

export type PaymentsProps =
    InjectedIntlProps &
    InjectedSettingsProps &  {
    };

class Payments extends React.Component<PaymentsProps> {

    render() {

        const { intl, settingsCtx, settingsCtx: { Settings } } = this.props;
        return (
            <PaymentsFields
                {...{ intl, settingsCtx }}
                initial={Settings || {} as Setting}
            />);
    }
}
export default Payments;
