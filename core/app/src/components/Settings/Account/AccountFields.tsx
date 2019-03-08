import * as React from 'react';
import {
    TextField,
    Grid,
    InputLabel,
    FormControl,
    MenuItem,
    Input,
    InputAdornment,
    IconButton
} from '@material-ui/core';

import { InjectedIntlProps } from 'react-intl';
import UsersMessages from '../UsersMessages';
import { InjectedShopProps, InjectedWarehouseProps, InjectedAuthProps } from 'src/_context';
import { User } from 'src/@types/our-orders';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import { Check, Close, VisibilityOff, Visibility } from '@material-ui/icons';
import Fabs from 'src/components/Fabs/Fabs';
import { ChangePassword, PatchUser } from 'src/_services';
import { withSnackbar, InjectedNotistackProps } from 'notistack';
type TUser = User;

export type AccountFieldsProps =
    InjectedIntlProps &
    InjectedShopProps &
    InjectedWarehouseProps &
    InjectedAuthProps &
    InjectedNotistackProps & {
        initial: TUser;
    };

type State = {
    initial: TUser;
    changes: Partial<TUser>;
    showPassword?: boolean;
    currentpassword: string;
    newpassword: string;
    confirmPassword: string;
};

class AccountFields extends React.Component<AccountFieldsProps, State> {
    constructor(props: AccountFieldsProps) {
        super(props);

        this._handleShowPasswordClick = this._handleShowPasswordClick.bind(this);
        this._handleShowPasswordMouseDown = this._handleShowPasswordMouseDown.bind(this);

        this.state = {
            changes: {},
            initial: this.props.initial,
            currentpassword: '',
            newpassword: '',
            confirmPassword: ''
        };
    }

