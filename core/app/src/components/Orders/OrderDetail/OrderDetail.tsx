import * as React from 'react';
import OrderFields from '../OrderFields/OrderFields';
import { Orders, StockUnits } from '../../../_services';
import { debounce } from 'throttle-debounce';
// import { ToCanvas, ToPdf } from '../../../_helpers/print';
// import { Reciept } from '../../Forms/Order/Reciept';

import {
    InjectedShopProps, InjectedAuthProps, InjectedWarehouseProps, InjectedSettingsProps, InjectedUsersProps
} from '../../../_context';
import { InjectedIntlProps } from 'react-intl';
import OrderCheckout from '../OrderCheckout/OrderCheckout';

import {
    LocalShipping, Payment, Check, Close, HowToVote, Delete, Print
} from '@material-ui/icons';
import { Order, OrderItem, Dispatch, DispatchStatus, ModelType, DispatchMethod, Roles } from 'src/@types/our-orders';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    DialogActions,
    Button
} from '@material-ui/core';
import ellipsis from 'text-ellipsis';
import OrderShippingDialog from '../OrderShippingDialog/OrderShippingDialog';
import { InjectedCategoryProps } from 'src/_context/Category';
import { InjectedProductProps } from 'src/_context/Product';
import Fabs, { FabBtnProps } from 'src/components/Fabs/Fabs';
import { InjectedTemplatesProps } from 'src/_context/Templates';
import OrderDocumentsDialog, { PrintOrder } from './OrderDocumentsDialog';
import { StockStatus } from 'src/@types/StockStatus';
import OrderDocumentsDialogMessages from './OrderDocumentsDialogMessages';
import { IsAdminOrInRole } from 'src/_helpers/roles';

export type OrderDetailProps =
    InjectedWarehouseProps & InjectedSettingsProps &
    InjectedCategoryProps & InjectedProductProps &
    InjectedAuthProps & InjectedIntlProps &
    InjectedShopProps & InjectedUsersProps &
    InjectedTemplatesProps &
    {
        id?: string;
        preview?: Order;
        onCancel: () => void;
        onChanged?: (changed: Order) => void;
        onDelete: () => void;

        preventEditClient?: boolean;
    };

type State = {
    id?: string;

    current: Order;
    changes: Partial<Order>;

    loading?: boolean;

    confirmDispatchOpened?: boolean;
    confirmDispatchId?: string;

    dispatchOpened?: boolean;

    checkoutOpened?: boolean;

    templatesOpened?: boolean;
};

const LOCAL_STORAGE_KEY = 'our.orders.OrderDetail';

