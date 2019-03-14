import * as React from 'react';
import {
    Grid,
    FormControlLabel,
    Switch
} from '@material-ui/core';

import { InjectedIntlProps } from 'react-intl';
import { InjectedSettingsProps } from 'src/_context';
import { Setting } from 'src/@types/our-orders';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import { Check, Close } from '@material-ui/icons';
import Fabs from 'src/components/Fabs/Fabs';
import { withSnackbar, InjectedNotistackProps } from 'notistack';
import NumberField from 'src/components/NumberField/NumberField';
import ConfigurationMessages from './ConfigurationMessages';

export type ConfigurationFieldsProps =
    InjectedIntlProps &
    InjectedSettingsProps &
    InjectedNotistackProps & {
        initial: Setting;
    };

type State = {
    initial: Setting;
    changes: Partial<Setting>;

    expandedIndex?: number;
};

class ConfigurationFields extends React.Component<ConfigurationFieldsProps, State> {
    constructor(props: ConfigurationFieldsProps) {
        super(props);

        this.state = {
            changes: {},
            initial: props.initial
        };
    }

    render() {
        const { initial, changes } = this.state;
        const { intl: { formatMessage } } = this.props;

        const preview = { ...initial, ...changes } as Setting;

        const changed = !!Object.keys(changes).length;

        return (
            <React.Fragment>
                <GridContainer>
                    <Grid item={true} xs={12}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={!!preview.ShowWeight}
                                    onChange={(e) =>
                                        this._HandleChange({ ShowWeight: e.target.checked })}
                                    color="primary"
                                />}
                            label={formatMessage(ConfigurationMessages.showWeight)}
                        />
                    </Grid>
                    <Grid item={true} xs={12}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={!!preview.ShowTaxRateIncluded}
                                    onChange={(e) =>
                                        this._HandleChange({ ShowTaxRateIncluded: e.target.checked })}
                                    color="primary"
                                />}
                            label={formatMessage(ConfigurationMessages.showTaxRateIncluded)}
                        />
                    </Grid>
                    <Grid item={true} xs={12}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={!!preview.ShowTaxRateExcluded}
                                    onChange={(e) =>
                                        this._HandleChange({ ShowTaxRateExcluded: e.target.checked })}
                                    color="primary"
                                />}
                            label={formatMessage(ConfigurationMessages.showTaxRateExcluded)}
                        />
                    </Grid>
                    <Grid item={true} xs={4}>
                        <GridContainer>
                            <Grid item={true} xs={12}>
                                <NumberField
                                    fullWidth={true}
                                    label={formatMessage(ConfigurationMessages.taxRateIncluded)}
                                    step="0.01"
                                    value={preview.TaxRateIncluded}
                                    onNumberChange={(value) =>
                                        this._HandleChange({ TaxRateIncluded: value })}
                                />
                            </Grid>
                            <Grid item={true} xs={12}>
                                <NumberField
                                    fullWidth={true}
                                    label={formatMessage(ConfigurationMessages.taxRateExcluded)}
                                    step="0.01"
                                    value={preview.TaxRateExcluded}
                                    onNumberChange={(value) =>
                                        this._HandleChange({ TaxRateExcluded: value })}
                                />
                            </Grid>
                        </GridContainer>
                    </Grid>
                   
                </GridContainer>

                {changed &&
                    <Fabs
                        map={[{
                            icon: <Check />,
                            onClick: () => { this._HandleSave(); },
                            legend: 'save',
                            color: 'primary',
                            themeColor: 'green',
                        },
                        {
                            icon: <Close />,
                            legend: 'cancel',
                            onClick: () => { this._HandleCancel(); }
                        }]}
                    />
                }
            </React.Fragment>
        );
    }

    private _HandleChange(changes: Partial<Setting>) {
        const newChanges = { ...this.state.changes, ...changes };
        this.setState(() => ({ changes: newChanges }));
    }

    private _HandleSave() {
        const { settingsCtx: { update }, enqueueSnackbar } = this.props;
        const { changes } = this.state;
        if (!Object.keys(changes).length) {
            return;
        }

        update(changes)
            .then((model) => {
                this.setState(
                    () => ({
                        changes: {},
                        initial: model
                    }),
                    () => {
                        enqueueSnackbar('configuration updated with success', { variant: 'success' });
                    });
            })
            .catch((reason) =>
                enqueueSnackbar(`error while updating configuration (${reason})`, { variant: 'error' })
            );

    }
    private _HandleCancel() {
        this.setState(() => ({
            changes: {},
            initial: { ...this.props.initial }
        }));
    }
}

export default withSnackbar(ConfigurationFields);