
import * as React from 'react';

import { Grid, TextField, FormControl, InputLabel, Select, MenuItem, Chip, Input } from '@material-ui/core';
import { InjectedIntlProps } from 'react-intl';
import UsersFieldsMessages from './UsersFieldsMessages';
import { User } from 'src/@types/our-orders';
import { GridContainer } from 'src/components/GridContainer/GridContainer';

type Props = InjectedIntlProps & {
    initial: User;
    onChange: (shop: Partial<User>) => void;
    changes: Partial<User>;
};

class UserFields extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }
    render() {
        return this._renderUser();
    }

    private _renderUser() {
        const initial = this.props.initial;
        const preview = { ...initial, ...this.props.changes } as User;

        // TODO: what to do with this fields:
        // ShopId: string;
        // Token: string;
        const { Roles } = preview;
        return (
            <GridContainer>
                <Grid item={true} xs={12} className="shops-detail__lightbox-field">
                    <TextField
                        fullWidth={true}
                        onChange={(e) => this.props.onChange({ FirstName: e.target.value })}
                        value={preview.FirstName || ''}
                        label={this.props.intl.formatMessage(UsersFieldsMessages.firstName)}
                    />
                </Grid>
                <Grid item={true} xs={12} className="shops-detail__lightbox-field">
                    <TextField
                        fullWidth={true}
                        onChange={(value) => this.props.onChange({ LastName: value.target.value })}
                        value={preview.LastName || ''}
                        label={this.props.intl.formatMessage(UsersFieldsMessages.lastName)}
                    />
                </Grid>
                <Grid item={true} xs={12} className="shops-detail__lightbox-field">
                    <TextField
                        fullWidth={true}
                        onChange={(value) => this.props.onChange({ Email: value.target.value })}
                        value={preview.Email || ''}
                        label={this.props.intl.formatMessage(UsersFieldsMessages.email)}
                    />
                </Grid>
                <Grid item={true} xs={12} className="shops-detail__lightbox-field">
                    <TextField
                        fullWidth={true}
                        onChange={(value) => this.props.onChange({ UserName: value.target.value })}
                        value={preview.UserName || ''}
                        label={this.props.intl.formatMessage(UsersFieldsMessages.userName)}
                    />
                </Grid>
                <Grid item={true} xs={12} className="shops-detail__lightbox-field">
                    <TextField
                        fullWidth={true}
                        onChange={
                            (value) => this.props.onChange({ PhoneNumber: value.target.value })}
                        value={preview.PhoneNumber || ''}
                        label={this.props.intl.formatMessage(UsersFieldsMessages.phoneNumber)}
                    />
                </Grid>
                <Grid item={true} xs={12}>
                    <FormControl fullWidth={true}>
                        <InputLabel htmlFor="select-roles">
                            {this.props.intl.formatMessage(UsersFieldsMessages.roles)}
                        </InputLabel>
                        <Select
                            fullWidth={true}
                            multiple={true}
                            value={Roles}
                            // tslint:disable-next-line:no-any
                            onChange={(e: any) => this.props.onChange({ Roles: e.target.value })}
                            input={<Input id="select-roles" />}
                            renderValue={rs => (
                                <div
                                    style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                    }}
                                >
                                    {(rs as string[]).map(value => {
                                        return value ?
                                            (<Chip
                                                key={value}
                                                label={value}
                                                style={{
                                                    marginRight: '5px'
                                                }}
                                            />) :
                                            null;
                                    }
                                    )}
                                </div>)
                            }
                        >
                            {[
                                'ADMIN',
                                'VIEW_DASHBOARD',
                                'LIST_ORDERS',
                                'CRUD_OWN_ORDERS',
                                'CRUD_ALL_ORDERS',
                                'CRUD_CLIENTS',
                                'CRUD_PRODUCTS',
                                'LIST_VOUCHERS',
                                'CRUD_VOUCHERS',
                                'VIEW_SHOPS_MOVEMENTS',
                                'CRUD_SHOPS_MOVEMENTS',
                                'CRUD_STOCKS_UNITS_MOVEMENTS',
                                'CRUD_USERS',
                                'CRUD_CATEGORIES',
                                'VIEW_SHOPS',
                                'CRUD_SHOPS',
                                'VIEW_WAREHOUSES',
                                'CRUD_WAREHOUSES',
                                'VIEW_TEMPLATES',
                                'CRUD_TEMPLATES',
                                'VIEW_PAYMENTS',
                                'VIEW_CONFIGURATION'].map(r => (
                                <MenuItem
                                    value={r}
                                    style={{
                                        fontWeight: Roles.indexOf(r) >= 0 ? 'bold' : 'inherit'
                                    }}
                                >
                                    {r}
                                </MenuItem>))}
                        </Select>
                    </FormControl>
                </Grid>
            </GridContainer>);
    }
}

export default UserFields;