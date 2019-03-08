
import * as React from 'react';
import { Order, Dispatch, OrderItem } from 'src/@types/our-orders';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules, withStyles, WithStyles } from '@material-ui/core/styles';
import {
    ButtonBase
} from '@material-ui/core';
import { LocalShipping } from '@material-ui/icons';
import { InjectedWarehouseProps, InjectedAuthProps } from 'src/_context';
import OrderShippingDialog from '../OrderShippingDialog/OrderShippingDialog';
import PayBtnStyles, { PayBtnClasses } from './OrderCheckoutBtnStyles';
import createPalette from '@material-ui/core/styles/createPalette';
export type injectedClasses = 'stockPanelCls' | 'iconCls' | 'buttonBase' | 'btnIcon' | 'btnText';
export type InjectedOrderCheckoutShippingStylesProps = { classes: { [key in injectedClasses]: string } };

export const OrderCheckoutShippingStyles = (theme: OurTheme): StyleRules<injectedClasses> => ({
    stockPanelCls: {
        marginTop: theme.spacing.unit,
    },
    iconCls: {
        paddingRight: theme.spacing.unit
    },
    buttonBase: {
        ...theme.typography.button,
        borderRadius: theme.shape.borderRadius,
        color: theme.palette.primary.contrastText,
        backgroundColor: theme.palette.primary.main,
        boxShadow: theme.shadows[2],
        width: '100%',
        flexWrap: 'wrap',
        padding: theme.spacing.unit,
        boxSizing: 'border-box',
        '&$focusVisible': {
            boxShadow: theme.shadows[6],
        },
        '&:active': {
            boxShadow: theme.shadows[8],
        },
        '&:hover': {
            backgroundColor: theme.palette.primary.light,
            // Reset on touch devices, it doesn't add specificity
            '@media (hover: none)': {
                backgroundColor: theme.palette.primary.main
            }
        },
    },
    btnIcon: {
        display: 'block',
        width: '100%',
        height: '100px',
    },
    btnText: {
        display: 'block',
        paddingTop: theme.spacing.unit
    }
});
type State = {
    open: boolean;
};

type OrderCheckoutShippingProps =
    WithStyles<PayBtnClasses | 'stockPanelCls' | 'iconCls'> &
    InjectedWarehouseProps &
    InjectedAuthProps & {
        order: Order;
        stock: { item: OrderItem; quantity: number; warehouseId?: string }[];
        onSelect: (
            dispatch: Dispatch,
            stock: { item: OrderItem; quantity: number; warehouseId?: string }[]
        ) => void;
    };
class OrderCheckoutShipping extends React.Component<OrderCheckoutShippingProps, State> {
    constructor(props: OrderCheckoutShippingProps) {
        super(props);

        this._toggle = this._toggle.bind(this);
        this._close = this._close.bind(this);
        this._open = this._open.bind(this);

        this.state = {
            open: false
        };
    }
    render() {
        const {
            props: {
                classes,
                ...props
            },
            state: {
                open
            }
        } = this;

        return (
            <React.Fragment>
                <ButtonBase
                    focusRipple={true}
                    onClick={this._open}
                    classes={{ root: classes.buttonBase }}
                >
                    <LocalShipping className={classes.btnIcon} />
                    <span className={classes.btnText}>
                        Shipping
                    </span>
                </ButtonBase>
                <OrderShippingDialog
                    {...{
                        ...props,
                        toggle: this._toggle,
                        open,
                        methods: ['Post', 'Electronic', 'Courier'],
                        defaultMethod: 'Post',
                        defaultStatus: 'Init'
                    }}
                />
            </React.Fragment>);
    }
    private _toggle(open: boolean) {
        this.setState(() => ({ open }));
    }
    private _open() {
        this._toggle(true);
    }

    private _close() {
        this._toggle(false);
    }
}

export default withStyles((theme: OurTheme) =>
    ({
        ...PayBtnStyles(theme, createPalette({ primary: { main: '#6494ff', contrastText: '#ffffff' } })),
        stockPanelCls: {
            marginTop: theme.spacing.unit,
        },
        iconCls: {
            paddingRight: theme.spacing.unit
        }
    })
)(OrderCheckoutShipping);