
import * as React from 'react';
import { Order, Dispatch, OrderItem, DispatchMethod, DispatchStatus } from 'src/@types/our-orders';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules, withStyles } from '@material-ui/core/styles';
import {
    Button,
    Dialog,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    DialogTitle,
    DialogContent,
    DialogActions,
    Grid
} from '@material-ui/core';
import { InjectedWarehouseProps, InjectedAuthProps } from 'src/_context';
import * as shortid from 'shortid';
import OrderCheckoutStockSelect from '../OrderCheckout/OrderCheckoutStockSelect';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
export type injectedClasses = 'submitBtnCls' | 'stockPanelCls';
export type InjectedOrderShippingDialogStylesProps = { classes: { [key in injectedClasses]: string } };

export const OrderShippingDialogStyles = (theme: OurTheme): StyleRules<injectedClasses> => ({
    submitBtnCls: {
        backgroundColor: theme.Colors.green.primary.main,
        '&:hover': {
            backgroundColor: theme.Colors.green.primary.dark
        }
    },
    stockPanelCls: {
        marginTop: theme.spacing.unit
    }
});
type State = {

    advanced: boolean;
    method: DispatchMethod,
    status: DispatchStatus,
    warehouseId?: string;
    stock: { item: OrderItem; quantity: number; warehouseId?: string }[];
};

type OrderShippingDialogProps =
    InjectedOrderShippingDialogStylesProps &
    InjectedWarehouseProps &
    InjectedAuthProps & {
        toggle: (opened: boolean) => void;
        open: boolean;
        methods: DispatchMethod[];
        defaultStatus: DispatchStatus;
        defaultMethod: DispatchMethod;
        order: Order;
        stock: { item: OrderItem; quantity: number; warehouseId?: string }[];
        onSelect: (
            dispatch: Dispatch,
            stock: { item: OrderItem; quantity: number; warehouseId?: string }[]
        ) => void;
    };
class OrderShippingDialog extends React.Component<OrderShippingDialogProps, State> {
    constructor(props: OrderShippingDialogProps) {
        super(props);
        this._open = this._open.bind(this);
        this._add = this._add.bind(this);
        this._close = this._close.bind(this);
        this._select = this._select.bind(this);
        this._more = this._more.bind(this);
        this._less = this._less.bind(this);

        const warehouseId = props.authCtx.user!.WarehouseId || '---';
        const { stock, defaultStatus, defaultMethod } = props;

        this.state = {
            advanced: stock.length <= 1,
            warehouseId,
            stock,
            method: defaultMethod,
            status: defaultStatus
        };
    }
    render() {
        const {
            warehouseCtx,
            authCtx,
            order,
            methods,
            open,
            classes: {
                submitBtnCls,
                stockPanelCls
            }
        } = this.props;
        const {
            warehouseId,
            advanced,
            stock,
            method,
            status
        } = this.state;

        return (
            <Dialog
                {...{ open }}
            >
                <DialogTitle>Dispatch Shipping</DialogTitle>
                <DialogContent>
                    <GridContainer>
                        <Grid item={true} xs={12}>
                            <FormControl fullWidth={true}>
                                <InputLabel>Method</InputLabel>
                                <Select
                                    fullWidth={true}
                                    value={method}
                                    onChange={(e) =>
                                        this.setState(() => ({ method: e.target.value as DispatchMethod }))}
                                    inputProps={{
                                        name: 'DispatchMethod',
                                        id: 'DispatchMethod',
                                    }}
                                >
                                    {methods.map(m => ({ preview: m, value: m }))
                                        .map(dispatchMethod => (
                                            <MenuItem key={dispatchMethod.value} value={dispatchMethod.value}>
                                                {dispatchMethod.preview}
                                            </MenuItem>
                                        ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item={true} xs={12}>
                            <FormControl fullWidth={true}>
                                <InputLabel htmlFor="DispatchStatus">
                                    Status
                                    </InputLabel>
                                <Select
                                    fullWidth={true}
                                    value={status || ''}
                                    onChange={(e) =>
                                        this.setState(() => ({ status: e.target.value as DispatchStatus }))}
                                    inputProps={{
                                        name: 'DispatchStatus',
                                        id: 'DispatchStatus',
                                    }}
                                >
                                    {[
                                        { preview: 'Init', value: 'Init' },
                                        { preview: 'Preparing', value: 'Preparing' },
                                        { preview: 'Ready for delivery', value: 'ReadyForDelivery' },
                                        { preview: 'En route', value: 'EnRoute' },
                                        { preview: 'Undeliverable', value: 'Undeliverable' },
                                        { preview: 'Delivered', value: 'Delivered' }
                                    ].map(dispatchStatus => (
                                        <MenuItem key={dispatchStatus.value} value={dispatchStatus.value}>
                                            {dispatchStatus.preview}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item={true} xs={12} classes={{ item: stockPanelCls }}>
                            {!advanced &&

                                <FormControl fullWidth={true}>
                                    <InputLabel>Update all items Stock</InputLabel>
                                    <Select
                                        fullWidth={true}
                                        value={warehouseId || '---'}
                                        onChange={this._select}
                                    >
                                        {warehouseCtx.Warehouses.map(w =>
                                            <MenuItem
                                                key={w.Id}
                                                value={w.Id}
                                            >
                                                {`${w.Name}`}
                                            </MenuItem>
                                        )}
                                        <MenuItem value="---">
                                            <em>Don't update Stock</em>
                                        </MenuItem>
                                    </Select>
                                </FormControl>
                            }
                            {advanced &&
                                <OrderCheckoutStockSelect
                                    {...{
                                        warehouseCtx,
                                        order,
                                        authCtx,
                                        stock,
                                        onSelect: (s) => this.setState(() => ({ stock: s }))
                                    }}

                                />
                            }
                        </Grid>
                    </GridContainer>
                </DialogContent>
                <DialogActions>
                    {!advanced && stock.length > 1 &&
                        <Button
                            color="secondary"
                            variant="contained"
                            onClick={this._more}
                        >
                            More options...
                        </Button>
                    }
                    {advanced && stock.length > 1 &&
                        <Button
                            color="secondary"
                            variant="contained"
                            onClick={this._less}
                        >
                            Less options...
                        </Button>
                    }
                    <Button color="default" variant="contained" onClick={this._close}>cancel</Button>
                    <Button
                        color="primary"
                        variant="contained"
                        onClick={this._add}
                        classes={{ root: submitBtnCls }}
                    >
                        update
                    </Button>
                </DialogActions>
            </Dialog>);
    }
    private _less() {
        this.setState(() => ({ advanced: false }));
    }
    private _more() {
        this.setState(() => ({ advanced: true }));
    }
    private _close() {
        this.props.toggle(false);
    }
    private _open() {
        this.props.toggle(false);
    }
    private _select(event: React.ChangeEvent<HTMLSelectElement>, child: React.ReactNode) {
        const { stock } = this.props;
        const warehouseId = event.target.value;

        this.setState(() => ({ warehouseId, stock: stock.map((s) => ({ ...s, warehouseId })) }));
    }
    private _add() {
        const { onSelect } = this.props;
        const { stock, status, method } = this.state;
        const dispatch: Dispatch = {
            Method: method,
            Status: status,
            Date: new Date().toISOString(),
            Id: shortid()
        };
        onSelect(dispatch, stock);
        this._close();
    }
}

export default withStyles(OrderShippingDialogStyles)(OrderShippingDialog);