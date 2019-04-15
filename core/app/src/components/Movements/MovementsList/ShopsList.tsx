import * as React from 'react';

import {
    List,
    Index,
    IndexRange,
    ListRowProps,
    InfiniteLoader,
    AutoSizer
} from 'react-virtualized';

import MovementsListItem from '../MovementsListItem/MovementsListItem';
import { Movements } from '../../../_services';
import { InjectedIntlProps } from 'react-intl';

import { Movement, Cashbox } from 'src/@types/our-orders';
import Fabs, { FabBtnProps } from 'src/components/Fabs/Fabs';

import {
    Add,
    Cached,
    AccountBalance,
    CheckCircleOutline
} from '@material-ui/icons';

import {
    withStyles, Dialog, WithStyles, Grid
} from '@material-ui/core';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import { debounce } from 'throttle-debounce';
import MovementsDetail from '../MovementsDetail/MovementsDetail';
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
import { Filter } from 'src/_helpers/Filter';

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

export type ShopsListProps =
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
        id: string;
        archived?: boolean;
        from?: Date;
        to?: Date;
        sortAttribute: keyof Movement;
        sortDirection: 'ascending' | 'descending';
        refreshCashbox: () => void;
    };

// type ShopsFilter = {
//     archived: boolean;
//     shop: string;

// };

type State = {
    fetching?: boolean;
    balancing?: boolean;
    editing: number;
    editingOpened?: boolean;
    creating?: Movement;
    creatingOpened?: boolean;
    rowCount: number;
    loading: number;
    loaded: number;
    rowHeight: number;
    lastUpdate: number;
    drawerOpen: boolean;
    cashbox?: Cashbox;
};

class ShopsList extends React.Component<ShopsListProps, State> {

    private _loadedRowsMap: { [index: number]: Movement } = {};
    private _list: List | null;
    private _loadMoreRowsStartIndex: number;
    private _loadMoreRowsStopIndex: number;

    constructor(props: ShopsListProps) {
        super(props);

        this._isRowLoaded = this._isRowLoaded.bind(this);
        this._loadMore = this._loadMore.bind(this);
        this._rowRenderer = this._rowRenderer.bind(this);
        this._refresh = debounce(100, this._refresh);
        // this._toggleFilterArchived = this._toggleFilterArchived.bind(this);

        this.state = {
            loading: 0,
            loaded: 0,
            rowHeight: 80,
            rowCount: 0,
            editing: -1,
            drawerOpen: false,
            lastUpdate: new Date().getTime()
        };
    }

    componentWillMount() {
        this._loadMore({ startIndex: 0, stopIndex: 0 });
        this._refreshCashbox();
    }

    componentDidUpdate(prevProps: ShopsListProps, prevState: State) {
        if (Object.keys(prevProps).some(k => this.props[k] !== prevProps[k])) {
            this._refresh();
        }
    }

    render() {
        const {
            rowCount, editing, creating,
            cashbox,
            fetching,
            balancing,
        } = this.state;
        const {
            intl,
            classes,
            templateCtx: templates,
            usersCtx,
            shopCtx,
            authCtx,
            warehouseCtx,
            settingsCtx,
            categoryCtx,
            productCtx,
            id,
            archived
        } = this.props;

        const loading = fetching || balancing;

        const add = () => {
            this.setState(() => ({ fetching: true }), () => {
                Movements
                    .Empty('CHF', {})
                    .then((empty) =>
                        this.setState(
                            () => ({ creating: empty, fetching: false })
                        ));
            });
        };

        const cancel = () => {
            this.setState(
                () => ({ editing: -1, creating: undefined })
            );
        };

        const needsBalance =
            cashbox &&
            id &&
            cashbox[id] &&
            Object.keys(cashbox[id]).some(currency => !!cashbox[id][currency]);

        const balance = () => {
            if (!cashbox || !id) { return; }
            this.setState(
                () => ({ balancing: true }),
                () => {
                    Movements.Balance(id).then(() =>
                        this.setState(
                            () => ({ balancing: false }),
                            () => {
                                this._refresh();
                                this.props.refreshCashbox();
                            }
                        ));
                }
            );
        };

        return (
            <GridContainer className={classes.containerCls} spacing={0}>
                <Grid item={true} className={classes.content}>
                    {(needsBalance || archived) ?
                        <InfiniteLoader
                            {...{
                                isRowLoaded: this._isRowLoaded,
                                loadMoreRows: this._loadMore,
                                rowCount: rowCount
                            }}
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
                        </InfiniteLoader> :
                        <div className={classes.noBalance}>
                            <CheckCircleOutline className={classes.noBalanceIcon} />
                        </div>
                    }
                </Grid>
                <Fabs
                    map={
                        loading ?
                            [{
                                icon: <Cached />,
                                legend: 'loading',
                                themeColor: 'gray'
                            }] as FabBtnProps[] :
                            [{
                                icon: <Add />,
                                legend: 'add new',
                                onClick: add,
                                color: 'primary',
                                themeColor: 'green',
                            },
                            needsBalance && {
                                icon: <AccountBalance />,
                                legend: 'balance cash',
                                themeColor: 'gray',
                                onClick: balance
                            }] as FabBtnProps[]
                    }
                />

                <Dialog
                    open={editing >= 0}
                    fullScreen={true}
                    onClose={cancel}
                >
                    {editing >= 0 &&
                        <MovementsDetail
                            {...{
                                intl,
                                shopCtx,
                                authCtx,
                                usersCtx,
                                warehouseCtx,
                                settingsCtx,
                                categoryCtx,
                                productCtx,
                                templateCtx: templates
                            }}
                            id={this._loadedRowsMap[editing].Id}
                            preview={this._loadedRowsMap[editing]}
                            onCancel={() => {
                                this.setState(
                                    () => ({ editing: -1, creating: undefined })
                                );
                            }}
                            onChanged={(order) => {
                                this._handleItemChanged(order, editing);
                            }}
                            onDelete={() => {
                                this._handleOrderDeleted();
                            }}
                            // uid={this._editingLightboxId}
                            key={editing}
                        />
                    }
                </Dialog>
                <Dialog
                    open={!!creating}
                    fullScreen={true}
                    onClose={close}
                >
                    {creating &&
                        <MovementsDetail
                            {...{
                                intl,
                                shopCtx,
                                authCtx,
                                usersCtx,
                                warehouseCtx,
                                settingsCtx,
                                categoryCtx,
                                productCtx,
                                templateCtx: templates
                            }}
                            preview={creating}
                            onCancel={() => {
                                this.setState(
                                    () => ({ editing: -1, creating: undefined })
                                );
                            }}
                            onChanged={() => {
                                this._refresh();
                                this.props.refreshCashbox();
                            }}
                            onDelete={() => {
                                this._handleOrderDeleted();
                            }}
                        />
                    }
                </Dialog>
            </GridContainer>);
    }

