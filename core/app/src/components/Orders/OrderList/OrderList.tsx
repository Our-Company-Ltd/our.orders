import * as React from 'react';

import {
    AutoSizer,
    List,
    InfiniteLoader,
    Index,
    IndexRange,
    InfiniteLoaderProps,
    ListRowProps
} from 'react-virtualized';

import OrderListItem from '../OrderListItem/OrderListItem';
import { Orders, DocumentTemplates } from '../../../_services';
import { InjectedAuthProps } from '../../../_context/Auth';
import { InjectedSettingsProps } from '../../../_context/Settings';
import { OrderDetail } from '../OrderDetail/OrderDetail';
import { InjectedShopProps, InjectedWarehouseProps, InjectedUsersProps } from 'src/_context';
import { Order, OrderStatus, OrderType } from 'src/@types/our-orders';
import Fabs, { FabBtnProps } from 'src/components/Fabs/Fabs';

import {
    Add,
    ShoppingCart,
    Assignment,
    Block,
    Payment,
    HowToVote,
    LocalShipping,
    Check,
    Sort,
    ArrowDownward,
    ArrowUpward,
    Print
} from '@material-ui/icons';

import {
    withStyles,
    Dialog,
    WithStyles,
    ListItem,
    IconButton,
    TextField,
    Grid,
    List as MaterialList,
    Tooltip,
    MenuItem
} from '@material-ui/core';
import { InjectedCategoryProps } from 'src/_context/Category';
import { InjectedProductProps } from 'src/_context/Product';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import * as classNames from 'classnames';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import { Filter } from 'src/_helpers/Filter';
import { debounce } from 'throttle-debounce';
import { DateTimePicker } from 'material-ui-pickers';
import { InjectedTemplatesProps } from 'src/_context/Templates';
import { OrderListMessages } from './OrderListMesseges';
import { InjectedIntlProps } from 'react-intl';
import { Printer } from 'src/_helpers/print';
import { FilterDefinition } from 'src/_types/FilterDefinition';
import ShopsField from 'src/components/ShopsField/ShopsField';
import { IsAdminOrInRole } from 'src/_helpers/roles';

export type injectedClasses =
    'drawerSpacer' |
    'searchInput' |
    'menu' |
    'menuItem' |
    'menuItemActive' |
    'menuItemIcon' |
    'submenu' |
    'submenuOpen' |
    'submenuClose' |
    'content' |
    'mainCls' |
    'containerCls' |
    'menuContainer' |
    'submenuContent' |
    'menuItemLast' |
    'tooltip' |
    'menuItemLast' |
    'sort' |
    'MuiPickerDTHeader';
export type OrdersListProps =
    InjectedCategoryProps &
    InjectedAuthProps &
    InjectedIntlProps &
    InjectedUsersProps &
    InjectedShopProps &
    InjectedWarehouseProps &
    InjectedSettingsProps &
    InjectedProductProps &
    InjectedTemplatesProps &
    WithStyles<injectedClasses> &
    {

    };

type OrderFilter = {
    types: OrderType[];
    status: OrderStatus[];
    reference: string;
    shopId: string;
    userId: string;
    fromDate: Date | null;
    toDate: Date | null;
    sortAttribute: keyof Order;
    sortDirection: 'ascending' | 'descending';
};
type State = {
    lightboxes: Order[];
    fetching?: boolean;
    editing: number;
    editingOpened?: boolean;
    creating?: Order;
    creatingOpened?: boolean,
    filter: OrderFilter;
    rowCount: number;
    loading: number;
    loaded: number;
    rowHeight: number;
    lastUpdate: number;
    submenuOpen: boolean;
    templatesOpened?: boolean;
};

const LOCAL_STORAGE_KEY = 'our.orders.OrderList';
const DefaultFilters = (): OrderFilter => ({
    types: [],
    status: ['Dispatching', 'PendingPayment', 'ToDispatch'],
    reference: '',
    shopId: '',
    userId: '',
    fromDate: null,
    toDate: null,
    sortAttribute: localStorage.getItem(`${LOCAL_STORAGE_KEY}.sortAttribute`) as keyof Order
        || 'Date',
    sortDirection: localStorage.getItem(`${LOCAL_STORAGE_KEY}.sortDirection`) as 'ascending' | 'descending'
        || 'descending'
});

