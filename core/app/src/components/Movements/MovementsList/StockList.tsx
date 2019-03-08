import * as React from 'react';

import {
    List,
    Index,
    IndexRange,
    ListRowProps,
    InfiniteLoader,
    AutoSizer
} from 'react-virtualized';

import { StockUnitWarehouseResult, StockUnits, DocumentTemplates } from '../../../_services';
import { InjectedIntlProps } from 'react-intl';

import { Movement, Cashbox } from 'src/@types/our-orders';
import Fabs, { FabBtnProps } from 'src/components/Fabs/Fabs';

import {
    Cached, Print
} from '@material-ui/icons';

import {
    withStyles, WithStyles, Grid, Dialog, DialogContent, DialogActions, Button
} from '@material-ui/core';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import { debounce } from 'throttle-debounce';
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
import StockListItem from '../StockListItem/StockListItem';
import Stock from 'src/components/Stock/Stock';
import { Printer } from 'src/_helpers/print';
import { FilterDefinition } from 'src/_types/FilterDefinition';

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

export type StockListProps =
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
        min?: number;
        max?: number;
        sku?: string;
    };

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
    openDialog?: boolean;
    dialogSku?: string;
    dialogTitle?: string;
    templatesOpened?: boolean;
};

class StockList extends React.Component<StockListProps, State> {

    private _loadedRowsMap: { [index: number]: StockUnitWarehouseResult } = {};
    private _list: List | null;
    private _loadMoreRowsStartIndex: number;
    private _loadMoreRowsStopIndex: number;

    constructor(props: StockListProps) {
        super(props);

        this._handelOpen = this._handelOpen.bind(this);
        this._handelClose = this._handelClose.bind(this);

        this._isRowLoaded = this._isRowLoaded.bind(this);
        this._loadMore = this._loadMore.bind(this);
        this._rowRenderer = this._rowRenderer.bind(this);
        this._refresh = debounce(100, this._refresh);

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
    }

    componentDidUpdate(prevProps: StockListProps, prevState: State) {
        if (Object.keys(prevProps).some(k => this.props[k] !== prevProps[k])) {
            this._refresh();
        }
    }
    render() {
        const {
            rowCount,
            fetching,
            openDialog,
            dialogSku,
            dialogTitle
        } = this.state;
        const {
            classes,
            settingsCtx,
            warehouseCtx,
            authCtx,
            templateCtx
        } = this.props;

        const loading = fetching;

        const stocksTemplates = templateCtx
            .templates
            .filter(t => t.ApplyTo === 'Stocks');

        const ordersTemplatesBtn = stocksTemplates.length > 0 && {
            icon: <Print />,
            legend: stocksTemplates.length > 1 ? 'documents' : stocksTemplates[0].Title,
            themeColor: 'gray',
            onClick: stocksTemplates.length > 1 ?
                () => this.setState(() => ({ templatesOpened: true })) : () => this._printOrders(stocksTemplates[0].Id)
        } as FabBtnProps;

        return (
            <GridContainer className={classes.containerCls} spacing={0}>
                <Grid item={true} className={classes.content}>

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
                    </InfiniteLoader>
                </Grid>
                <Dialog
                    maxWidth="lg"
                    open={!!openDialog}
                    onClose={this._handelClose}
                >
                    <DialogContent>
                        <Stock
                            {...{ settingsCtx, warehouseCtx, authCtx }}
                            skus={[{ sku: dialogSku!, legend: dialogTitle! }]}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button
                            variant="contained"
                            color="default"
                            onClick={this._handelClose}
                        >
                            Close
                        </Button>
                    </DialogActions>
                </Dialog>
                <Fabs
                    map={
                        [loading ? {
                            icon: <Cached />,
                            legend: 'loading',
                            themeColor: 'gray'
                        } : ordersTemplatesBtn]
                    }
                />
            </GridContainer>);
    }

    private _handelOpen() {
        this.setState({ openDialog: true });
    }

    private _handelClose() {
        this.setState({ openDialog: false });
    }

    private _rowRenderer(props: ListRowProps) {
        const { productCtx, productCtx: { products } } = this.props;
        const { index } = props;
        const { lastUpdate } = this.state;

        const product = this._loadedRowsMap[index];
        const title = product && products.filter(p => p.SKU === product.SKU).map(p => p.Title).join(', ');
        return (
            <StockListItem
                key={`${props.key}-${lastUpdate}`}
                style={props.style}
                onClick={() => {
                    if (product) {
                        this.setState(() => ({ openDialog: true, dialogSku: product.SKU, dialogTitle: title }));
                    }
                }}
                {...{ productCtx, product, title }}
            />
        );
    }

    private _loadMore(range: IndexRange) {
        const { stopIndex, startIndex } = range;
        this._loadMoreRowsStartIndex = startIndex;
        this._loadMoreRowsStopIndex = stopIndex;
        const { id, min, max, sku } = this.props;

        const delta = stopIndex - startIndex;

        this.setState(prev => ({
            loading: prev.loading + delta,
            fetching: true
        }));

        const filters: Filter[] = [];

        if (sku) {
            filters.push(Filter.Like('SKU', sku));
        }

        return StockUnits.Warehouse(
            id,
            {
                filters,
                operator: 'and'
            },
            min === undefined ? -1 : min,
            max === undefined ? -1 : max,
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
        // this._refreshCashbox();
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

    private _isRowLoaded(ind: Index) {
        // No entry in this map signifies that the row has never been loaded before
        return !!this._loadedRowsMap[ind.index];
    }

    private _printOrders(templateId: string) {
        const { id, min, max, sku } = this.props;
        const filters: Filter[] = [];

        if (sku) {
            filters.push(Filter.Like('SKU', sku));
        }
        const filterDef = { filters, operator: 'and' } as FilterDefinition;

        DocumentTemplates
            .Stocks(
                id,
                filterDef,
                min === undefined ? -1 : min,
                max === undefined ? -1 : max,
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
})(StockList);