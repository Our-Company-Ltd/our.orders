
import * as React from 'react';
import { Order, Dispatch, OrderItem } from 'src/@types/our-orders';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { withStyles, WithStyles } from '@material-ui/core/styles';
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
    ButtonBase
} from '@material-ui/core';
import { LocalMall } from '@material-ui/icons';
import { InjectedWarehouseProps, InjectedAuthProps } from 'src/_context';
import * as shortid from 'shortid';
import OrderCheckoutStockSelect from './OrderCheckoutStockSelect';
import PayBtnStyles, { PayBtnClasses } from './OrderCheckoutBtnStyles';
import createPalette from '@material-ui/core/styles/createPalette';

type State = {
    open: boolean;
    advanced: boolean;
    warehouseId?: string;
    stock: { item: OrderItem; quantity: number; warehouseId?: string }[];
};

type OrderCheckoutPickupProps =
    WithStyles<PayBtnClasses | 'leftIconCls'> &
    InjectedWarehouseProps &
    InjectedAuthProps & {
        order: Order;
        stock: { item: OrderItem; quantity: number; warehouseId?: string }[];
        onSelect: (
            dispatch: Dispatch,
            stock: { item: OrderItem; quantity: number; warehouseId?: string }[]
        ) => void;
    };
class OrderCheckoutPickup extends React.Component<OrderCheckoutPickupProps, State> {
    constructor(props: OrderCheckoutPickupProps) {
        super(props);
        this._open = this._open.bind(this);
        this._add = this._add.bind(this);
        this._close = this._close.bind(this);
        this._select = this._select.bind(this);
        this._more = this._more.bind(this);
        this._less = this._less.bind(this);

        const warehouseId = props.authCtx.user!.WarehouseId || '---';
        const { stock } = props;

        this.state = {
            advanced: stock.length <= 1,
            open: false,
            warehouseId,
            stock
        };
    }
    render() {
        const {
            warehouseCtx,
            authCtx,
            order,
            classes
        } = this.props;
        const {
            open,
            warehouseId,
            advanced,
            stock
        } = this.state;

        return (
            <React.Fragment>
                <ButtonBase
                    focusRipple={true}
                    onClick={this._open}
                    classes={{ root: classes.buttonBase }}
                >
                    <LocalMall className={classes.btnIcon} />
                    <span className={classes.btnText}>
                        Pickup
                    </span>
                </ButtonBase>
                <Dialog
                    {...{ open }}
                >
                    <DialogTitle>Update Stock</DialogTitle>
                    <DialogContent>
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
                            </FormControl>}
                        {advanced &&
                            <OrderCheckoutStockSelect
                                {...{
                                    warehouseCtx,
                                    order,
                                    authCtx,
                                    stock,
                                    onSelect: (s) => this.setState(() => ({ stock: s }))
                                }}
                            />}
                    </DialogContent>
                    <DialogActions>
                        {!advanced && stock.length > 1 &&
                            <Button color="secondary" variant="contained" onClick={this._more}>More options...</Button>
                        }
                        {advanced && stock.length > 1 &&
                            <Button color="secondary" variant="contained" onClick={this._less}>Less options...</Button>
                        }
                        <Button color="default" variant="contained" onClick={this._close}>cancel</Button>
                        <Button color="primary" variant="contained" onClick={this._add}>update</Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>);
    }
    private _less() {
        this.setState(() => ({ advanced: false }));
    }
    private _more() {
        this.setState(() => ({ advanced: true }));
    }
    private _close() {
        this.setState(() => ({ open: false }));
    }
    private _open() {
        const { stock } = this.props;
        if (stock.length >= 1) {
            this.setState(() => ({ open: true }));
        } else {
            this._add();
        }

    }
    private _select(event: React.ChangeEvent<HTMLSelectElement>, child: React.ReactNode) {
        const { stock } = this.props;
        const warehouseId = event.target.value;

        this.setState(() => ({ warehouseId, stock: stock.map((s) => ({ ...s, warehouseId })) }));
    }
    private _add() {
        const { onSelect } = this.props;
        const { stock } = this.state;
        const dispatch: Dispatch = {
            Method: 'Pickup',
            Status: 'Delivered',
            Date: new Date().toISOString(),
            Id: shortid()
        };
        onSelect(dispatch, stock);
        this._close();
    }
}

export default withStyles((theme: OurTheme) =>
    ({
        ...PayBtnStyles(theme, createPalette({ primary: { main: '#9c27b0', contrastText: '#ffffff' } })),
        leftIconCls: {
            marginRight: theme.spacing.unit,
        }
    })
)(OrderCheckoutPickup);