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

import ClientListItem from '../ClientListItem/ClientListItem';
import { Clients } from '../../../_services';
import { InjectedAuthProps } from '../../../_context/Auth';
import { InjectedSettingsProps } from '../../../_context/Settings';
import { InjectedIntlProps } from 'react-intl';
import ClientDetail from '../ClientDetail/ClientDetail';
import { InjectedShopProps, InjectedWarehouseProps, InjectedUsersProps } from 'src/_context';
import { Client } from 'src/@types/our-orders';
import Fabs from 'src/components/Fabs/Fabs';

import {
    Add,
    Sort,
    ArrowUpward,
    ArrowDownward
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
    MenuItem,
    Button
} from '@material-ui/core';
import { InjectedCategoryProps } from 'src/_context/Category';
import { InjectedProductProps } from 'src/_context/Product';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import * as classNames from 'classnames';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import { Filter } from 'src/_helpers/Filter';
import { debounce } from 'throttle-debounce';
import { InjectedTemplatesProps } from 'src/_context/Templates';
import ClientListMesseges from './ClientListMesseges';
import { IsAdminOrInRole } from 'src/_helpers/roles';
import { InjectedNotistackProps, withSnackbar } from 'notistack';
import { FilterDefinition } from 'src/_types/FilterDefinition';
import ClientImport from '../ClientImport/ClientImport';

export type injectedClasses =
    'drawerSpacer' |
    'searchInput' |
    'menuContainer' |
    'menu' |
    'menuItem' |
    'menuItemLast' |
    'menuItemActive' |
    'menuItemIcon' |
    'drawer' |
    'drawerOpen' |
    'drawerClose' |
    'mainCls' |
    'containerCls' |
    'drawerContent' |
    'menuSort' |
    'tooltip' |
    'content';
export type ClientListProps =
    InjectedCategoryProps &
    InjectedAuthProps &
    InjectedIntlProps &
    InjectedShopProps &
    InjectedUsersProps &
    InjectedWarehouseProps &
    InjectedSettingsProps &
    InjectedProductProps &
    InjectedTemplatesProps &
    InjectedNotistackProps &
    WithStyles<injectedClasses> &
    {
    };

type ClientFilter = {
    firstName: string;
    lastName: string;
    email: string;
    telephone: string;
    sortAttribute: keyof Client;
    sortDirection: 'ascending' | 'descending';
};
type State = {
    lightboxes: Client[];
    fetching?: boolean;
    editing: number;
    importOpened?: boolean;
    editingOpened?: boolean;
    creatingOpened?: boolean;
    creating?: Client;
    filter: ClientFilter;
    rowCount: number;
    loading: number;
    loaded: number;
    rowHeight: number;
    lastUpdate: number;
    drawerOpen: boolean;
};

const LOCAL_STORAGE_KEY = 'our.orders.ClientList';
const DefaultFilters = (): ClientFilter => ({
    firstName: '',
    lastName: '',
    email: '',
    telephone: '',
    sortAttribute: localStorage.getItem(`${LOCAL_STORAGE_KEY}.sortAttribute`) as keyof Client
        || 'Creation',
    sortDirection: localStorage.getItem(`${LOCAL_STORAGE_KEY}.sortDirection`) as 'ascending' | 'descending'
        || 'descending'
});

class ClientList extends React.Component<ClientListProps, State> {
    private _loadedRowsMap: { [index: number]: Client } = {};
    private _list: List | null;
    private _loadMoreRowsStartIndex: number;
    private _loadMoreRowsStopIndex: number;

    private _firstNameInput: React.RefObject<HTMLInputElement>;
    private _lastNameInput: React.RefObject<HTMLInputElement>;
    private _emailNameInput: React.RefObject<HTMLInputElement>;
    private _telephoneNameInput: React.RefObject<HTMLInputElement>;
    constructor(props: ClientListProps) {
        super(props);

        this._isRowLoaded = this._isRowLoaded.bind(this);
        this._loadMore = this._loadMore.bind(this);
        this._rowRenderer = this._rowRenderer.bind(this);
        this._handleItemChanged = this._handleItemChanged.bind(this);
        this._firstNameInput = React.createRef<HTMLInputElement>();
        this._lastNameInput = React.createRef<HTMLInputElement>();
        this._emailNameInput = React.createRef<HTMLInputElement>();
        this._telephoneNameInput = React.createRef<HTMLInputElement>();
        this._refresh = debounce(100, this._refresh);
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
        this.setState(() => ({ fetching: true }), () => {
            this._loadMore({ startIndex: 0, stopIndex: 0 })
                .then(() =>
                    this.setState(
                        () => ({ fetching: false })
                    ));
        });
    }
    componentDidUpdate(prevProps: ClientListProps, prevState: State) {
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
            editingOpened, creatingOpened, importOpened,
            filter: { firstName, lastName, email, telephone, sortDirection, sortAttribute }
        } = this.state;

