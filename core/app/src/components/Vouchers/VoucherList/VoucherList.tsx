import * as React from 'react';

import {
    List,
    Index,
    IndexRange,
    ListRowProps,
    InfiniteLoader,
    AutoSizer
} from 'react-virtualized';

import VoucherListItem from '../VoucherListItem/VoucherListItem';
import { Vouchers } from '../../../_services';
import { InjectedIntlProps } from 'react-intl';

import { Voucher } from 'src/@types/our-orders';
import Fabs from 'src/components/Fabs/Fabs';

import {
    Add,
    CheckCircle,
    Timelapse,
    Sort,
    Block,
    ArrowUpward,
    ArrowDownward
} from '@material-ui/icons';

import {
    withStyles, Dialog, WithStyles, ListItem, IconButton, List as MaterialList, Grid, TextField, Tooltip, MenuItem
} from '@material-ui/core';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import * as classNames from 'classnames';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import { debounce } from 'throttle-debounce';
import VoucherDetail from '../VoucherDetail/VoucherDetail';
import {
    InjectedSettingsProps,
    InjectedWarehouseProps,
    InjectedAuthProps,
    InjectedShopProps,
    InjectedUsersProps
} from 'src/_context';
import * as shortid from 'shortid';
import { CODE_LENGTH } from 'src/components/VoucherCode/VoucherCode';
import { InjectedCategoryProps } from 'src/_context/Category';
import { InjectedProductProps } from 'src/_context/Product';
import { InjectedTemplatesProps } from 'src/_context/Templates';
import VoucherListMesseges from './VoucherListMesseges';
import { Filter } from 'src/_helpers/Filter';
import { IsAdminOrInRole } from 'src/_helpers/roles';

export type injectedClasses =
    'drawerSpacer' |
    'searchInput' |
    'menu' |
    'menuContainer' |
    'menuItem' |
    'menuItemActive' |
    'menuItemIcon' |
    'content' |
    'drawer' |
    'drawerOpen' |
    'drawerClose' |
    'mainCls' |
    'containerCls' |
    'drawerContent' |
    'menuSort' |
    'tooltip';

export type VoucherListProps =
    InjectedWarehouseProps &
    InjectedCategoryProps &
    InjectedAuthProps &
    InjectedShopProps &
    InjectedProductProps &
    InjectedUsersProps &
    InjectedTemplatesProps &
    InjectedSettingsProps &
    InjectedIntlProps &
    WithStyles<injectedClasses> &
    {
    };

type VoucherFilter = {
    valid: boolean;
    used: boolean;
    expired: boolean;
    code: string;
    from: Date | null;
    to: Date | null;
    sortAttribute: keyof Voucher;
    sortDirection: 'ascending' | 'descending';
};

type State = {
    lightboxes: Voucher[];
    fetching?: boolean;
    editing: number;
    editingOpened?: boolean;
    creating?: Voucher;
    creatingOpened?: boolean;
    filter: VoucherFilter;
    rowCount: number;
    loading: number;
    loaded: number;
    rowHeight: number;
    lastUpdate: number;
    drawerOpen: boolean;
};

const LOCAL_STORAGE_KEY = 'our.orders.VoucherList';
const DefaultFilters = (): VoucherFilter => ({
    valid: true,
    expired: false,
    used: false,
    code: '',
    from: null,
    to: null,
    sortAttribute: localStorage.getItem(`${LOCAL_STORAGE_KEY}.sortAttribute`) as keyof Voucher
        || 'Creation',
    sortDirection: localStorage.getItem(`${LOCAL_STORAGE_KEY}.sortDirection`) as 'ascending' | 'descending'
        || 'descending'
});

class VoucherList extends React.Component<VoucherListProps, State> {
    private _loadedRowsMap: { [index: number]: Voucher } = {};
    private _list: List | null;
    private _loadMoreRowsStartIndex: number;
    private _loadMoreRowsStopIndex: number;
    // private _editingLighboxId = `${this.props.uid}/editing`;
    // private _creatingLighboxId = `${this.props.uid}/creating`;
    private _searchInput: React.RefObject<HTMLInputElement>;

    constructor(props: VoucherListProps) {
        super(props);

        this._isRowLoaded = this._isRowLoaded.bind(this);
        this._loadMore = this._loadMore.bind(this);
        this._rowRenderer = this._rowRenderer.bind(this);
        this._refresh = debounce(100, this._refresh);
        this._toggleFilterUsed = this._toggleFilterUsed.bind(this);
        this._toggleFilterValid = this._toggleFilterValid.bind(this);
        this._toggleFilterExpired = this._toggleFilterExpired.bind(this);
        this._searchInput = React.createRef<HTMLInputElement>();
        this.state = {
            filter: DefaultFilters(),
            loading: 0,
            loaded: 0,
            rowHeight: 80,
            rowCount: 0,
            editing: -1,
            drawerOpen: false,
            lastUpdate: new Date().getTime(),
            lightboxes: []
        };
    }

    componentWillMount() {
        this._loadMore({ startIndex: 0, stopIndex: 0 });
    }

