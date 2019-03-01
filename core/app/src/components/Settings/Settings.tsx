import * as React from 'react';

import * as md5 from 'md5';

import { InjectedIntlProps } from 'react-intl';
import { Users } from '../../_services';
import {
    InjectedWarehouseProps,
    InjectedShopProps,
    InjectedAuthProps,
    InjectedSettingsProps
} from '../../_context';
import { ListItemIcon, WithStyles, Grid, List, withStyles } from '@material-ui/core';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Avatar from '@material-ui/core/Avatar';
import PowerSettings from '@material-ui/icons/PowerSettingsNew';
import Account from './Account/Account';
import { User, Roles } from 'src/@types/our-orders';
import { Bookmarks, FileCopy, People, Store, Settings as SettingsIcon, EuroSymbol } from '@material-ui/icons';
import CategoriesList from './Categories/CategoriesList/CategoriesList';
import WarehousesList from './Warehouses/WarehousesList/WarehousesList';
import ShopsList from './Shops/ShopsList/ShopsList';
import UsersList from './Users/UsersList/UsersList';
import * as classNames from 'classnames';
import { GridContainer } from '../GridContainer/GridContainer';
import { OurTheme } from '../ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import DocumentTemplatesList from './DocumentTemplate/DocumentTemplateList/DocumentTemplatesList';
import { InjectedTemplatesProps } from 'src/_context/Templates';
import { InjectedCategoryProps } from 'src/_context/Category';
import WarehouseIcon from '../Products/ProductDetail/WarehouseIcon';
import Configuration from './Configuration/Configuration';
import Payments from './Payments/Payments';
import { IsAdminOrInRole } from 'src/_helpers/roles';

type settingSubmenus =
    'Account' | 'Users' | 'Shops' | 'Warehouses' | 'Payments' | 'Categories' | 'Templates' | 'Configuration';

type injectedClasses =
    'containerCls' |
    'menu' |
    'menuContainer' |
    'main' |
    'mainInner' |
    'menuItem' |
    'menuItemActive' |
    'menuLogout' |
    'avatar';

export type SettingsProps =
    InjectedIntlProps &
    InjectedAuthProps &
    InjectedShopProps &
    InjectedSettingsProps &
    InjectedWarehouseProps &
    InjectedTemplatesProps &
    InjectedCategoryProps &
    WithStyles<injectedClasses> &
    {
        initSubmenu?: settingSubmenus;
    };

// type TUser = User;

type State = {
    users: User[];
    user: User;
    newPassword?: string;
    password?: string;
    confirmNewPassword?: string;
    registerUserEmail?: string;
    activeSubmenu: settingSubmenus;
};

class Settings extends React.Component<SettingsProps, State> {

    constructor(props: SettingsProps) {
        super(props);

        this._handleLogOut = this._handleLogOut.bind(this);
        this._changeSubmenu = this._changeSubmenu.bind(this);

        this.state = {
            user: (this.props.authCtx.user || {}) as User,
            users: [],
            activeSubmenu: 'Account'
        };
    }

    componentDidMount() {
        this._fetch();
    }