export class OrderDetail extends React.Component<OrderDetailProps, State> {
    private _lastRefresh: Date = new Date();
    constructor(props: OrderDetailProps) {
        super(props);

        this._UpdateDebounced = debounce(500, false, this._UpdateDebounced);
        this._Update = this._Update.bind(this);
        this._Refresh = this._Refresh.bind(this);
        this._Save = this._Save.bind(this);
        this._Delete = this._Delete.bind(this);

        const { id, preview } = props;

        this.state = {
            id,
            changes: id ? {} : (preview || {} as Order),
            current: preview || ({} as Order)
        };
    }
    render() {
        const {
            shopCtx,
            preventEditClient,
            intl,
            authCtx,
            warehouseCtx,
            templateCtx,
            settingsCtx,
            categoryCtx,
            productCtx,
            usersCtx
        } = this.props;

        const {
            current,
            checkoutOpened
        } = this.state;

        const close = () => this.setState(() => ({ checkoutOpened: false }));
        return (

            <React.Fragment>
                <OrderFields
                    {...{
                        preventEditClient: preventEditClient,
                        onChange: this._Update,
                        refresh: this._Refresh,
                        authCtx,
                        productCtx,
                        categoryCtx,
                        settingsCtx,
                        shopCtx,
                        warehouseCtx,
                        usersCtx,
                        current,
                        intl
                    }}
                />
                {this._Dispatch()}
                {this._ConfirmDisptach()}
                {this._renderActions()}
                <Dialog
                    open={!!checkoutOpened}
                    fullScreen={true}
                    onClose={close}
                >
                    <OrderCheckout
                        {...{ authCtx, warehouseCtx, intl, settingsCtx, shopCtx, templateCtx }}
                        order={current}
                        close={close}
                        save={this._Save}
                        refresh={this._Refresh}
                    />
                </Dialog>

            </React.Fragment>);
    }
    private _Dispatch() {
        const {
            props: {
                authCtx,

                warehouseCtx
            },
            state: {
                current,
                dispatchOpened,
                current: { Status }
            }
        } = this;

        if (Status !== 'ToDispatch') { return null; }
        return (
            <OrderShippingDialog
                {...{
                    authCtx,
                    defaultMethod: localStorage.getItem(`${LOCAL_STORAGE_KEY}.defaultMethod`) as DispatchMethod
                        || 'Post',
                    defaultStatus: localStorage.getItem(`${LOCAL_STORAGE_KEY}.defaultStatus`) as DispatchStatus
                        || 'EnRoute',
                    methods: ['Post', 'Pickup', 'Electronic', 'Courier'],
                    open: !!dispatchOpened,
                    warehouseCtx,
                    stock: this._getStock(),
                    order: current,
                    onSelect: (d, s) => this._applyUpdates(d, s),
                    toggle: (o: boolean) => this.setState({ dispatchOpened: o }),
                }}
            />);
    }
    private _ConfirmDisptach() {
        const {
            props: { intl },
            state: { confirmDispatchOpened, confirmDispatchId, current: { Dispatches, Status } }
        } = this;

        if (Status !== 'Dispatching') { return null; }

        const toConfim = Dispatches.filter(d => d.Status === 'EnRoute');
        return (
            <Dialog
                {...{ open: !!confirmDispatchOpened }}
            >
                <DialogTitle>Dispatch Shipping</DialogTitle>
                <DialogContent>

                    <FormControl fullWidth={true}>
                        <InputLabel htmlFor="DispatchStatus">
                            Confirm dispatch
                    </InputLabel>
                        <Select
                            fullWidth={true}
                            value={confirmDispatchId || ''}
                            onChange={(e) =>
                                this.setState(() => ({ confirmDispatchId: e.target.value }))}
                            inputProps={{
                                name: 'DispatchStatus',
                                id: 'DispatchStatus',
                            }}
                        >
                            {toConfim.map(d => (
                                <MenuItem key={d.Id} value={d.Id}>
                                    {`${d.Method ? d.Method : ''}
                                    from ${d.Date ? intl.formatDate(new Date(d.Date)) : ''}
                                    ${d.Notes ? `(${ellipsis(d.Notes, 30)})` : ''}`}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button
                        color="default"
                        variant="contained"
                        onClick={() => this.setState(() => ({ confirmDispatchOpened: false }))}
                    >
                        cancel
                    </Button>
                    <Button
                        disabled={!confirmDispatchId}
                        color="primary"
                        variant="contained"
                        onClick={() => this._applyConfirmDispatch()}
                    >
                        update
                    </Button>
                </DialogActions>
            </Dialog>);
    }
    private _applyConfirmDispatch() {
        const {
            state: { confirmDispatchId, current: { Dispatches } }
        } = this;

        const changes: Partial<Order> = {
            Dispatches: Dispatches.map(d => d.Id === confirmDispatchId ?
                { ...d, Status: 'Delivered' as DispatchStatus } : d)
        };
        return this._Save(changes)
            .then(() => this.setState(() => ({ confirmDispatchOpened: false })));
    }
    private _renderActions() {

        const { templateCtx, intl, authCtx: { user } } = this.props;
        const { current, changes, loading, id, templatesOpened } = this.state;
        const changed = !!Object.keys(changes).length;
        const hasItems = current.Items && current.Items.length > 0 || changes.Items && changes.Items.length > 0;

        const ownOrder = current.UserId === user!!.Id;

        const hasRights = ownOrder && IsAdminOrInRole(user, Roles.CRUD_Own_Orders) ||
            IsAdminOrInRole(user, Roles.CRUD_All_Orders);

        const isOrderType = current.OrderType === 'Order';
        const { Status } = current;

        const opencheckout = () => this.setState(() => ({ checkoutOpened: true }));

        const saveBtn: FabBtnProps = {
            icon: <Check />,
            onClick: () => this._Save(),
            themeColor: 'green',
            legend: 'save'
        };

        const payBtn: FabBtnProps = {
            icon: <Payment />,
            onClick: () => this._Save().then(opencheckout),
            themeColor: 'orange',
            legend: 'pay'
        };

        const toDispatchBtn: FabBtnProps = {
            icon: <HowToVote />,
            onClick: () => this.setState(() => ({ dispatchOpened: true })),
            themeColor: 'blue',
            legend: 'dispatch'
        };

        const confirmDeliveredBtn: FabBtnProps = {
            icon: <LocalShipping />,
            onClick: () => this.setState(() => ({ confirmDispatchOpened: true })),
            themeColor: 'green',
            legend: 'confirm'
        };

        const cancelBtn: FabBtnProps = {
            icon: <Close />,
            onClick: () => this.props.onCancel(),
            themeColor: 'gray',
            legend: changed ? 'cancel' : 'close'
        };

        const deleteBtn: FabBtnProps = {

            icon: <Delete />,
            legend: 'delete',
            themeColor: 'red',
            onClick: this._Delete
        };

        // const activateBtn: FabBtnProps = {
        //     icon: current.Canceled ? <CheckCircleOutline /> : <Block />,
        //     legend: current.Canceled ? 'set active' : 'set cancelled',
        //     onClick: () => {
        //         const deleteChanges = { ...this.state.changes, Canceled: !current.Canceled };
        //         this._Save(deleteChanges);
        //     }
        // };

        // const printBtn: FloatingActionButtonProps = {
        //     icon:
        //     {
        //         className: 'material-icons',
        //         inner: 'print',
        //         tag: 'i'
        //     },
        //     color: 'grey',
        //     children: [
        //         {
        //             icon: receiptIcon,
        //             size: 'secondary',
        //             legend: 'reciept',
        //             onClick: () => {
        //                 ToCanvas(
        //                     <Reciept
        //                         {...{ order: this.state.preview, shopCtx, intl }}
        //                     />
        //                 ).then((canvas) => {
        //                     ToPdf(canvas, 'reciept');
        //                     // PrintLink(canvas.toDataURL(), 'reciept');
        //                     // new Printer({
        //                     //     content: () => (
        //                     //         <img
        //                     //             src={canvas.toDataURL()}
        //                     //         />
        //                     //     ),
        //                     //     cssClasses: ['body--print-reciept'],
        //                     //     cssStyles:
        //                     //         `size: 8cm auto;
        //                     //          width: 8cm;`
        //                     // }).Print();
        //                 });

        //             }
        //         },
        //         {
        //             icon: offerIcon,
        //             size: 'secondary',
        //             legend: 'offer'
        //         }
        //     ]
        // };
        const templates = templateCtx
            .templates
            .filter(t => t.ApplyTo === ModelType.Order);

        const templateBtn = templates.length > 0 && {
            icon: <Print />,
            legend: templates.length > 1 ? 'documents' : templates[0].Title,
            themeColor: 'gray',
            onClick: templates.length > 1 ?
                () => this.setState(() => ({ templatesOpened: true })) : () => PrintOrder(templates[0].Id, current)
        } as FabBtnProps;

        if (loading) {
            return (
                <Fabs
                    map={['loading']}
                />);
        }

        if (!hasRights) {
            return (
                <Fabs
                    map={[
                        cancelBtn
                    ]}
                />);
        }

        if (!hasItems) {
            return (
                <Fabs
                    map={[
                        changed && saveBtn,
                        cancelBtn,
                        !!id && deleteBtn
                    ]}
                />);
        }

        const btns = [
            isOrderType && Status === 'Dispatching' && confirmDeliveredBtn,
            isOrderType && Status === 'ToDispatch' && toDispatchBtn,
            isOrderType && Status === 'PendingPayment' && payBtn,
            changed && saveBtn,
            templateBtn,
            // sendBtn,
            current.Canceled && deleteBtn,
            // activateBtn,
            cancelBtn,
            !!id && deleteBtn
        ];

        return (
            <React.Fragment>
                {templates.length > 1 ?
                    <OrderDocumentsDialog
                        opened={templatesOpened}
                        current={current}
                        intl={intl}
                        templates={templates}
                        onClose={() => this.setState(() => ({ templatesOpened: false }))}
                    /> : null}
                <Fabs
                    map={btns}
                />
            </React.Fragment>
        );
    }
    // backIcon={{
    //     className: 'material-icons',
    //     inner: 'chevron_left',
    //     tag: 'i'
    // }}
    private _Update(changes: Partial<Order>) {
        const { current: old } = this.state;
        const current = { ...old, ...changes };
        this.setState(
            (prev) => ({ current, loading: true, changes: { ...prev.changes, ...changes } }),
            this._UpdateDebounced
        );
    }

    private _UpdateDebounced() {
        const refreshTimeStamp = new Date();
        this._lastRefresh = refreshTimeStamp;
        const { id, changes } = this.state;
        Orders.Preview(changes, id)
            .then(order => {
                if (refreshTimeStamp.valueOf() !== this._lastRefresh.valueOf()) { return; }

                this.setState(() => ({
                    current: order,
                    loading: false
                }));
            });
    }

    private _Refresh() {
        this._Update({});
    }

    private _Save(extrachanges?: Partial<Order>) {
        const { changes, id } = this.state;

        const finalchanges = { ...changes, ...extrachanges };

        const save = (saveChanges: Partial<Order>) => {
            if (id) {
                return Orders
                    .Patch(id, saveChanges)
                    .then(model => {
                        this.setState(() => ({
                            changes: {},
                            current: model
                        }));
                        if (this.props.onChanged) {
                            this.props.onChanged(model);
                        }
                    });
            } else {
                return Orders
                    .Create(saveChanges)
                    .then(model => {
                        this.setState(() => ({
                            changes: {},
                            current: model,
                            id: model.Id
                        }));
                        if (this.props.onChanged) {
                            this.props.onChanged(model);
                        }
                    });
            }
        };

        return save(finalchanges);
    }

    private _Delete() {
        const { id } = this.state;
        const { onDelete, intl: { formatMessage } } = this.props;

        const isTodelete = window.confirm(formatMessage(OrderDocumentsDialogMessages.deleteConfirm));

        if (id && isTodelete) {
            Orders
                .Delete(id)
                .then(onDelete);
        }
    }

    private _getStock() {
        const {
            props: {
                authCtx
            },
            state: {
                current: order
            }
        } = this;

        const stockDone = (item: OrderItem) => {
            const {
                Quantity,
                SKU,
                DispatchInfos
            } = item;
            const quantity = Quantity || 0;

            return !SKU ||
                quantity === 0 ||
                (DispatchInfos && DispatchInfos.Quantity < quantity && DispatchInfos.Warehouse);
        };

        const warehouseId = authCtx.user!.WarehouseId || '---';
        const getStock = (items: OrderItem[]): { item: OrderItem; quantity: number; warehouseId?: string }[] => {
            if (!items) { return []; }

            return items.filter(item => !stockDone(item))
                .reduce<{ item: OrderItem; quantity: number; warehouseId?: string }[]>(
                    (result, item) => {
                        const subitems = getStock(item.Items);
                        const {
                            Quantity,
                            DispatchInfos
                        } = item;

                        const quantity = (Quantity || 0) - ((DispatchInfos && DispatchInfos.Quantity) || 0);
                        if (quantity <= 0) {
                            return [...result, ...subitems];
                        } else {
                            return [...result, { quantity, item, warehouseId }, ...subitems];
                        }
                    },
                    []);
        };

        return getStock(order.Items);

    }

    private _applyDispatch(items: OrderItem[], stocks: StockStatus[]): OrderItem[] {
        return items.map(item => {
            const stock = stocks.find(s => s.item.UID === item.UID);
            let { Items, DispatchInfos } = item;
            if (stock) {
                DispatchInfos = {
                    ...DispatchInfos,
                    Warehouse: stock.warehouseId || '',
                    Quantity: (DispatchInfos && DispatchInfos.Quantity || 0) + (stock.quantity || 0),
                    Date: new Date().toISOString()
                };
            } else if (!item.SKU && item.NeedsDispatch) {
                DispatchInfos = {
                    ...DispatchInfos,
                    Warehouse: '',
                    Quantity: (item.Quantity || 0),
                    Date: new Date().toISOString()
                };
            }
            return {
                ...item,
                Items: Items && this._applyDispatch(item.Items, stocks),
                DispatchInfos
            } as OrderItem;
        });
    }
    private _applyUpdates(dispatch: Dispatch, stock: StockStatus[]) {
        const {
            state: { current: { Dispatches, Items } }

        } = this;
        if (dispatch.Method) {
            localStorage.setItem(`${LOCAL_STORAGE_KEY}.defaultMethod`, dispatch.Method);
        }
        if (dispatch.Status) {
            localStorage.setItem(`${LOCAL_STORAGE_KEY}.defaultStatus`, dispatch.Status);
        }
        const uses: { [sku: string]: { [warehouse: string]: number } } = {};
        stock.forEach(s => {
            const { item: { SKU }, warehouseId, quantity } = s;
            if (!SKU || !warehouseId || warehouseId === '---') { return; }
            uses[SKU] = uses[SKU] || {};
            uses[SKU][warehouseId] = quantity;
        });
        const changes: Partial<Order> = {
            Dispatches: dispatch ? [...Dispatches, dispatch] : Dispatches,
            Items: this._applyDispatch(Items, stock)
        };
        return StockUnits.Use(uses)
            .then(() => this._Save(changes))
            .then(() => this.setState(() => ({ dispatchOpened: false })));
    }

}

export default OrderDetail;