    render() {
        const { showPassword, newpassword, currentpassword, confirmPassword, initial, changes } = this.state;
        const { shopCtx, warehouseCtx, intl: { formatMessage } } = this.props;

        const preview = { ...initial, ...changes } as TUser;

        const changed = !!Object.keys(changes).length ||
            (currentpassword && newpassword && newpassword === confirmPassword);

        const currentpasswordTitle = formatMessage(UsersMessages.currentPassword);
        const passwordTitle = formatMessage(UsersMessages.resetPassword);
        const confirmTitle = formatMessage(UsersMessages.confirmPassword);

        return (
            <form onSubmit={changed ? this._handleSubmit : undefined}>
                <GridContainer>
                    <Grid item={true} xs={12}>
                        <TextField
                            fullWidth={true}
                            inputProps={{
                                autoComplete: 'given-name'
                            }}
                            name="firstname"
                            label={formatMessage(UsersMessages.firstName)}
                            value={preview.FirstName}
                            onChange={(e) => this._HandleMeChange({ FirstName: e.target.value })}
                        />
                    </Grid>
                    <Grid item={true} xs={12}>
                        <TextField
                            fullWidth={true}
                            label={formatMessage(UsersMessages.lastName)}
                            inputProps={{
                                autoComplete: 'family-name'
                            }}
                            name="lastname"
                            value={preview.LastName}
                            onChange={(e) => this._HandleMeChange({ LastName: e.target.value })}
                        />
                    </Grid>
                    <Grid item={true} xs={12}>
                        <TextField
                            fullWidth={true}
                            label={formatMessage(UsersMessages.email)}
                            inputProps={{
                                autoComplete: 'email'
                            }}
                            name="email"
                            value={preview.Email}
                            onChange={(e) => this._HandleMeChange({ Email: e.target.value })}
                        />
                    </Grid>
                    <Grid item={true} xs={12}>
                        <TextField
                            fullWidth={true}
                            label={formatMessage(UsersMessages.phoneNumber)}
                            value={preview.PhoneNumber}
                            inputProps={{
                                autoComplete: 'tel'
                            }}
                            onChange={(e) => this._HandleMeChange({ PhoneNumber: e.target.value })}
                        />
                    </Grid>
                    <Grid item={true} xs={12}>
                        <TextField
                            fullWidth={true}
                            select={true}
                            label={formatMessage(UsersMessages.defaultShop)}
                            value={preview.ShopId ? preview.ShopId : ''}
                            name="shop"
                            onChange={(e) => this._HandleMeChange({ ShopId: e.target.value })}
                        >
                            {shopCtx.Shops.map(s =>
                                <MenuItem key={s.Id} value={s.Id}>
                                    {s.Name}
                                </MenuItem>
                            )}
                        </TextField>
                    </Grid>

                    <Grid item={true} xs={12}>
                        <TextField
                            fullWidth={true}
                            select={true}
                            label={formatMessage(UsersMessages.defaultWarehouse)}
                            value={preview.WarehouseId ? preview.WarehouseId : ''}
                            name="warehouse"
                            onChange={(e) => this._HandleMeChange({ WarehouseId: e.target.value })}
                        >
                            {warehouseCtx.Warehouses.map(w =>
                                <MenuItem key={w.Id} value={w.Id}>
                                    {w.Name}
                                </MenuItem>
                            )}
                        </TextField>
                    </Grid>
                    <Grid item={true} xs={4}>
                        <FormControl fullWidth={true}>
                            <InputLabel htmlFor="password">{currentpasswordTitle}</InputLabel>
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                value={currentpassword}
                                name="password"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const v = e.target.value;
                                    this.setState(() => ({ currentpassword: v }));
                                }}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="Toggle password visibility"
                                            onClick={this._handleShowPasswordClick}
                                            onMouseDown={this._handleShowPasswordMouseDown}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                            />
                        </FormControl>
                    </Grid>
                    {currentpassword && <Grid item={true} xs={4}>
                        <FormControl fullWidth={true}>
                            <InputLabel htmlFor="new-password">{passwordTitle}</InputLabel>
                            <Input
                                id="new-password"
                                type={showPassword ? 'text' : 'password'}
                                value={newpassword}
                                autoComplete="new-password"
                                name="newpassword"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const v = e.target.value;
                                    this.setState(() => ({ newpassword: v }));
                                }}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="Toggle password visibility"
                                            onClick={this._handleShowPasswordClick}
                                            onMouseDown={this._handleShowPasswordMouseDown}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                            />
                        </FormControl>
                    </Grid>}
                    {currentpassword && newpassword && <Grid item={true} xs={4}>
                        <FormControl fullWidth={true}>
                            <InputLabel htmlFor="confirm-password">{confirmTitle}</InputLabel>
                            <Input
                                id="confirm-password"
                                type={showPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                autoComplete="new-password"
                                name="newpasswordconfirm"
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    const v = e.target.value;
                                    this.setState(() => ({ confirmPassword: v }));
                                }}
                                endAdornment={
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="Toggle password visibility"
                                            onClick={this._handleShowPasswordClick}
                                            onMouseDown={this._handleShowPasswordMouseDown}
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                }
                            />
                        </FormControl>
                    </Grid>}
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
            </form>
        );
    }

    private _handleShowPasswordClick() {
        this.setState(prev => ({
            showPassword: !prev.showPassword
        }));
    }

    private _handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        this._HandleSave();
    }

    private _handleShowPasswordMouseDown(e: React.MouseEvent<HTMLElement>) {
        e.preventDefault();
    }

    private _HandleMeChange(changes: Partial<TUser>) {
        const newChanges = { ...this.state.changes, ...changes };
        this.setState(() => ({ changes: newChanges }));
    }

    private _HandleSave() {
        const { authCtx, enqueueSnackbar } = this.props;
        const { currentpassword, newpassword, confirmPassword, changes } = this.state;
        if (!!Object.keys(changes).length) {
            PatchUser(changes)
                .then(model => {
                    authCtx.refresh();
                    return model;
                })
                .then((model) => {
                    this.setState(
                        () => ({
                            changes: {},
                            initial: model
                        }),
                        () => {
                            enqueueSnackbar('user updated with success', { variant: 'success' });
                        });
                })
                .catch((reason) =>
                    enqueueSnackbar(`error while updating account (${reason})`, { variant: 'error' })
                );

        }
        if (currentpassword && newpassword && newpassword === confirmPassword) {
            ChangePassword(currentpassword, newpassword)
                .then(() => {
                    this.setState(
                        () => ({
                            currentpassword: '',
                            newpassword: '',
                            confirmPassword: '',
                        }),
                        () => {
                            enqueueSnackbar('password changed with success', { variant: 'success' });
                        });
                }).catch((reason) =>
                    enqueueSnackbar(`error while changing password (${reason})`, { variant: 'error' })
                );
        }
    }
    private _HandleCancel() {
        this.setState(() => ({
            currentpassword: '',
            newpassword: '',
            confirmPassword: '',
            changes: {},
            initial: { ...this.props.initial }
        }));
    }
}

export default withSnackbar(AccountFields);