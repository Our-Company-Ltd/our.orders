import * as React from 'react';

import { Movements } from '../../../_services';
import { InjectedIntlProps, FormattedNumber } from 'react-intl';

import { Movement, Cashbox, Roles } from 'src/@types/our-orders';

import {
    Sort,
    Archive,
    Store,
    ArrowUpward,
    ArrowDownward
} from '@material-ui/icons';

import {
    withStyles, WithStyles, ListItem,
    List as MaterialList, Grid, ListItemText, ListItemIcon, Divider, TextField, IconButton, MenuItem
} from '@material-ui/core';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import * as classNames from 'classnames';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import { debounce } from 'throttle-debounce';
import { DateTimePicker } from 'material-ui-pickers';
import {
    InjectedSettingsProps,
    InjectedWarehouseProps,
    InjectedAuthProps,
    InjectedShopProps,
    InjectedUsersProps
} from 'src/_context';

import { InjectedCategoryProps } from 'src/_context/Category';
import { InjectedProductProps } from 'src/_context/Product';
import { InjectedTemplatesProps } from 'src/_context/Templates';
import WarehouseIcon from 'src/components/Products/ProductDetail/WarehouseIcon';
import ShopsList from './ShopsList';
import StockList from './StockList';
import NumberField from 'src/components/NumberField/NumberField';
import { IsAdminOrInRole } from 'src/_helpers/roles';

export type injectedClasses =
    'drawerSpacer' |
    'searchInput' |
    'menu' |
    'cashboxes' |
    'menuContainer' |
    'menuItem' |
    'menuItemActive' |
    'menuItemIcon' |
    'menuItemCashbox' |
    'content' |
    'drawer' |
    'drawerOpen' |
    'drawerClose' |
    'mainCls' |
    'containerCls' |
    'drawerContent' |
    'menuItemLast' |
    'categoryCount' |
    'categoryCountActive' |
    'noBalance' |
    'noBalanceIcon';

export type MovementsListProps =
    InjectedWarehouseProps &
    InjectedCategoryProps &
    InjectedAuthProps &
    InjectedShopProps &
    InjectedProductProps &
    InjectedTemplatesProps &
    InjectedSettingsProps &
    InjectedIntlProps &
    InjectedUsersProps &
    WithStyles<injectedClasses> &
    {
    };

type State = {
    fetching?: boolean;
    balancing?: boolean;
    editing: number;
    editingOpened?: boolean;
    creating?: Movement;
    creatingOpened?: boolean;

    archived: boolean;
    from?: Date;
    to?: Date;
    sortAttribute: keyof Movement;
    sortDirection: 'ascending' | 'descending';

    sku?: string;
    min?: number;
    max?: number;

    activeLabel?: string;
    rowCount: number;
    loading: number;
    loaded: number;
    rowHeight: number;
    lastUpdate: number;
    drawerOpen: boolean;
    cashbox?: Cashbox;
};

const LOCAL_STORAGE_KEY = 'our.orders.MovementsList';
const DefaultFilters = (): Partial<State> => ({
    archived: false,
    sortAttribute: localStorage.getItem(`${LOCAL_STORAGE_KEY}.sortAttribute`) as keyof Movement
        || 'Creation',
    sortDirection: localStorage.getItem(`${LOCAL_STORAGE_KEY}.sortDirection`) as 'ascending' | 'descending'
        || 'descending'
});

class MovementsList extends React.Component<MovementsListProps, State> {

    constructor(props: MovementsListProps) {
        super(props);

        this._refreshCashbox = this._refreshCashbox.bind(this);
        this._refresh = debounce(100, this._refresh);
        this._toggleFilterArchived = this._toggleFilterArchived.bind(this);

        this.state = {
            ...DefaultFilters(),
            loading: 0,
            loaded: 0,
            rowHeight: 80,
            rowCount: 0,
            editing: -1,
            drawerOpen: false,
            lastUpdate: new Date().getTime()
        } as State;
    }

    componentWillMount() {
        this._refreshCashbox();
    }