    render() {
        const { user, activeSubmenu } = this.state;
        const {
            classes, shopCtx, warehouseCtx, intl, settingsCtx, authCtx, templateCtx, categoryCtx
        } = this.props;
        const md5Hash = user && user.Email ? md5(user.Email) : '';

        return (
            <GridContainer className={classes.containerCls} spacing={0}>
                <Grid
                    item={true}
                    className={classes.menuContainer}
                >
                    <List
                        className={classNames(classes.menu)}
                    >
                        <ListItem
                            button={true}
                            onClick={e => this._changeSubmenu('Account')}
                            className={
                                classNames(
                                    classes.menuItem,
                                    activeSubmenu === 'Account' && classes.menuItemActive
                                )
                            }
                        >
                            <ListItemIcon>
                                <Avatar
                                    className={classes.avatar}
                                    src={`https://www.gravatar.com/avatar/${md5Hash}?d=mm`}
                                    alt={`${user.FirstName} ${user.LastName}`}
                                />
                            </ListItemIcon>
                            <ListItemText
                                primary="Account"
                            />
                        </ListItem>

                        {IsAdminOrInRole(user, Roles.CRUD_Users) &&
                            <ListItem
                                button={true}
                                onClick={e => this._changeSubmenu('Users')}
                                className={
                                    classNames(
                                        classes.menuItem,
                                        activeSubmenu === 'Users' && classes.menuItemActive
                                    )
                                }
                            >
                                <ListItemIcon>
                                    <People />
                                </ListItemIcon>
                                <ListItemText primary="Users" />
                            </ListItem>
                        }

                        {IsAdminOrInRole(user, Roles.View_Shops) && <ListItem
                            button={true}
                            onClick={e => this._changeSubmenu('Shops')}
                            className={
                                classNames(
                                    classes.menuItem,
                                    activeSubmenu === 'Shops' && classes.menuItemActive
                                )
                            }
                        >
                            <ListItemIcon>
                                <Store />
                            </ListItemIcon>
                            <ListItemText primary="Shops" />
                        </ListItem>}

                        {IsAdminOrInRole(user, Roles.View_Warehouses) && <ListItem
                            button={true}
                            onClick={e => this._changeSubmenu('Warehouses')}
                            className={
                                classNames(
                                    classes.menuItem,
                                    activeSubmenu === 'Warehouses' && classes.menuItemActive
                                )
                            }
                        >
                            <ListItemIcon>
                                <WarehouseIcon />
                            </ListItemIcon>
                            <ListItemText primary="Warehouses" />
                        </ListItem>}

                        {IsAdminOrInRole(user, Roles.CRUD_Categories) && <ListItem
                            button={true}
                            onClick={e => this._changeSubmenu('Categories')}
                            className={
                                classNames(
                                    classes.menuItem,
                                    activeSubmenu === 'Categories' && classes.menuItemActive
                                )
                            }
                        >
                            <ListItemIcon>
                                <Bookmarks />
                            </ListItemIcon>
                            <ListItemText primary="Categories" />
                        </ListItem>}

                        {IsAdminOrInRole(user, Roles.View_Templates) &&
                            <ListItem
                                button={true}
                                onClick={e => this._changeSubmenu('Templates')}
                                className={
                                    classNames(
                                        classes.menuItem,
                                        activeSubmenu === 'Templates' && classes.menuItemActive
                                    )
                                }
                            >
                                <ListItemIcon>
                                    <FileCopy />
                                </ListItemIcon>
                                <ListItemText primary="Templates" />
                            </ListItem>
                        }
                        {IsAdminOrInRole(user, Roles.View_Payments) &&
                            <ListItem
                                button={true}
                                onClick={e => this._changeSubmenu('Payments')}
                                className={
                                    classNames(
                                        classes.menuItem,
                                        activeSubmenu === 'Payments' && classes.menuItemActive
                                    )
                                }
                            >
                                <ListItemIcon>
                                    <EuroSymbol />
                                </ListItemIcon>
                                <ListItemText primary="Payments" />
                            </ListItem>
                        }
                        {IsAdminOrInRole(user, Roles.View_Configuration) &&
                            <ListItem
                                button={true}
                                onClick={e => this._changeSubmenu('Configuration')}
                                className={
                                    classNames(
                                        classes.menuItem,
                                        activeSubmenu === 'Configuration' && classes.menuItemActive
                                    )
                                }
                            >
                                <ListItemIcon>
                                    <SettingsIcon />
                                </ListItemIcon>
                                <ListItemText primary="Configuration" />
                            </ListItem>
                        }
                        <ListItem
                            button={true}
                            onClick={this._handleLogOut}
                            className={classNames(
                                classes.menuItem,
                                classes.menuLogout
                            )}
                        >
                            <ListItemIcon>
                                <PowerSettings />
                            </ListItemIcon>
                            <ListItemText primary="Log out" />
                        </ListItem>
                    </List>
                </Grid>
                <Grid
                    item={true}
                    className={classes.main}
                >
                    <div className={classes.mainInner}>

                        {this.state.activeSubmenu === 'Account' &&
                            <Account
                                shopCtx={shopCtx}
                                warehouseCtx={warehouseCtx}
                                onChanged={(changed) => this.setState(() => ({ user: changed }))}
                                intl={this.props.intl}
                                authCtx={this.props.authCtx}
                            />
                        }
                        {this.state.activeSubmenu === 'Users' &&
                            <UsersList {...{ intl, settingsCtx, authCtx }} />}
                        {this.state.activeSubmenu === 'Shops' &&
                            <ShopsList {...{ intl, shopCtx, authCtx }} />}
                        {this.state.activeSubmenu === 'Warehouses' &&
                            <WarehousesList {...{ intl, warehouseCtx, authCtx }} />}
                        {this.state.activeSubmenu === 'Categories' &&
                            <CategoriesList {...{ intl, categoryCtx }} />}
                        {this.state.activeSubmenu === 'Templates' &&
                            <DocumentTemplatesList {...{ intl, templateCtx, authCtx }} />}
                        {this.state.activeSubmenu === 'Payments' &&
                            <Payments {...{ intl, settingsCtx }} />}
                        {this.state.activeSubmenu === 'Configuration' &&
                            <Configuration {...{ intl, settingsCtx }} />}
                    </div >
                </Grid>
            </GridContainer>);
    }

    private _fetch() {
        // fetch users 
        Users.GetAll(0, 50).then(result => {
            this.setState(
                () => ({ users: result.Values })
            );
        });
    }

    private _handleLogOut() {
        this.props.authCtx.logout();
    }

    private _changeSubmenu(activeSubmenu: settingSubmenus) {
        this.setState(
            ({ activeSubmenu: activeSubmenu })
        );

        localStorage.setItem('settingActiveSubmenu', activeSubmenu);
    }
    // private _isAdmin(user: TUser) {
    //     return user.Roles && user.Roles.indexOf(Roles.Admin) >= 0;
    // }
}

export default withStyles((theme: OurTheme): StyleRules<injectedClasses> => {

    return {
        containerCls: {
            height: '100%',
            position: 'relative',
            flexWrap: 'nowrap'
        },
        menu: {
            height: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column'
        },
        menuItem: {
            borderLeftWidth: theme.ActiveMenuBorderWidth,
            borderLeftColor: 'transparent',
            borderLeftStyle: 'solid',
            opacity: 0.5,
            flex: '0 0 auto',
            transition: theme.transitions.create('opacity', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.short,
            }),
        },
        menuItemActive: {
            borderLeftColor: theme.palette.primary.main,
            opacity: 1
        },
        main: {
            height: '100%',
            position: 'relative',
            flex: '1 1 auto',
            padding: '10px 40px'
        },
        menuContainer: {
            borderRight: `1px solid ${theme.palette.divider}`,
            height: '100%',
            position: 'relative',
            flex: '0 0 auto',
            overflow: 'auto'
        },
        mainInner: {
            padding: '8px 8px 0 8px',
            overflow: 'auto',
            height: '100%'
        },
        menuLogout: {
            marginTop: 'auto'
        },
        avatar: {
            width: 24,
            height: 24
        }

    };
})(Settings);