    private _refreshCashbox() {
        Movements.Cashbox().then((cashbox) => this.setState(() => ({ cashbox })));
    }

    private _rowRenderer(props: ListRowProps) {
        const { intl } = this.props;
        const { index } = props;

        const movement = this._loadedRowsMap[index];

        return (
            <div
                key={`${props.key}-${this.state.lastUpdate}`}
                style={props.style}
            >
                <MovementsListItem
                    movement={movement}
                    intl={intl}
                    onClick={movement ? (
                        () => this.setState(() => ({ editing: index }))
                    ) :
                        undefined}
                />
            </div>
        );
    }

    private _loadMore(range: IndexRange) {
        const { stopIndex, startIndex } = range;
        this._loadMoreRowsStartIndex = startIndex;
        this._loadMoreRowsStopIndex = stopIndex;
        const { id, archived, from, to, sortAttribute, sortDirection } = this.props;

        const delta = stopIndex - startIndex;
        const sort = `${sortDirection === 'ascending' ? '' : '-'}${sortAttribute}`;

        this.setState(prev => ({
            loading: prev.loading + delta,
            fetching: true
        }));

        const filters: Filter[] = [];
        if (!archived) {
            filters.push(Filter.Eq('Archived', false));
        }

        if (id) {
            filters.push(Filter.Eq('ShopId', id));
        }

        if (from) {
            filters.push(Filter.Gte('Creation', from));
        }
        if (to) {
            filters.push(Filter.Lte('Creation', to));
        }

        return Movements.Find(
            {
                filters,
                operator: 'and',
                sort
            },
            startIndex,
            stopIndex + 1)
            .then(response => {

                const { Values: { length: count } } = response;

                response.Values.forEach((voucher, i) => {
                    this._loadedRowsMap[startIndex + i] = voucher;
                });

                this.setState(prev => ({
                    loading: prev.loading - count,
                    loaded: prev.loaded + count,
                    rowCount: response.Count,
                    lastUpdate: new Date().getTime(),
                    fetching: false
                }));
            });
    }

    private _refresh() {
        this._loadedRowsMap = {};
        if (this._list) {
            this._list.forceUpdate();
            this._list.forceUpdateGrid();
        }
        this._refreshCashbox();
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
                    .then(() => {
                        if (this._list) {
                            this._list.forceUpdate();
                            this._list.forceUpdateGrid();
                        }
                    });
            });
    }

    private _handleItemChanged(movement: Movement, index: number) {
        this._loadedRowsMap[index] = movement;
        if (this._list) {
            this._list.forceUpdateGrid();
        }
        // this._refreshCashbox();
        this._refresh();
        this.props.refreshCashbox();
        this.setState(() => ({
            editing: index,
            lastUpdate: new Date().getTime()
        }));
    }

    private _handleOrderDeleted() {

        this.setState(
            () => ({
                editing: -1
            }),
            () => (this._refresh(), this.props.refreshCashbox()));
    }

    private _isRowLoaded(ind: Index) {
        // No entry in this map signifies that the row has never been loaded before
        return !!this._loadedRowsMap[ind.index];
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
        searchInput: {},
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
})(ShopsList);