    componentDidUpdate(prevProps: MovementsListProps, prevState: State) {
        setTimeout(
            () => {
                const { sortAttribute: prevSortAttribute, sortDirection: prevSortDirection } = prevState;
                const { sortAttribute, sortDirection } = this.state;

                if (sortAttribute !== prevSortAttribute) {
                    localStorage.setItem(`${LOCAL_STORAGE_KEY}.sortAttribute`, sortAttribute);
                }
                if (sortDirection !== prevSortDirection) {
                    localStorage.setItem(`${LOCAL_STORAGE_KEY}.sortDirection`, sortDirection);
                }
            },
            0
        );
    }
    render() {
        const {
            drawerOpen,
            archived, from, to, activeLabel,
            min, max, sku,
            cashbox,
            sortAttribute,
            sortDirection,
        } = this.state;
        const {
            classes,
            intl,
            settingsCtx,
            templateCtx,
            usersCtx,
            authCtx: {user},
            warehouseCtx,
            authCtx, shopCtx,
            categoryCtx,
            productCtx,
        } = this.props;

        const fromDateChange = (value: Date) => {
            this.setState(
                () => ({ from: value || undefined }),
                this._refresh
            );
        };
        const toDateChange = (value: Date) => {
            this.setState(
                () => ({ to: value || undefined }),
                this._refresh
            );
        };

        const isShops = activeLabel && shopCtx.Shops.find((s) => s.Id === activeLabel);

        return (
            <GridContainer className={classes.containerCls} spacing={0}>
                <Grid
                    item={true}
                    className={classes.menuContainer}
                >
                    <MaterialList
                        className={classNames(classes.menu)}
                    >
                        {IsAdminOrInRole(user, Roles.View_Shops_Movements) && 
                            shopCtx.Shops.map((s) => {

                            const active = activeLabel === s.Id;
                            return (
                                <ListItem
                                    key={`shop-${s.Id}`}
                                    button={true}
                                    onClick={() => this._toggleActive(s.Id)}
                                    className={
                                        classNames(
                                            classes.menuItem,
                                            classes.menuItemCashbox,
                                            active && classes.menuItemActive
                                        )
                                    }
                                >
                                    <ListItemIcon><Store /></ListItemIcon>
                                    <ListItemText> {s.Name}
                                        {cashbox && cashbox[s.Id] &&
                                            <div className={classes.cashboxes}>
                                                {Object.keys(cashbox[s.Id]).map(currency => (
                                                    cashbox[s.Id][currency] ?
                                                        <span
                                                            key={`${s.Id}-${currency}`}
                                                            className={
                                                                classNames(
                                                                    classes.categoryCount,
                                                                    active && classes.categoryCountActive
                                                                )
                                                            }
                                                        >
                                                            <FormattedNumber
                                                                currency={currency}
                                                                style="currency"
                                                                value={cashbox[s.Id][currency]}
                                                            />
                                                        </span> : null)
                                                )}
                                            </div>}
                                    </ListItemText>
                                </ListItem>
                            );
                        })}
                        <Divider />
                        {warehouseCtx.Warehouses.map((w) => {
                            const active = activeLabel === w.Id;
                            return (
                                <ListItem
                                    key={`warehouse-${w.Id}`}
                                    button={true}
                                    onClick={() => this._toggleActive(w.Id)}
                                    className={
                                        classNames(
                                            classes.menuItem,
                                            classes.menuItemCashbox,
                                            active && classes.menuItemActive
                                        )
                                    }
                                >
                                    <ListItemIcon><WarehouseIcon /></ListItemIcon>
                                    <ListItemText> {w.Name}</ListItemText>
                                </ListItem>
                            );
                        })}
                        <Divider />
                        {isShops &&
                            <ListItem
                                button={true}
                                onClick={() => this._toggleFilterArchived()}
                                className={
                                    classNames(
                                        classes.menuItem, archived && classes.menuItemActive, classes.menuItemLast)
                                }
                            >
                                <ListItemIcon><Archive /></ListItemIcon>
                                <ListItemText>Archived</ListItemText>
                            </ListItem>
                        }
                        <ListItem
                            button={true}
                            className={
                                classNames(
                                    classes.menuItem,
                                    !isShops && classes.menuItemLast,
                                    (from || to) && classes.menuItemActive
                                )
                            }
                            onClick={() => this.setState((prev) => ({ drawerOpen: !prev.drawerOpen }))}
                        >
                            <ListItemIcon><Sort /></ListItemIcon>
                            <ListItemText>Filters</ListItemText>
                        </ListItem>
                    </MaterialList>
                </Grid>
                <Grid
                    item={true}
                    className={classNames(classes.drawer, {
                        [classes.drawerOpen]: drawerOpen,
                        [classes.drawerClose]: !drawerOpen,
                    })}
                >
                    <GridContainer className={classes.drawerContent} direction="column">
                        {isShops ?
                            <React.Fragment>
                                <Grid item={true}>
                                    <DateTimePicker
                                        label="From"
                                        fullWidth={true}
                                        keyboard={true}
                                        clearable={true}
                                        format="dd/MM/yyyy HH:mm"
                                        mask={(value: string) =>
                                            // tslint:disable-next-line:max-line-length
                                            (value ? [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, / /, /\d/, /\d/, /\:/, /\d/, /\d/] : [])}
                                        value={from || null}
                                        onChange={fromDateChange}
                                        disableOpenOnEnter={true}
                                        animateYearScrolling={false}
                                    />
                                </Grid>
                                <Grid item={true}>
                                    <DateTimePicker
                                        label="To"
                                        fullWidth={true}
                                        keyboard={true}
                                        format="dd/MM/yyyy HH:mm"
                                        clearable={true}
                                        mask={(value: string) =>
                                            // tslint:disable-next-line:max-line-length
                                            (value ? [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, / /, /\d/, /\d/, /\:/, /\d/, /\d/] : [])}
                                        value={to || null}
                                        onChange={toDateChange}
                                        disableOpenOnEnter={true}
                                        animateYearScrolling={false}
                                    />
                                </Grid>
                                <Grid item={true} style={{ marginTop: 'auto', display: 'flex' }}>
                                    <IconButton
                                        onClick={() =>
                                            this.setState(
                                                (prev) => {
                                                    const dir = prev.sortDirection === 'ascending' ?
                                                        'descending' : 'ascending';
                                                    return { sortDirection: dir };
                                                },
                                                this._refresh
                                            )
                                        }
                                    >
                                        {sortDirection === 'descending' ? <ArrowUpward /> : <ArrowDownward />}
                                    </IconButton>
                                    <TextField
                                        label="sort"
                                        fullWidth={true}
                                        value={sortAttribute || ''}
                                        select={true}
                                        onChange={(value) => {
                                            const v = value.target.value as keyof Movement;
                                            this.setState(
                                                () => ({ sortAttribute: v }),
                                                this._refresh
                                            );
                                        }}
                                    >
                                        {([
                                            'Date',
                                            'User',
                                            'Currency',
                                            'Amount',
                                            'Creation'
                                        ] as Array<keyof Movement>).map(k => (
                                            <MenuItem key={k} value={k}>
                                                {k}
                                            </MenuItem>))}
                                    </TextField>
                                </Grid>
                            </React.Fragment> :
                            <React.Fragment>
                                <Grid item={true}>
                                    <TextField
                                        label="SKU"
                                        fullWidth={true}
                                        value={sku}
                                        onChange={(e) => {
                                            var v = e.target.value;
                                            this.setState(() => ({ sku: v }));
                                        }}
                                    />
                                </Grid>
                                <Grid item={true}>
                                    <NumberField
                                        step="1"
                                        label="Min"
                                        value={min}
                                        fullWidth={true}
                                        onNumberChange={(num) => {
                                            this.setState(() => ({ min: num }));
                                        }}
                                    />
                                </Grid>
                                <Grid item={true}>
                                    <NumberField
                                        step="1"
                                        label="Max"
                                        value={max}
                                        fullWidth={true}
                                        onNumberChange={(num) => {
                                            this.setState(() => ({ max: num }));
                                        }}
                                    />
                                </Grid>
                            </React.Fragment>
                        }
                    </GridContainer>
                </Grid>
                <Grid item={true} className={classes.content}>
                    {activeLabel && shopCtx.Shops.find((s) => s.Id === activeLabel) &&
                        <ShopsList
                            key={activeLabel}
                            id={activeLabel}
                            refreshCashbox={() => this._refreshCashbox()}
                            {...{
                                intl, settingsCtx, templateCtx, usersCtx, warehouseCtx, authCtx, shopCtx,
                                categoryCtx, productCtx, from, to, archived, sortAttribute, sortDirection,
                            }}
                        />
                    }
                    {activeLabel && warehouseCtx.Warehouses.find((s) => s.Id === activeLabel) &&
                        <StockList
                            id={activeLabel}
                            key={activeLabel}
                            {...{
                                intl, settingsCtx, templateCtx, usersCtx, warehouseCtx, authCtx, shopCtx,
                                categoryCtx, productCtx, min, max, sku
                            }}
                        />
                    }
                </ Grid>
            </GridContainer>);
    }
    private _toggleFilterArchived() {
        this.setState(
            (prev) => ({ archived: !prev.archived }),
            () => this._refresh()
        );
    }
    private _toggleActive(id: string) {
        this.setState(
            () => ({ activeLabel: id })
        );
    }
    private _refreshCashbox() {
        Movements.Cashbox().then((cashbox) => this.setState(() => ({ cashbox })));
    }