class OrderList extends React.Component<OrdersListProps, State> {
    private _loadedRowsMap: { [index: number]: Order } = {};
    private _list: List | null;
    private _loadMoreRowsStartIndex: number;
    private _loadMoreRowsStopIndex: number;

    constructor(props: OrdersListProps) {
        super(props);

        this._isRowLoaded = this._isRowLoaded.bind(this);
        this._loadMore = this._loadMore.bind(this);
        this._rowRenderer = this._rowRenderer.bind(this);
        this._handleItemChanged = this._handleItemChanged.bind(this);
        this._printOrders = this._printOrders.bind(this);
        this._printOrdersProducts = this._printOrdersProducts.bind(this);
        this._refresh = debounce(100, this._refresh);
        this.state = {
            filter: DefaultFilters(),
            loading: 0,
            loaded: 0,
            rowHeight: 80,
            rowCount: 0,
            editing: -1,
            submenuOpen: false,
            lastUpdate: new Date().getTime(),
            lightboxes: []
        };
    }

    componentWillMount() {
        this.setState(() => ({ fetching: true }), () => {
            this._loadMore({ startIndex: 0, stopIndex: 0 })
                .then(() =>
                    this.setState(
                        () => ({ fetching: false })
                    ));
        });
    }
    componentDidUpdate(prevProps: OrdersListProps, prevState: State) {
        setTimeout(
            () => {
                const { filter: { sortAttribute: prevSortAttribute, sortDirection: prevSortDirection } } = prevState;
                const { filter: { sortAttribute, sortDirection } } = this.state;

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
            rowCount, editing, creating, submenuOpen, editingOpened, creatingOpened,
            filter: {
                types, status, reference: query, shopId: shopQuery,
                userId: userQuery, fromDate, toDate, sortAttribute, sortDirection }
        } = this.state;
        const {
            intl,
            shopCtx,
            authCtx,
            authCtx: { user },
            warehouseCtx,
            settingsCtx,
            categoryCtx,
            productCtx,
            usersCtx,
            classes,
            templateCtx
        } = this.props;

        const infiniteLoaderProps: InfiniteLoaderProps = {
            isRowLoaded: this._isRowLoaded,
            loadMoreRows: this._loadMore,
            rowCount: rowCount
        };

        const hasRights = IsAdminOrInRole(user, 'CRUD_ALL_ORDERS', 'CRUD_OWN_ORDERS');

        const add = () => {
            this.setState(() => ({ fetching: true }), () => {
                Orders
                    .Empty({})
                    .then((empty) =>
                        this.setState(
                            () => ({ creating: empty, creatingOpened: true, fetching: false })
                        ));
            });

        };
        const cancel = () => {
            this.setState(
                () => ({ creatingOpened: false, editingOpened: false })
            );

        };
        const referenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const q = e.target.value;
            this.setState(
                (prev) => ({ filter: { ...prev.filter, reference: q } }),
                this._refresh
            );

        };
        const shopIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const q = e.target.value;
            this.setState(
                (prev) => ({ filter: { ...prev.filter, shopId: q } }),
                this._refresh
            );

        };
        const userIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const q = e.target.value;
            this.setState(
                (prev) => ({ filter: { ...prev.filter, userId: q } }),
                this._refresh
            );

        };
        const fromDateChange = (value: Date) => {
            this.setState(
                (prev) => ({ filter: { ...prev.filter, fromDate: value } }),
                this._refresh
            );
        };
        const toDateChange = (value: Date) => {
            this.setState(
                (prev) => ({ filter: { ...prev.filter, toDate: value } }),
                this._refresh
            );
        };

        // tslint:disable-next-line:no-any
        // const searchBlur = (e: any) => {
        //     const q = e.target.value;
        //     if (!q) {
        //         this.setState(
        //             () => ({ drawerOpen: false })
        //         );
        //     }
        // };

        const toggle = () => {
            this.setState(
                (prev) => ({ submenuOpen: !prev.submenuOpen })
            );
        };

        // const focusSearch = () => {
        //     this.setState(
        //         () => ({ drawerOpen: true }),
        //         () => this._searchInput && this._searchInput.current && this._searchInput.current.focus()
        //     );
        // };

        const ordersTemplates = templateCtx
            .templates
            .filter(t => t.ApplyTo === 'Orders');

        const ordersProductsTemplates = templateCtx
            .templates
            .filter(t => t.ApplyTo === 'OrdersProducts');

        const ordersTemplatesBtn = ordersTemplates.length > 0 && {
            icon: <Print />,
            legend: ordersTemplates.length > 1 ? 'documents' : ordersTemplates[0].Title,
            themeColor: 'gray',
            onClick: ordersTemplates.length > 1 ?
                () => this.setState(() => ({ templatesOpened: true })) : () => this._printOrders(ordersTemplates[0].Id)
        } as FabBtnProps;

        const ordersProductsTemplatesBtn = ordersProductsTemplates.length > 0 && {
            icon: <Print />,
            legend: ordersProductsTemplates.length > 1 ? 'documents' : ordersProductsTemplates[0].Title,
            themeColor: 'gray',
            onClick: ordersProductsTemplates.length > 1 ?
                () => this.setState(() => ({ templatesOpened: true })) :
                () => this._printOrdersProducts(ordersProductsTemplates[0].Id)
        } as FabBtnProps;

        return (
            <GridContainer className={classes.containerCls} spacing={0}>
                <Grid
                    item={true}
                    className={classes.menuContainer}
                >
                    <MaterialList
                        className={classNames(classes.menu)}
                    >
                        <ListItem
                            onClick={e => this._toggleFilterType('Cart')}
                            className={
                                classNames(classes.menuItem, types.indexOf('Cart') >= 0 && classes.menuItemActive)
                            }
                        >
                            <Tooltip
                                title={intl.formatMessage(OrderListMessages.cart)}
                                placement="right"
                                classes={{ tooltip: classes.tooltip }}
                            >
                                <IconButton
                                    className={classes.menuItemIcon}
                                >
                                    <ShoppingCart />
                                </IconButton>
                            </Tooltip>
                        </ListItem>
                        <ListItem
                            onClick={e => this._toggleFilterType('Offer')}
                            className={
                                classNames(classes.menuItem, types.indexOf('Offer') >= 0 && classes.menuItemActive)
                            }
                        >
                            <Tooltip
                                title={intl.formatMessage(OrderListMessages.offer)}
                                placement="right"
                                classes={{ tooltip: classes.tooltip }}
                            >
                                <IconButton className={classNames(classes.menuItemIcon)}>
                                    <Assignment />
                                </IconButton>
                            </Tooltip>
                        </ListItem>
                        <ListItem
                            onClick={e => this._toggleFilterStatus('Canceled')}
                            className={
                                classNames(classes.menuItem, status.indexOf('Canceled') >= 0 && classes.menuItemActive)
                            }
                        >
                            <Tooltip
                                title={intl.formatMessage(OrderListMessages.canceled)}
                                placement="right"
                                classes={{ tooltip: classes.tooltip }}
                            >
                                <IconButton className={classNames(classes.menuItemIcon)}>
                                    <Block />
                                </IconButton>
                            </Tooltip>
                        </ListItem>
                        <ListItem
                            onClick={e => this._toggleFilterStatus('PendingPayment')}
                            className={
                                classNames(
                                    classes.menuItem,
                                    status.indexOf('PendingPayment') >= 0 && classes.menuItemActive
                                )
                            }
                        >
                            <Tooltip
                                title={intl.formatMessage(OrderListMessages.payments)}
                                placement="right"
                                classes={{ tooltip: classes.tooltip }}
                            >
                                <IconButton className={classNames(classes.menuItemIcon)}>
                                    <Payment />
                                </IconButton>
                            </Tooltip>
                        </ListItem>
                        <ListItem
                            onClick={e => this._toggleFilterStatus('ToDispatch')}
                            className={
                                classNames(
                                    classes.menuItem,
                                    status.indexOf('ToDispatch') >= 0 && classes.menuItemActive
                                )
                            }
                        >
                            <Tooltip
                                title={intl.formatMessage(OrderListMessages.toDispatch)}
                                placement="right"
                                classes={{ tooltip: classes.tooltip }}
                            >
                                <IconButton className={classNames(classes.menuItemIcon)}>
                                    <HowToVote />
                                </IconButton>
                            </Tooltip>

                        </ListItem>
                        <ListItem
                            onClick={e => this._toggleFilterStatus('Dispatching')}
                            className={
                                classNames(
                                    classes.menuItem,
                                    status.indexOf('Dispatching') >= 0 && classes.menuItemActive
                                )
                            }
                        >
                            <Tooltip
                                title={intl.formatMessage(OrderListMessages.dispatching)}
                                placement="right"
                                classes={{ tooltip: classes.tooltip }}
                            >
                                <IconButton className={classNames(classes.menuItemIcon)}>
                                    <LocalShipping />
                                </IconButton>
                            </Tooltip>
                        </ListItem>
                        <ListItem
                            onClick={e => this._toggleFilterStatus('Done')}
                            className={
                                classNames(
                                    classes.menuItem,
                                    status.indexOf('Done') >= 0 && classes.menuItemActive
                                )
                            }
                        >
                            <Tooltip
                                title={intl.formatMessage(OrderListMessages.done)}
                                placement="right"
                                classes={{ tooltip: classes.tooltip }}
                            >
                                <IconButton className={classNames(classes.menuItemIcon)}>
                                    <Check />
                                </IconButton>
                            </Tooltip>
                        </ListItem>
                        <ListItem
                            className={
                                classNames(
                                    classes.menuItem,
                                    classes.menuItemLast,
                                    (query || fromDate || toDate) && classes.menuItemActive
                                )
                            }
                        >
                            <Tooltip
                                title={intl.formatMessage(OrderListMessages.sortBtn)}
                                placement="right"
                                classes={{ tooltip: classes.tooltip }}
                            >
                                <IconButton className={classNames(classes.menuItemIcon)} onClick={toggle}>
                                    <Sort />
                                </IconButton>
                            </Tooltip>
                        </ListItem>
                    </MaterialList>
                </Grid>
                <Grid
                    item={true}
                    className={classNames(classes.submenu, {
                        [classes.submenuOpen]: submenuOpen,
                        [classes.submenuClose]: !submenuOpen,
                    })}
                >
                    <GridContainer className={classes.submenuContent} direction="column">
                        <Grid item={true}>
                            <TextField
                                label={intl.formatMessage(OrderListMessages.reference)}
                                fullWidth={true}
                                value={query}
                                onChange={referenceChange}
                            />
                        </Grid>
                        <Grid item={true}>
                            <TextField
                                select={true}
                                label="User"
                                fullWidth={true}
                                value={userQuery || ''}
                                onChange={userIdChange}
                            >
                                {usersCtx.Users.map(u => (
                                    <MenuItem key={u.Id} value={u.Id}>{u.FirstName} {u.LastName}</MenuItem>)
                                )}
                            </TextField>
                        </Grid>
                        <Grid item={true}>
                            <ShopsField
                                label="Shop"
                                shopCtx={shopCtx}
                                fullWidth={true}
                                value={shopQuery}
                                onChange={shopIdChange}
                            />
                        </Grid>
                        <Grid item={true}>
                            <DateTimePicker
                                className={classes.MuiPickerDTHeader}
                                label={intl.formatMessage(OrderListMessages.from)}
                                fullWidth={true}
                                keyboard={true}
                                clearable={true}
                                format="dd/MM/yyyy HH:mm"
                                mask={(value: string) =>
                                    // tslint:disable-next-line:max-line-length
                                    (value ? [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, / /, /\d/, /\d/, /\:/, /\d/, /\d/] : [])}
                                value={fromDate}
                                onChange={fromDateChange}
                                disableOpenOnEnter={true}
                                animateYearScrolling={false}
                            />
                        </Grid>
                        <Grid item={true}>
                            <DateTimePicker
                                className={classes.MuiPickerDTHeader}
                                label={intl.formatMessage(OrderListMessages.to)}
                                fullWidth={true}
                                keyboard={true}
                                format="dd/MM/yyyy HH:mm"
                                clearable={true}
                                mask={(value: string) =>
                                    // tslint:disable-next-line:max-line-length
                                    (value ? [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, / /, /\d/, /\d/, /\:/, /\d/, /\d/] : [])}
                                value={toDate}
                                onChange={toDateChange}
                                disableOpenOnEnter={true}
                                animateYearScrolling={false}
                            />
                        </Grid>
                        <Grid item={true} className={classes.sort}>
                            <IconButton
                                onClick={() =>
                                    this.setState(
                                        (prev) => {
                                            const dir = prev.filter.sortDirection === 'ascending' ?
                                                'descending' : 'ascending';
                                            return { filter: { ...prev.filter, sortDirection: dir } };
                                        },
                                        this._refresh
                                    )
                                }
                            >
                                {sortDirection === 'descending' ? <ArrowUpward /> : <ArrowDownward />}
                            </IconButton>
                            <TextField
                                label={intl.formatMessage(OrderListMessages.sort)}
                                fullWidth={true}
                                value={sortAttribute || ''}
                                select={true}
                                onChange={(value) => {
                                    const v = value.target.value as keyof Order;
                                    this.setState(
                                        (prev) => ({ filter: { ...prev.filter, sortAttribute: v } }),
                                        this._refresh
                                    );
                                }}
                            >

                                <MenuItem value="Date">
                                    Date
                        </MenuItem>
                                <MenuItem value="Reference">
                                    Reference
                        </MenuItem>
                                <MenuItem value="Total">
                                    Price
                        </MenuItem>
                            </TextField>
                        </Grid>
                    </GridContainer>
                </Grid>
                <Grid item={true} className={classes.content}>
                    <InfiniteLoader
                        {...infiniteLoaderProps}
                    >
                        {({ onRowsRendered, registerChild }) => {
                            return (<AutoSizer>
                                {({ height: h, width: w }) => (
                                    <List
                                        ref={(list) => {
                                            this._list = list;
                                            registerChild(list);
                                        }}
                                        height={h}
                                        onRowsRendered={onRowsRendered}
                                        rowCount={rowCount}
                                        rowHeight={this.state.rowHeight}
                                        rowRenderer={this._rowRenderer}
                                        width={w}
                                        style={{ outline: 'none' }}
                                    />
                                )}
                            </AutoSizer>);
                        }}
                    </InfiniteLoader>
                </Grid>
                <Fabs
                    map={[

                        this.state.fetching ?
                            'loading' : hasRights ?
                                {
                                    icon: <Add />,
                                    legend: 'add new',
                                    onClick: add,
                                    color: 'primary',
                                    themeColor: 'green',
                                } : null,
                        hasRights && ordersTemplatesBtn,
                        hasRights && ordersProductsTemplatesBtn
                    ]}
                />
                {editing >= 0 &&
                    <Dialog
                        open={!!editingOpened}
                        fullScreen={true}
                        onClose={cancel}
                    >

                        <OrderDetail
                            {...{
                                intl,
                                shopCtx,
                                authCtx,
                                warehouseCtx,
                                settingsCtx,
                                categoryCtx,
                                productCtx,
                                usersCtx,
                                templateCtx
                            }}
                            id={this._loadedRowsMap[editing].Id}
                            preview={this._loadedRowsMap[editing]}
                            onCancel={() => {
                                this.setState(
                                    () => ({ editingOpened: false })
                                );

                            }}
                            onChanged={(order) => {
                                this._handleItemChanged(order, editing);
                            }}
                            onDelete={() => {
                                this._handleOrderDeleted();
                            }}
                            key={editing}
                        />
                    </Dialog>
                }
                {creating &&
                    <Dialog
                        open={!!creatingOpened}
                        fullScreen={true}
                        onClose={close}
                    >

                        <OrderDetail
                            {...{
                                intl, templateCtx, usersCtx,
                                shopCtx, authCtx, warehouseCtx, settingsCtx, categoryCtx, productCtx
                            }}
                            preview={creating}
                            onCancel={() => {
                                this.setState(
                                    () => ({ editing: -1, creatingOpened: false })
                                );
                            }}
                            onChanged={() => {
                                this._resetFilters();
                            }}
                            onDelete={() => {
                                this._handleOrderDeleted();
                            }}
                        />

                    </Dialog>
                }
            </GridContainer>);
    }
    //     <div className="orders__filter-bar">
    //     <InteractiveTitle>
    //         <FilterBar
    //             intl={intl}
    //             typeMap={map}
    //             def={filters}
    //             change={this._setFilters}
    //         />
    //     </InteractiveTitle>
    // </div>

    private _toggleFilterType(type: OrderType) {
        this.setState(
            (prev) => ({
                filter: {
                    ...prev.filter,
                    types: prev.filter.types.indexOf(type) < 0 ?
                        [...prev.filter.types, type] : prev.filter.types.filter(t => t !== type)
                }
            }),
            () => this._refresh());
    }
    private _toggleFilterStatus(status: OrderStatus) {
        this.setState(
            (prev) => ({
                filter: {
                    ...prev.filter,
                    status: prev.filter.status.indexOf(status) < 0 ?
                        [...prev.filter.status, status] : prev.filter.status.filter(t => t !== status)
                }
            }),
            () => this._refresh());
    }
    private _rowRenderer(props: ListRowProps) {
        const { intl } = this.props;
        const { index } = props;

        const order = this._loadedRowsMap[index];

        return (
            <div
                key={`${props.key}-${this.state.lastUpdate}`}
                style={props.style}
            >
                <OrderListItem
                    order={order}
                    intl={intl}
                    onClick={order ? (
                        () => this.setState(() => ({ editing: index, editingOpened: true }))
                    ) :
                        undefined}
                />
            </div>
        );
    }
    private _getFilters() {
        const {
            filter: { status, types, reference, shopId, userId,
                fromDate, toDate, sortAttribute, sortDirection } } = this.state;
        let filters: Filter[] = [];
        if (status && status.length) {
            filters.push(
                Filter.And(Filter.Eq('OrderType', 'Order'), Filter.Or(...status.map(s => Filter.Eq('Status', s)))));
        }
        if (types && types.length) {
            filters.push(Filter.Or(...types.map(t => Filter.Eq('OrderType', t))));
        }
        if (reference || fromDate || toDate || shopId || userId) {
            const morefilters: Filter[] = [];
            if (reference) {
                morefilters.push(Filter.Like('Reference', reference));
            }
            if (shopId) {
                morefilters.push(Filter.Like('ShopId', shopId));
            }
            if (userId) {
                morefilters.push(Filter.Like('UserId', userId));
            }
            if (fromDate) {
                morefilters.push(Filter.Gte('Date', fromDate));
            }
            if (toDate) {
                morefilters.push(Filter.Lte('Date', toDate));
            }
            filters = [Filter.And(...filters, ...morefilters)];
            // filters.push(Filter.Or(...types.map(t => Filter.Eq('OrderType', t))));
        }
        return {
            filters: filters,
            operator: 'or',
            sort: `${sortDirection === 'ascending' ? '' : '-'}${sortAttribute}`
        } as FilterDefinition;
    }
    private _loadMore(range: IndexRange) {
        const { stopIndex, startIndex } = range;
        this._loadMoreRowsStartIndex = startIndex;
        this._loadMoreRowsStopIndex = stopIndex;
        var filterDef = this._getFilters();
        const delta = stopIndex - startIndex;

        this.setState(prev => ({
            loading: prev.loading + delta,
            fetching: true
        }));

        return Orders.Find(
            filterDef,
            startIndex,
            stopIndex + 1)
            .then(response => {

                const { Values: { length: count } } = response;

                response.Values.forEach((order, i) => {
                    this._loadedRowsMap[startIndex + i] = order;
                });

                this.setState(prev => ({
                    loading: prev.loading - count,
                    loaded: prev.loaded + count,
                    rowCount: response.Count,
                    fetching: false,
                    lastUpdate: new Date().getTime()

                }));
            });
    }

    private _refresh() {
        this._loadedRowsMap = {};
        if (this._list) {
            this._list.forceUpdate();
            this._list.forceUpdateGrid();
        }
        this.setState(
            () => ({
                editing: -1,
                rowCount: 0,
                loaded: 0,
                loading: 0,
                lastUpdate: new Date().getTime()
            }),
            () => {
                this._loadMore({
                    startIndex: this._loadMoreRowsStartIndex,
                    stopIndex: this._loadMoreRowsStopIndex
                })
                    .then(
                        () => {
                            if (this._list) {
                                this._list.forceUpdate();
                                this._list.forceUpdateGrid();
                            }
                        }
                    );
            });
    }
    private _resetFilters() {
        this.setState(
            () => ({ filter: DefaultFilters() }),
            () => this._refresh()
        );

    }
    private _printOrders(templateId: string) {
        var filterDef = this._getFilters();

        DocumentTemplates
            .Orders(
                filterDef,
                templateId
            )
            .then((res) => {
                new Printer({
                    content: () => (
                        <div
                            dangerouslySetInnerHTML={{ __html: res.html }}
                        />
                    ),
                    cssClasses: ['body--print-reciept'],
                    cssStyles: res.styles,
                    copyStyles: false
                }).Print();
            });
    }
    private _printOrdersProducts(templateId: string) {
        var filterDef = this._getFilters();

        DocumentTemplates
            .OrdersProducts(
                filterDef,
                templateId
            )
            .then((res) => {
                new Printer({
                    content: () => (
                        <div
                            dangerouslySetInnerHTML={{ __html: res.html }}
                        />
                    ),
                    cssClasses: ['body--print-reciept'],
                    cssStyles: res.styles,
                    copyStyles: false
                }).Print();
            });
    }
    private _handleItemChanged(order: Order, index: number) {
        this._loadedRowsMap[index] = order;
        if (this._list) {
            this._list.forceUpdateGrid();
        }
        this.setState(() => ({
            editing: index,
            lastUpdate: new Date().getTime()
        }));
    }

    private _handleOrderDeleted() {

        this.setState(
            () => ({
                editing: -1,
                creating: undefined
            }),
            () => this._refresh());
    }

    private _isRowLoaded(ind: Index) {
        // No entry in this map signifies that the row has never been loaded before
        return !!this._loadedRowsMap[ind.index];
    }
}

