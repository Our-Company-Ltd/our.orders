import * as React from 'react';

import { InjectedSettingsProps, InjectedAuthProps, InjectedUsersProps, InjectedShopProps } from '../../../_context';

import {
    InjectedIntlProps
} from 'react-intl';

import MovementsFieldsMessages from './MovementsFieldsMessages';

import TextField from '@material-ui/core/TextField';
import MenuItem from '@material-ui/core/MenuItem';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import { Select, FormControl, InputLabel, Grid } from '@material-ui/core';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import { Movement, User } from 'src/@types/our-orders';
import NumberField from 'src/components/NumberField/NumberField';
import CurrenciesField from 'src/components/CurrenciesField/CurrenciesField';
import DateTimeField from 'src/components/DateTimeField/DateTimeField';

export type MovementsFieldsProps =
    InjectedShopProps &
    InjectedUsersProps &
    InjectedAuthProps &
    InjectedSettingsProps &
    InjectedIntlProps &
    {
        current: Movement;
        onChange: (changes: Partial<Movement>) => void;
    };

class MovementsFields extends React.Component<MovementsFieldsProps> {

    constructor(props: MovementsFieldsProps) {
        super(props);
    }

    render() {
        const {
            settingsCtx,
            shopCtx: { Shops },
            usersCtx, authCtx, current, onChange, intl: { formatMessage }
        } = this.props;

        const {
            Amount,
            Archived,
            UserId,
            ShopId,
            Note,
            Date: date
        } = current;

        const isAmdin = this._isAdmin(authCtx.user);

        return (
            <GridContainer>
                <Grid item={true} xs={6}>
                    <NumberField
                        label={formatMessage(MovementsFieldsMessages.amount)}
                        value={Amount || 0}
                        step="0.01"
                        fullWidth={true}
                        onNumberChange={(amount) => {
                            onChange({ Amount: amount });
                        }}
                    />
                </Grid>
                <Grid item={true} xs={6}>
                    {
                        <CurrenciesField
                            {...{ settingsCtx }}
                            fullWidth={true}
                            label={formatMessage(MovementsFieldsMessages.currency)}
                            value={current.Currency}
                            onChange={(e) => {
                                onChange({ Currency: e.target.value });
                            }}
                        />
                    }
                </Grid>
                <Grid item={true} xs={6}>
                    <TextField
                        fullWidth={true}
                        select={true}
                        label={formatMessage(MovementsFieldsMessages.shop)}
                        onChange={(e) => onChange({ ShopId: e.target.value })}
                        value={ShopId || ''}
                        disabled={!isAmdin}
                    >
                        {Shops.map(s =>
                            <MenuItem key={s.Id} value={s.Id}>{s.Name}</MenuItem>)
                        }
                    </TextField>
                </Grid>
                <Grid item={true} xs={6}>
                    <FormControl fullWidth={true}>
                        <InputLabel>
                            {formatMessage(MovementsFieldsMessages.user)}
                        </InputLabel>
                        <Select
                            fullWidth={true}
                            onChange={(e) => onChange({ UserId: e.target.value })}
                            value={UserId || ''}
                            readOnly={!isAmdin}
                        >
                            {usersCtx.Users.map(u =>
                                <MenuItem key={u.Id} value={u.Id}>{u.FirstName} {u.LastName}</MenuItem>)
                            }
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item={true} xs={6}>
                    <DateTimeField
                        label="Date"
                        fullWidth={true}
                        onDateChange={(value: Date) => onChange({ Date: value })}
                        date={(date &&
                            new Date(date))
                            || new Date()}
                        type="text"
                    />
                    
                </Grid>
                <Grid item={true} xs={6}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={!!Archived}
                                onChange={(e) =>
                                    onChange({ Archived: e.target.checked })
                                }
                                color="primary"
                            />}
                        label={formatMessage(MovementsFieldsMessages.archived)}
                    />
                </Grid>
                <Grid item={true} xs={12}>
                    <TextField
                        fullWidth={true}
                        multiline={true}
                        label={formatMessage(MovementsFieldsMessages.note)}
                        value={Note || ''}
                        onChange={(e) => onChange({ Note: e.target.value })}
                    />
                </Grid>
            </GridContainer>);
    }

    private _isAdmin(user?: User) {
        return user && user.Roles && user.Roles.indexOf('ADMIN') >= 0;
    }

}
export default MovementsFields;