    private _refresh() {
        this._refreshCashbox();
    }
}

const drawerWidth = '16rem';
const drawerSidesPadding = '11px';
export default withStyles((theme: OurTheme): StyleRules<injectedClasses> => {

    return {
        containerCls: {
            height: '100%',
            position: 'relative'
        },
        searchInput: {

        },
        menu: {
            flexShrink: 0,
            whiteSpace: 'nowrap',
            height: '100%',
            position: 'relative',
            zIndex: theme.zIndex.drawer + 1,
            display: 'flex',
            flexDirection: 'column',
            boxSizing: 'border-box'
        },
        cashboxes: {
            fontSize: theme.typography.body2.fontSize
        },
        menuContainer: {
            borderRight: `1px solid ${theme.palette.divider}`,
            height: '100%',
            position: 'relative',
            flex: '0 0 auto',
            overflow: 'auto'
        },
        drawer: {
            flexShrink: 0,
            whiteSpace: 'nowrap',
            height: '100%',
            position: 'relative',
            boxSizing: 'border-box',
            borderRight: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden'
        },
        drawerContent: {
            // paddingRight: drawerSidesPadding,
            // paddingLeft: drawerSidesPadding,
            // width: drawerWidth,
            // position: 'absolute',
            // height: '100%',
            // left: 0,
            // right: 0
            width: drawerWidth,
            padding:
                `${theme.spacing.unit}px ${theme.spacing.unit}px ${theme.spacing.unit * 2}px ${theme.spacing.unit}px`,
            position: 'absolute',
            height: '100%',
            left: 0,
            right: 0,
            overflow: 'auto',
            flexWrap: 'nowrap'
        },
        content: {
            flex: '1 1 auto',
            height: '100%',
            position: 'relative'
        },
        drawerOpen: {
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
        drawerClose: {
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            overflowX: 'hidden',
            width: 0,
            marginLeft: -1
        },
        mainCls: {
            height: '100%',
            overflow: 'auto',
            flexGrow: 1,
        },
        menuItemIcon: {
        },
        menuItem: {
            paddingRight: drawerSidesPadding,
            paddingLeft: drawerSidesPadding,
            borderLeftWidth: theme.ActiveMenuBorderWidth,
            borderLeftColor: 'transparent',
            borderLeftStyle: 'solid',
            flex: '0 0 auto',
            opacity: 0.5,
            transition: theme.transitions.create('opacity', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.short,
            })

        },
        menuItemLast: {
            marginTop: 'auto'
        },
        menuItemCashbox: {},
        menuItemActive: {
            borderLeftColor: theme.palette.primary.main,
            opacity: 1
        },
        drawerSpacer: {
            height: 60
        },
        categoryCount: {
            background: '#cccccc',
            borderRadius: '16px',
            color: '#ffffff',
            display: 'inline-block',
            padding: '4px 8px',
            marginRight: theme.spacing.unit
        },
        categoryCountActive: {
            background: theme.palette.primary.main
        },
        noBalance: {
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%'
        },
        noBalanceIcon: {
            fontSize: 200,
            color: theme.palette.grey[200]
        }
    };
})(MovementsList);