const drawerWidth = '16rem';
export default withStyles((theme: OurTheme): StyleRules<injectedClasses> => {

    return {
        containerCls: {
            height: '100%',
            position: 'relative'
        },
        searchInput: {

        },
        menuContainer: {
            borderRight: `1px solid ${theme.palette.divider}`,
            height: '100%',
            position: 'relative',
            flex: '0 0 auto',
            overflow: 'auto'
        },
        menu: {
            height: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column'
        },
        menuItem: {
            paddingLeft: theme.spacing.unit,
            paddingRight: theme.spacing.unit,
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
        menuItemLast: {
            marginTop: 'auto'
        },
        submenu: {
            flexShrink: 0,
            whiteSpace: 'nowrap',
            height: '100%',
            position: 'relative',
            boxSizing: 'border-box',
            borderRight: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden'
        },
        submenuOpen: {
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
        submenuClose: {
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            overflowX: 'hidden',
            width: 0,
            marginLeft: -1
        },
        submenuContent: {
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
            position: 'relative',
            padding: '0 40px'
        },
        mainCls: {
            height: '100%',
            overflow: 'auto',
            flexGrow: 1,
        },
        menuItemIcon: {
        },
        menuItemActive: {
            borderLeftColor: theme.palette.primary.main,
            opacity: 1
        },
        drawerSpacer: {
            height: 60
        },
        tooltip: {
            background: theme.palette.common.white,
            color: theme.palette.text.primary,
            boxShadow: theme.shadows[1],
            fontSize: 11,
        },
        sort: {
            marginTop: 'auto',
            display: 'flex',
            flexShrink: 0
        },
        MuiPickerDTHeader: {
            hourMinuteLabel: {
                flexDirection: 'row',
            }
        }
    };
})(OrderList);