        const {
            intl,
            templateCtx: templates,
            shopCtx,
            authCtx,
            authCtx: { user },
            warehouseCtx,
            settingsCtx,
            categoryCtx,
            productCtx,
            classes,
            usersCtx
        } = this.props;

        const infiniteLoaderProps: InfiniteLoaderProps = {
            isRowLoaded: this._isRowLoaded,
            loadMoreRows: this._loadMore,
            rowCount: rowCount
        };

        const add = () => {
            this.setState(() => ({ fetching: true }), () => {
                Clients
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
        const firstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const q = e.target.value;
            this.setState(
                (prev) => ({ filter: { ...prev.filter, firstName: q } }),
                this._refresh
            );

        };

        const lastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const q = e.target.value;
            this.setState(
                (prev) => ({ filter: { ...prev.filter, lastName: q } }),
                this._refresh
            );

        };

        const emailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const q = e.target.value;
            this.setState(
                (prev) => ({ filter: { ...prev.filter, email: q } }),
                this._refresh
            );

        };

        const telephoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const q = e.target.value;
            this.setState(
                (prev) => ({ filter: { ...prev.filter, telephone: q } }),
                this._refresh
            );

        };

        const toggle = () => {
            this.setState(
                (prev) => ({ drawerOpen: !prev.drawerOpen })
            );
        };

        return (
            <GridContainer className={classes.containerCls} spacing={0}>
                <Grid
                    item={true}
                    className={classes.menuContainer}
                >
                    <MaterialList className={classes.menu}>
                        <ListItem
                            className={
                                classNames(
                                    classes.menuItem,
                                    classes.menuItemLast,
                                    // classes.menuSort,
                                    (firstName ||
                                        lastName ||
                                        email ||
                                        telephone) && classes.menuItemActive
                                )
                            }
                        >
                            <Tooltip
                                title={intl.formatMessage(ClientListMesseges.sortBtn)}
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
                    className={classNames(classes.drawer, {
                        [classes.drawerOpen]: drawerOpen,
                        [classes.drawerClose]: !drawerOpen,
                    })}
                >
                    <GridContainer className={classes.drawerContent} direction="column">
                        <Grid item={true}>
                            <TextField
                                label={intl.formatMessage(ClientListMesseges.firstName)}
                                fullWidth={true}
                                value={firstName}
                                inputRef={this._firstNameInput}
                                onChange={firstNameChange}
                            />
                        </Grid>
                        <Grid item={true}>
                            <TextField
                                label={intl.formatMessage(ClientListMesseges.lastName)}
                                fullWidth={true}
                                value={lastName}
                                inputRef={this._lastNameInput}
                                onChange={lastNameChange}
                            />
                        </Grid>
                        <Grid item={true}>
                            <TextField
                                label={intl.formatMessage(ClientListMesseges.email)}
                                fullWidth={true}
                                value={email}
                                inputRef={this._emailNameInput}
                                onChange={emailChange}
                            />
                        </Grid>
                        <Grid item={true}>
                            <TextField
                                type="number"
                                label={intl.formatMessage(ClientListMesseges.telephone)}
                                fullWidth={true}
                                value={telephone}
                                inputRef={this._telephoneNameInput}
                                onChange={telephoneChange}
                            />
                        </Grid>
                        <Grid item={true}>
                            <Button onClick={() => this._export()}>export</Button>
                        </Grid>
                        <Grid item={true}>
                            <Button onClick={() => this._import()}>import</Button>
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
                                label={intl.formatMessage(ClientListMesseges.sort)}
                                fullWidth={true}
                                value={sortAttribute || ''}
                                select={true}
                                onChange={(value) => {
                                    const v = value.target.value as keyof Client;
                                    this.setState(
                                        (prev) => ({ filter: { ...prev.filter, sortAttribute: v } }),
                                        this._refresh
                                    );
                                }}
                            >
                                {([
                                    'FirstName',
                                    'LastName',
                                    'OrganizationName',
                                    'City',
                                    'CountryIso',
                                    'State'
                                ] as Array<keyof Client>).map(k => (
                                    <MenuItem key={k} value={k}>
                                        {k}
                                    </MenuItem>))}
                            </TextField>
                        </Grid>
                    </GridContainer>
                </Grid>
                <div className={classes.content}>
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
                </div>
                <Fabs
                    map={[
                        this.state.fetching ?
                            'loading' : IsAdminOrInRole(user, 'CRUD_CLIENTS') &&
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

                        <ClientDetail
                            {...{
                                intl, usersCtx,
                                shopCtx, authCtx, warehouseCtx, settingsCtx, categoryCtx, productCtx,
                                templateCtx: templates
                            }}
                            id={this._loadedRowsMap[editing].Id}
                            preview={this._loadedRowsMap[editing]}
                            onCancel={() => {
                                this.setState(
                                    () => ({ editingOpened: false })
                                );

                            }}
                            onChanged={(client) => {
                                this._handleItemChanged(client, editing);
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

                        <ClientDetail
                            {...{
                                intl,
                                shopCtx,
                                usersCtx,
                                authCtx,
                                warehouseCtx,
                                settingsCtx,
                                categoryCtx,
                                productCtx,
                                templateCtx: templates
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
                <Dialog
                    open={!!importOpened}
                    fullScreen={true}
                    onClose={close}
                >

                    <ClientImport
                        {...{
                            intl,
                            settingsCtx
                        }}
                        close={() => {
                            this.setState(
                                () => ({ importOpened: false })
                            );
                        }}
                        refresh={() => {
                            this._refresh();
                        }}
                    />
                </Dialog>

            </GridContainer>);
    }

    private _rowRenderer(props: ListRowProps) {
        const { intl } = this.props;
        const { index } = props;

        const client = this._loadedRowsMap[index];

        return (
            <div
                key={`${props.key}-${this.state.lastUpdate}`}
                style={props.style}
            >
                <ClientListItem
                    client={client}
                    intl={intl}
                    onClick={client ? (
                        () => this.setState(() => ({ editing: index, editingOpened: true }))
                    ) :
                        undefined}
                />
            </div>
        );
    }

    private _export() {
        Clients.ExportCsv(this._GetFilters()).then(csvString => {
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvString));
            element.setAttribute('download', 'clients.csv');
            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        });

    }
    private _import() {
        this.setState(
            () => ({ importOpened: true })
        );

    }
    private _GetFilters() {
        const { filter: { firstName, lastName, telephone, email, sortAttribute, sortDirection } } = this.state;
        const filters: Filter[] = [];

        if (firstName) {
            filters.push(Filter.Like('FirstName', firstName));
        }
        if (lastName) {
            filters.push(Filter.Like('LastName', lastName));
        }

        if (email) {
            filters.push(Filter.Like('Email', email));
        }

        if (telephone) {
            filters.push(Filter.Or(Filter.Like('Phone', telephone), Filter.Like('CellPhone', telephone)));
        }
        return {
            filters: filters,
            operator: 'and',
            // query: query,
            sort: `${sortDirection === 'ascending' ? '' : '-'}${sortAttribute}`
        } as FilterDefinition;
    }
    private _loadMore(range: IndexRange) {
        const { stopIndex, startIndex } = range;
        this._loadMoreRowsStartIndex = startIndex;
        this._loadMoreRowsStopIndex = stopIndex;
        // const { filter: { query, sortAttribute, sortDirection } } = this.state;

        const delta = stopIndex - startIndex;

        this.setState(prev => ({
            loading: prev.loading + delta,
            fetching: true
        }));

        return Clients.Find(
            this._GetFilters(),
            startIndex,
            stopIndex + 1)
            .then(response => {

                const { Values: { length: count } } = response;

                response.Values.forEach((client, i) => {
                    this._loadedRowsMap[startIndex + i] = client;
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
    private _handleItemChanged(client: Client, index: number) {
        this._loadedRowsMap[index] = client;
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
        menuContainer: {
            borderRight: `1px solid ${theme.palette.divider}`,
            height: '100%',
            position: 'relative',
            flex: '0 0 auto',
            overflow: 'auto'
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
        menuItemLast: { marginTop: 'auto' },
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
            flex: '0 0 auto',
            opacity: 0.5,
            transition: theme.transitions.create('opacity', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.short,
            })
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
})(withSnackbar(ClientList));