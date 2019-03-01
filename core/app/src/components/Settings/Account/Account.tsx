import * as React from 'react';

import { InjectedIntlProps } from 'react-intl';
import AccountFields from './AccountFields';
import { PatchUser } from '../../../_services';
import { InjectedAuthProps, InjectedShopProps, InjectedWarehouseProps } from '../../../_context';
import { User } from 'src/@types/our-orders';

export type AccountProps = InjectedIntlProps & InjectedAuthProps & InjectedShopProps & InjectedWarehouseProps & {
    onChanged: (changed: User) => void;
};

// type TUser = User;

type State = {
    newPassword?: string;
    password?: string;
    confirmNewPassword?: string;
    registerUserEmail?: string;
};

class Account extends React.Component<AccountProps, State> {

    constructor(props: AccountProps) {
        super(props);

        this._OnSave = this._OnSave.bind(this);

        this.state = {};
    }

    render() {

        const { intl, authCtx, shopCtx, warehouseCtx } = this.props;
        return (
            <AccountFields
                {...{ intl, shopCtx, warehouseCtx, authCtx }}
                initial={authCtx.user || {} as User}
            />);
    }
    private _OnSave(changes: Partial<User>) {

        return PatchUser(changes)
            .then(model => {
                const { refresh } = this.props.authCtx;

                refresh();
                this.props.onChanged(model);

                return model;
            }
            );
    }

    // private _fetch() {
    //     // fetch users 
    //     Users.GetAll(0, 50).then(result => {
    //         this.setState(prev => ({ users: result.Values }));
    //     });
    // }

    // private _registerUser() {
    //     const { registerUserEmail } = this.state;
    //     if (!registerUserEmail) { return; }
    //     Register(registerUserEmail).then(result => {
    //         this._fetch();
    //     });
    // }

    // private _renderRegisterUser() {

    //     return (
    //         <React.Fragment>
    //             <div className="settings__section-item">
    //                 <TextField
    //                     onChange={(value) => this.setState(prev => ({ registerUserEmail: value }))}
    //                     value={this.state.registerUserEmail || ''}
    //                     title={this.props.intl.formatMessage(SettingsMessages.registerUserEmail)}
    //                 />
    //             </div>
    //             <div className="settings__section-item">
    //                 <Button active={!!this.state.registerUserEmail} onClick={() => this._registerUser()}>
    //                     <FormattedMessage
    //                         {...SettingsMessages.registerUser}
    //                     />
    //                 </Button>
    //             </div>
    //         </React.Fragment>);
    // }

    // private _isAdmin(user: TUser) {
    //     return user.Roles && user.Roles.indexOf(Roles.Admin) >= 0;
    // }
    // private _isMe(user: TUser) {
    //     return this.props.user && user.UserName === this.props.user.UserName;
    // }

    // private _renderUserLists() {
    //     return (
    //         <React.Fragment>
    //             {this._renderAdmins()}
    //             {this._renderUsers()}
    //         </React.Fragment>);
    // }

    // private _renderUsers() {
    //     const users = this.state.users.filter(u => !this._isAdmin(u) && !this._isMe(u));
    //     return (
    //         <section className="settings__section">
    //             <h3 className="settings__section-title">{this.props.intl.formatMessage(SettingsMessages.users)}</h3>
    //             {users.map(user => {
    //                 return (
    //                     <UserForm
    //                         key={user.UserName}
    //                         group="users-forms"
    //                         initial={user}
    //                         onChange={(newuser) =>
    //                             this.setState(prev => ({
    //                                 users: prev.users
    //                                     .map(u => u.UserName === newuser.UserName ? newuser : u)
    //                             }))
    //                         }
    //                         save={(changes) => Users.Patch(user.Id, changes)}
    //                         transition="left"
    //                         uid={this.props.uid}
    //                     />);
    //             })}
    //         </section>);
    // }

    // private _renderAdmins() {
    //     const admins = this.state.users.filter(u => this._isAdmin(u) && !this._isMe(u));
    //     return (
    //         <section className="settings__section">
    //             <h3 className="settings__section-title">{this.props.intl.formatMessage(SettingsMessages.admins)}</h3>
    //             {admins.map(user => {
    //                 return (
    //                     <UserForm
    //                         key={user.UserName}
    //                         group="users-forms"
    //                         initial={user}
    //                         onChange={(newuser) =>
    //                             this.setState(prev => ({
    //                                 users: prev.users
    //                                     .map(u => u.UserName === newuser.UserName ? newuser : u)
    //                             }))
    //                         }
    //                         save={(changes) => Users.Patch(user.Id, changes)}
    //                         transition="left"
    //                         uid={this.props.uid}
    //                     />);
    //             })}
    //         </section>);
    // }
}
export default Account;

// <div className="settings__column">
// {isAmdin && this._renderUserLists()}
// {isAmdin && this._renderRegisterUser()}
// </div>