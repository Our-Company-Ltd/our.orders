import * as React from 'react';

import { InjectedIntlProps } from 'react-intl';
import { Users } from '../../../../_services';
import { InjectedAuthProps } from '../../../../_context';
import UsersDetail from '../UsersDetail/UsersDetail';

import { Grid, WithStyles, withStyles, Avatar } from '@material-ui/core';
import { User } from 'src/@types/our-orders';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import { Add, Person } from '@material-ui/icons';
import SideDialog from 'src/components/SideDialog/SideDialog';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import * as classNames from 'classnames';
import Fabs, { FabBtnProps } from 'src/components/Fabs/Fabs';
import ItemPreview, { Lines, Line } from 'src/components/ItemPreview/ItemPreview';

type injectedClasses = 'container' | 'bold' | 'spacer';

export type Props =
    WithStyles<injectedClasses> &
    InjectedIntlProps &
    InjectedAuthProps &
    {
    };

type TUser = User;

interface State {
    users: User[];
    user: User;
    newPassword?: string;
    password?: string;
    confirmNewPassword?: string;
    registerUserEmail?: string;
    editing?: User;
    editingOpened?: boolean;
}

class UsersList extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this._add = this._add.bind(this);
        this.state = {
            user: (this.props.authCtx.user || {}) as User,
            users: []
        };
    }
    componentDidMount() {
        this._fetch();
    }

    render() {
        const users = this.state.users.filter(u => !this._isMe(u));

        const { intl, classes } = this.props;
        const { editing, editingOpened } = this.state;

        const addBtn: FabBtnProps = {
            icon: <Add />,
            legend: 'create new',
            themeColor: 'green',
            onClick: this._add
        };

        return (
            <GridContainer>
                {users.map(user => {
                    const firstName = user.FirstName || '';
                    const lastName = user.LastName || '';

                    const email = user.Email || '';
                    const userName = user.UserName || '';

                    const baseCls = 'users-detail__preview';
                    return (
                        <Grid key={user.Id} item={true} xs={12}>
                            <ItemPreview
                                onClick={() => {
                                    this.setState(() => ({
                                        editing: user,
                                        editingOpened: true
                                    }));
                                }}
                            >
                                <Avatar>
                                    <Person />
                                </Avatar>
                                <Lines>
                                    <Line>
                                        {firstName &&
                                            <span className={classNames(classes.bold, classes.spacer)}>
                                                {firstName}
                                            </span>}
                                        {lastName &&
                                            <span className={classNames(classes.bold, classes.spacer)}>
                                                {lastName}
                                            </span>}
                                    </Line>
                                    <Line>
                                        {email &&
                                            <span className={classes.spacer}>
                                                {email}
                                            </span>}
                                        {userName &&
                                            <span className={`${baseCls} ${baseCls}--phone`}>
                                                {userName}
                                            </span>}
                                    </Line>
                                </Lines>
                            </ItemPreview>
                        </Grid>);
                })}
                {editing &&
                    <SideDialog
                        open={!!editingOpened}
                        onClose={() => this.setState(() => ({ editingOpened: false }))}
                    >
                        <UsersDetail
                            initial={editing}
                            intl={intl}
                            changed={() => {
                                this.setState(() => ({
                                    editingOpened: false
                                }));
                                this._fetch();
                            }}

                            onDelete={() => {
                                this._fetch();
                                this.setState(() => ({
                                    editingOpened: false
                                }));
                            }}

                            cancel={() => {
                                this.setState(() => ({
                                    editingOpened: false
                                }));
                            }}
                        />

                    </SideDialog>
                }
                <Fabs map={[addBtn]} />
            </GridContainer>
        );
    }
    private _add() {
        Users.Empty({}).then(result => {
            this.setState(() => ({ editing: result, editingOpened: true }));
        });
    }
    private _fetch() {
        Users.GetAll(0, 50).then(result => {
            this.setState(() => ({ users: result.Values }));
        });
    }

    // private _isAdmin(user: TUser) {
    //     return user.Roles && user.Roles.indexOf(Roles.Admin) >= 0;
    // }
    private _isMe(user: TUser) {
        return this.props.authCtx.user && user.UserName === this.props.authCtx.user.UserName;
    }
}

export default withStyles((theme: OurTheme): StyleRules<injectedClasses> => ({
    container: {

    },
    bold: {
        fontWeight: 'bold',
        color: 'black'
    },
    spacer: {
        marginRight: '.4rem'
    }
}))(UsersList);
