import * as React from 'react';

import { InjectedIntlProps } from 'react-intl';
import ConfigurationFields from './ConfigurationFields';
import { InjectedSettingsProps } from '../../../_context';
import { Setting } from 'src/@types/our-orders';

export type ConfigurationProps =
    InjectedIntlProps &
    InjectedSettingsProps &  {
    };

class Configuration extends React.Component<ConfigurationProps> {

    constructor(props: ConfigurationProps) {
        super(props);

    }

    render() {

        const { intl, settingsCtx, settingsCtx: { Settings } } = this.props;
        return (
            <ConfigurationFields
                {...{ intl, settingsCtx }}
                initial={Settings || {} as Setting}
            />);
    }
}
export default Configuration;
