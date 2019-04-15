import * as React from 'react';

import { InjectedSettingsProps, InjectedAuthProps } from '../../../_context';

import {
    injectIntl,
    InjectedIntlProps
} from 'react-intl';

import VoucherFieldsMessages from './VoucherFieldsMessages';

import TextField from '@material-ui/core/TextField';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Grid } from '@material-ui/core';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import { Voucher } from 'src/@types/our-orders';
import CurrenciesField from 'src/components/CurrenciesField/CurrenciesField';
import { IsAdminOrInRole } from 'src/_helpers/roles';
import DateTimeField from 'src/components/DateTimeField/DateTimeField';

export type VoucherFieldsProps =
    InjectedSettingsProps &
    InjectedIntlProps &
    InjectedAuthProps &
    {
        current: Voucher;
        onChange: (changes: Partial<Voucher>) => void;
    };

export class VoucherFields extends React.Component<VoucherFieldsProps> {

    constructor(props: VoucherFieldsProps) {
        super(props);
    }

    render() {
        const { current, onChange, intl: { formatMessage }, settingsCtx, authCtx: { user } } = this.props;

        const {
            InitialValue,
            Value,
            Expiration,
            MultipleUse,
            Used } = current;

        const hasRights = IsAdminOrInRole(user, 'CRUD_VOUCHERS');

        return (
            <GridContainer>
                <Grid item={true} xs={4}>
                    <TextField
                        label={formatMessage(VoucherFieldsMessages.currentValue)}
                        value={Value || 0}
                        inputProps={{ step: '0.01' }}
                        type="number"
                        fullWidth={true}
                        onChange={(e) => {
                            const val = (e.target as HTMLInputElement).value;
                            const parsedVal = val === '' ? 0 : parseFloat(val);
                            onChange({ Value: parsedVal });
                        }}
                        disabled={!hasRights}
                    />
                </Grid>
                <Grid item={true} xs={4}>
                    <TextField
                        label={formatMessage(VoucherFieldsMessages.initialValue)}
                        value={InitialValue || 0}
                        inputProps={{ step: '0.01' }}
                        type="number"
                        fullWidth={true}
                        onChange={(e) => {
                            const val = (e.target as HTMLInputElement).value;
                            const parsedVal = val === '' ? 0 : parseFloat(val);
                            onChange({ InitialValue: parsedVal });
                        }}
                        disabled={!hasRights}
                    />
                </Grid>
                <Grid item={true} xs={4}>
                    <CurrenciesField
                        settingsCtx={settingsCtx}
                        label={formatMessage(VoucherFieldsMessages.currency)}
                        fullWidth={true}
                        value={current.Currency}
                        onChange={(e) => {
                            onChange({ Currency: e.target.value });
                        }}
                        disabled={!hasRights}
                    />
                </Grid>
                <Grid item={true} xs={12}>
                    <DateTimeField
                        label={formatMessage(VoucherFieldsMessages.expiration)}
                        fullWidth={true}
                        onDateChange={(value: Date ) => onChange({ Expiration: value })}
                        date={(
                            Expiration &&
                            new Date(Expiration)
                        ) || undefined
                        }
                        type="text"
                        disabled={!hasRights}
                    />
                </Grid>
                <Grid item={true} xs={6}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={!!MultipleUse}
                                onChange={(e) =>
                                    onChange({ MultipleUse: e.target.checked })
                                }
                                color="primary"
                                disabled={!hasRights}
                            />}
                        label={formatMessage(VoucherFieldsMessages.multipleUse)}
                    />
                </Grid>
                <Grid item={true} xs={6}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={!!Used}
                                onChange={(e) =>
                                    onChange({ Used: e.target.checked })
                                }
                                color="primary"
                                disabled={!hasRights}
                            />}
                        label={formatMessage(VoucherFieldsMessages.usedVoucher)}
                    />
                </Grid>
            </GridContainer>);
    }

}
export default VoucherFields;
export const OrderFieldsStandalone = injectIntl(VoucherFields);