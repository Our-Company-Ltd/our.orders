
import * as React from 'react';
import { Order, OrderItem } from 'src/@types/our-orders';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules, withStyles } from '@material-ui/core/styles';
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid
} from '@material-ui/core';
import { InjectedWarehouseProps, InjectedAuthProps } from 'src/_context';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
export type injectedClasses = 'leftIconCls' | 'alreadyPaidBtnCls';
export type InjectedOrderCheckoutPickupStylesProps = { classes: { [key in injectedClasses]: string } };

export const OrderCheckoutStockSelectStyles = (theme: OurTheme): StyleRules<injectedClasses> => ({
    leftIconCls: {
        marginRight: theme.spacing.unit,
    },
    alreadyPaidBtnCls: {
    }
});
type State = {
    stock: { item: OrderItem; quantity: number; warehouseId?: string }[];
};

type OrderCheckoutStockSelectProps =
    InjectedOrderCheckoutPickupStylesProps &
    InjectedWarehouseProps &
    InjectedAuthProps & {
        order: Order;
        stock: { item: OrderItem; quantity: number; warehouseId?: string }[];
        onSelect: (
            stock: { item: OrderItem; quantity: number; warehouseId?: string }[]
        ) => void;
    };
class OrderCheckoutStockSelect extends React.Component<OrderCheckoutStockSelectProps, State> {
    constructor(props: OrderCheckoutStockSelectProps) {
        super(props);

        const { stock } = props;

        this.state = {
            stock
        };
    }
    render() {
        const {
            warehouseCtx
        } = this.props;
        const {
            stock
        } = this.state;

        return (
            <GridContainer>
                {stock.map((stockItem, i) => {
                    const { item: { UID, Title }, quantity, warehouseId } = stockItem;

                    return (
                        <Grid item={true} xs={12} key={UID}>
                            <FormControl fullWidth={true}>
                                <InputLabel>{`${quantity} ${Title || ''}:`}</InputLabel>
                                <Select
                                    fullWidth={true}
                                    value={warehouseId || '---'}
                                    onChange={(e, c) => this._select(i, e)}
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
                        </Grid>);
                }
                )}
            </GridContainer>);
    }
    private _select(index: number, event: React.ChangeEvent<HTMLSelectElement>) {
        const { stock: oldStock } = this.state;
        const { onSelect } = this.props;
        const warehouseId = event.target.value;
        const stock = oldStock.map((s, i) => (i === index ? { ...s, warehouseId } : s));
        this.setState(() => ({ stock }), () => onSelect(stock));
    }

}

export default withStyles(OrderCheckoutStockSelectStyles)(OrderCheckoutStockSelect);