    componentDidUpdate(prevProps: VoucherListProps, prevState: State) {
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
            rowCount, editing, creating, drawerOpen,
            editingOpened, creatingOpened,
            filter: { valid, used, expired, code, from: fromDate, to: toDate, sortDirection, sortAttribute }
        } = this.state;
        const {
            intl,
            classes,
            templateCtx,
            usersCtx,
            shopCtx,
            authCtx,
            authCtx: { user },
            warehouseCtx,
            settingsCtx,
            categoryCtx,
            productCtx,
            settingsCtx: { Settings: { Currencies } }
        } = this.props;

        const add = () => {
            this.setState(() => ({ fetching: true }), () => {
                Vouchers
                    .Empty({
                        Code: shortid().substr(0, CODE_LENGTH),
                        Currency: Currencies ? Currencies[0].Code : undefined
                    })
                    .then((empty) =>
                        this.setState(
                            () => ({ creating: empty, creatingOpened: true, fetching: false })
                        ));
            });

        };
        const cancel = () => {
            this.setState(
                () => ({ editing: -1, creating: undefined })
            );

        };

        const codeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const q = e.target.value;
            this.setState(
                (prev) => ({ filter: { ...prev.filter, code: q } }),
                this._refresh
            );

        };

        const fromDateChange = (value: Date) => {
            this.setState(
                (prev) => ({ filter: { ...prev.filter, from: value } }),
                this._refresh
            );
        };
        const toDateChange = (value: Date) => {
            this.setState(
                (prev) => ({ filter: { ...prev.filter, to: value } }),
                this._refresh
            );
        };

        const toggle = () => {
            this.setState(
                (prev) => ({ drawerOpen: !prev.drawerOpen })
            );
        };

        return (
            <GridContainer className={classes.containerCls} spacing={0} >
                <Grid
                    item={true}
                    className={classes.menuContainer}
                >
                    <MaterialList className={classes.menu}>
                        <ListItem
                            onClick={() => this._toggleFilterValid()}
                            className={
                                classNames(classes.menuItem, valid && classes.menuItemActive)
                            }
                        >
                            <Tooltip
                                title={intl.formatMessage(VoucherListMesseges.valid)}
                                placement="right"
                                classes={{ tooltip: classes.tooltip }}
                            >
                                <IconButton className={classNames(classes.menuItemIcon)}>
                                    <CheckCircle />
                                </IconButton>
                            </Tooltip>
                        </ListItem>
                        <ListItem
                            onClick={() => this._toggleFilterExpired()}
                            className={
                                classNames(classes.menuItem, expired && classes.menuItemActive)
                            }
                        >
                            <Tooltip
                                title={intl.formatMessage(VoucherListMesseges.expired)}
                                placement="right"
                                classes={{ tooltip: classes.tooltip }}
                            >
                                <IconButton className={classNames(classes.menuItemIcon)}>
                                    <Timelapse />
                                </IconButton>
                            </Tooltip>
                        </ListItem>
                        <ListItem
                            onClick={() => this._toggleFilterUsed()}
                            className={
                                classNames(classes.menuItem, used && classes.menuItemActive)
                            }
                        >
                            <Tooltip
                                title={intl.formatMessage(VoucherListMesseges.used)}
                                placement="right"
                                classes={{ tooltip: classes.tooltip }}
                            >
                                <IconButton
                                    className={classes.menuItemIcon}
                                >
                                    <Block />
                                </IconButton>
                            </Tooltip>
                        </ListItem>
                        <ListItem
                            className={
                                classNames(
                                    classes.menuItem,
                                    classes.menuSort,
                                    (code || fromDate || toDate) && classes.menuItemActive
                                )
                            }
                        >
                            <Tooltip
                                title={intl.formatMessage(VoucherListMesseges.sortBtn)}
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
                    className={classNames(classes.drawer, {
                        [classes.drawerOpen]: drawerOpen,
                        [classes.drawerClose]: !drawerOpen,
                    })}
                >
                    <GridContainer className={classes.drawerContent} direction="column">
                        <Grid item={true}>
                            <TextField
                                label="Code"
                                fullWidth={true}
                                value={code || ''}
                                inputRef={this._searchInput}
                                onChange={codeChange}
                            />
                        </Grid>
                        <Grid item={true}>
                            <DateTimePicker
                                label={intl.formatMessage(VoucherListMesseges.from)}
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
                                label={intl.formatMessage(VoucherListMesseges.to)}
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
                        <Grid item={true} style={{ marginTop: 'auto', display: 'flex' }}>
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
                                label="Sort"
                                fullWidth={true}
                                value={sortAttribute || ''}
                                select={true}
                                onChange={(value) => {
                                    const v = value.target.value as keyof Voucher;
                                    this.setState(
                                        (prev) => ({ filter: { ...prev.filter, sortAttribute: v } }),
                                        this._refresh
                                    );
                                }}
                            >
                                {([
                                    'Value',
                                    'Code',
                                    'Currency',
                                    'Expiration',
                                    'LastMod',
                                    'Creation'
                                ] as Array<keyof Voucher>).map(v => (
                                    <MenuItem key={v} value={v}>
                                        {v}
                                    </MenuItem>))}
                            </TextField>
                        </Grid>
                    </GridContainer>
                </Grid>
                <div className={classes.content}>
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
                </div>
                <Fabs
                    map={[
                        this.state.fetching ?
                            'loading' : IsAdminOrInRole(user, 'CRUD_VOUCHERS') &&
                            {
                                icon: <Add />,
                                legend: 'add new',
                                onClick: add,
                                color: 'primary',
                                themeColor: 'green',
                            }
                    ]}
                />
                {editing >= 0 &&
                    <Dialog
                        open={!!editingOpened}
                        fullScreen={true}
                        onClose={cancel}
                    >
                        <VoucherDetail
                            {...{
                                intl,
                                shopCtx,
                                authCtx,
                                usersCtx,
                                warehouseCtx,
                                settingsCtx,
                                categoryCtx,
                                productCtx,
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
                            // uid={this._editingLighboxId}
                            key={editing}
                        />

                    </Dialog>
                }
                {
                    creating &&
                    <Dialog
                        open={!!creatingOpened}
                        fullScreen={true}
                        onClose={close}
                    >

                        <VoucherDetail
                            {...{
                                intl,
                                shopCtx,
                                authCtx,
                                usersCtx,
                                warehouseCtx,
                                settingsCtx,
                                categoryCtx,
                                productCtx,
                                templateCtx
                            }}
                            preview={creating}
                            onCancel={() => {
                                this.setState(
                                    () => ({ creatingOpened: false })
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
            </GridContainer >);
    }

    private _toggleFilterValid() {
        this.setState(
            (prev) => ({ filter: { ...prev.filter, valid: !prev.filter.valid } }),
            () => this._refresh()
        );
    }

    private _toggleFilterUsed() {
        this.setState(
            (prev) => ({ filter: { ...prev.filter, used: !prev.filter.used } }),
            () => this._refresh()
        );
    }

    private _toggleFilterExpired() {
        this.setState(
            (prev) => ({ filter: { ...prev.filter, expired: !prev.filter.expired } }),
            () => this._refresh()
        );
    }

    private _rowRenderer(props: ListRowProps) {
        const { intl } = this.props;
        const { index } = props;

        const voucher = this._loadedRowsMap[index];

        return (
            <div
                key={`${props.key}-${this.state.lastUpdate}`}
                style={props.style}
            >
                <VoucherListItem
                    voucher={voucher}
                    intl={intl}
                    onClick={voucher ? (
                        () => this.setState(() => ({ editing: index, editingOpened: true }))
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
        const { filter: { valid, used, expired, from, to, code, sortAttribute, sortDirection } } = this.state;

        const orfilters: Filter[] = [];
        if (expired) {
            orfilters.push(
                Filter.And(
                    Filter.Eq('Used', false),
                    Filter.Lt('Expiration', new Date())
                )
            );
        }
        if (used) {
            orfilters.push(Filter.Eq('Used', true));
        }
        if (valid) {
            orfilters.push(
                Filter.And(
                    Filter.Or(Filter.IsNull('Expiration'), Filter.Gt('Expiration', new Date())),
                    Filter.Eq('Used', false)
                )
            );
        }
        const andfilters: Filter[] = [];
        if (code) {
            andfilters.push(Filter.Like('Code', code));
        }
        if (from) {
            andfilters.push(Filter.Gte('Creation', from));
        }

        if (to) {
            andfilters.push(Filter.Lte('Creation', to));
        }

        const delta = stopIndex - startIndex;
        const sort = `${sortDirection === 'ascending' ? '' : '-'}${sortAttribute}`;

        this.setState(prev => ({
            loading: prev.loading + delta,
            fetching: true
        }));

        return Vouchers.Find(
            {
                filters: andfilters.length ? [Filter.Or(...orfilters), ...andfilters] : orfilters,
                operator: andfilters.length ? 'and' : 'or',
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
                    .then(() => {
                        if (this._list) {
                            this._list.forceUpdate();
                            this._list.forceUpdateGrid();
                        }
                    });
            });
    }
    private _resetFilters() {
        this.setState(
            () => ({ filter: DefaultFilters() }),
            () => this._refresh()
        );

    }
    private _handleItemChanged(voucher: Voucher, index: number) {
        this._loadedRowsMap[index] = voucher;
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
                editing: -1
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
        menuContainer: {
            borderRight: `1px solid ${theme.palette.divider}`,
            height: '100%',
            position: 'relative',
            flex: '0 0 auto',
            overflow: 'auto'
        },
        content: {
            flex: '1 1 auto',
            height: '100%',
            position: 'relative',
            padding: '0 40px'
        },
        menuSort: {
            marginTop: 'auto'
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
            paddingRight: theme.spacing.unit,
            paddingLeft: theme.spacing.unit,
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
        drawerSpacer: {
            height: 60
        },
        tooltip: {
            background: theme.palette.common.white,
            color: theme.palette.text.primary,
            boxShadow: theme.shadows[1],
            fontSize: 11,
        }
    };
})(VoucherList);