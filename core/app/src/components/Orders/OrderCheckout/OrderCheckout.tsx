import * as React from 'react';

import {
    Close, Print
} from '@material-ui/icons';

import { InjectedIntlProps } from 'react-intl';

import { InjectedWarehouseProps, InjectedAuthProps, InjectedShopProps, InjectedSettingsProps } from '../../../_context';
import { Order, Dispatch, OrderItem } from 'src/@types/our-orders';
import { Grid, Typography, Paper, ButtonBase } from '@material-ui/core';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import OrderReciept from '../OrderReciept/OrderReciept';
import PostFinanceButton from './Pay/PostFinance/PostFinanceButton';
import CCTerminalButton from './Pay/CCTerminal/CCTerminalButton';
import TransferButton from './Pay/Transfer/Button';
import VoucherButton from './Pay/Voucher/VoucherButton';
import PayPalButton from './Pay/PayPal/PayPalButton';
import CashButton from './Pay/Cash/Button';
import StripeButton from './Pay/Stripe/StripeButton';
import OrderCheckoutPickup from './OrderCheckoutPickup';
import OrderCheckoutShipping from './OrderCheckoutShipping';
import { StockUnits } from 'src/_services';
import { StockStatus } from 'src/@types/StockStatus';
import DetailGridColumn from 'src/components/DetailGridColumn/DetailGridColumn';
import DetailGridContainer from 'src/components/DetailGridContainer/DetailGridContainer';
import Fabs from 'src/components/Fabs/Fabs';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules, withStyles, WithStyles } from '@material-ui/core/styles';
import { InjectedTemplatesProps } from 'src/_context/Templates';
import PayBtnStyles, { PayBtnClasses } from './OrderCheckoutBtnStyles';
import createPalette from '@material-ui/core/styles/createPalette';
import { PrintOrder } from '../OrderDetail/OrderDocumentsDialog';

export type injectedClasses = PayBtnClasses | 'paperCls' | 'paperInnerCLs' | 'detailGridColumnInner';
export type OrderCheckoutProps =
    WithStyles<injectedClasses> &
    InjectedSettingsProps &
    InjectedShopProps &
    InjectedAuthProps &
    InjectedWarehouseProps &
    InjectedTemplatesProps &
    InjectedIntlProps & {
        order: Order;
        // tslint:disable-next-line:no-any
        save: (changes: Partial<Order>) => Promise<any>;
        refresh: () => void;
        close: () => void;
    };
type State = {
    stock: StockStatus[];
    dispatch?: Dispatch
};

class OrderCheckout extends React.Component<OrderCheckoutProps, State> {
    constructor(props: OrderCheckoutProps) {
        super(props);
        this._applyUpdates = this._applyUpdates.bind(this);

        this.state = {
            stock: this._getStock()
        };
    }

    render() {

        const {
            props: {
                save,
                refresh,
                settingsCtx,
                templateCtx,
                shopCtx,
                intl,
                order,
                authCtx,
                order: {
                    NeedsDispatch,
                    Total
                },
                close,
                classes }
        } = this;

        const needsPay = Total !== 0;

        const templates = templateCtx
            .templates
            .filter(t => t.ApplyTo === 'payment');

        // const templateBtn = templates.length > 0 && {
        //     icon: <Print />,
        //     legend: templates.length > 1 ? 'documents' : templates[0].Title,
        //     themeColor: 'gray',
        //     onClick: templates.length > 1 ?
        //         () => this.setState(() => ({ templatesOpened: true })) : () => PrintOrder(templates[0].Id, current)
        // } as FabBtnProps;

        return (
            <DetailGridContainer>
                <DetailGridColumn>
                    <div className={classes.detailGridColumnInner}>
                        <Paper
                            square={true}
                            className={classes.paperCls}
                        >
                            <div className={classes.paperInnerCLs}>
                                <OrderReciept {...{ order, shopCtx, intl }} />
                            </div>
                        </Paper>
                    </div>
                </DetailGridColumn>
                <DetailGridColumn>
                    <div className={classes.detailGridColumnInner}>
                        <GridContainer>
                            {needsPay && (
                                <React.Fragment>
                                    <Grid item={true} xs={12}>
                                        <Typography variant="h6" align="center">Pay</Typography>
                                    </Grid>
                                    {settingsCtx.Settings.PaymentProviders
                                        .filter(paymentProvider =>
                                            settingsCtx.Settings.HidePaymentProviders.indexOf(paymentProvider) < 0)
                                        .map(paymentProvider => (
                                            <React.Fragment>
                                                {
                                                    paymentProvider === 'postfinance' &&
                                                    <Grid item={true} xs={3}>
                                                        <PostFinanceButton
                                                            onChange={save}
                                                            refresh={refresh}
                                                            order={order}
                                                        />
                                                    </Grid>}
                                                {
                                                    paymentProvider === 'transfer' &&
                                                    <Grid item={true} xs={3}>
                                                        <TransferButton
                                                            onChange={save}
                                                            refresh={refresh}
                                                            order={order}
                                                        />
                                                    </Grid>}
                                                {
                                                    paymentProvider === 'voucher' &&
                                                    <Grid item={true} xs={3}>
                                                        <VoucherButton
                                                            intl={intl}
                                                            onChange={save}
                                                            order={order}
                                                            refresh={refresh}
                                                            authCtx={authCtx}
                                                        />
                                                    </Grid>}
                                                {
                                                    paymentProvider === 'paypal' &&
                                                    <Grid item={true} xs={3}>
                                                        <PayPalButton
                                                            onChange={save}
                                                            order={order}
                                                        />
                                                    </Grid>}
                                                {
                                                    paymentProvider === 'cash' &&
                                                    <Grid item={true} xs={3}>
                                                        <CashButton
                                                            settingsCtx={settingsCtx}
                                                            refresh={refresh}
                                                            order={order}
                                                        />
                                                    </Grid>}
                                                {
                                                    paymentProvider === 'stripe' &&
                                                    <Grid item={true} xs={3}>
                                                        <StripeButton
                                                            onChange={save}
                                                            order={order}
                                                        />
                                                    </Grid>}
                                                {
                                                    paymentProvider === 'ccterminal' &&
                                                    <Grid item={true} xs={3}>
                                                        <CCTerminalButton
                                                            onChange={save}
                                                            order={order}
                                                            refresh={refresh}
                                                        />
                                                    </Grid>}
                                            </React.Fragment>)
                                        )}

                                </React.Fragment>)}
                            {NeedsDispatch && this._renderDispatch()}
                            {templates.length > 0 &&
                                <React.Fragment>
                                    <Grid item={true} xs={12}>
                                        <Typography variant="h6" align="center">Documents</Typography>
                                    </Grid>
                                    {templates.map(t => (
                                        <Grid item={true} xs={3}>
                                            <ButtonBase
                                                focusRipple={true}
                                                onClick={() => PrintOrder(t.Id, order)}
                                                classes={{ root: classes.buttonBase }}
                                            >
                                                <Print className={classes.btnIcon} />
                                                <span className={classes.btnText}>
                                                    {t.Title}
                                                </span>
                                            </ButtonBase>
                                        </Grid>)
                                    )}
                                </React.Fragment>
                            }
                        </GridContainer>
                    </div>
                </DetailGridColumn>

                <Fabs
                    map={[
                        {
                            icon: <Close />,
                            onClick: close,
                            legend: 'close'
                        }
                    ]}
                />
            </DetailGridContainer>);
    }
    private _getStock() {
        const {
            props: {
                authCtx,
                order
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
        const getStock = (items: OrderItem[]): StockStatus[] => {
            if (!items) { return []; }

            return items.filter(item => !stockDone(item))
                .reduce<StockStatus[]>(
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
    private _renderDispatch() {
        const {
            props: {
                warehouseCtx,
                authCtx,
                order
            },
            state: {
                stock
            }
        } = this;

        const onSelect: (
            dispatch: Dispatch,
            stock: StockStatus[]
        ) => void = (d, s) => {
            this.setState(() => ({ dispatch: d, stock: s }), this._applyUpdates);
        };

        return (
            <React.Fragment>
                <Grid item={true} xs={12}>
                    <Typography variant="h6" align="center">Dispatch</Typography>
                </Grid>
                <Grid item={true} xs={3}>
                    <OrderCheckoutPickup {...{ warehouseCtx, authCtx, order, stock, onSelect }} />
                </Grid>
                <Grid item={true} xs={3}>
                    <OrderCheckoutShipping {...{ warehouseCtx, authCtx, order, stock, onSelect }} />
                </Grid>
            </React.Fragment>);
    }

    private _applyDispatch(items: OrderItem[], stocks: StockStatus[]): OrderItem[] {
        return items.map(item => {
            const stock = stocks.find(s => s.item.UID === item.UID);
            const { Items, DispatchInfos } = item;

            return {
                ...item,
                Items: Items && this._applyDispatch(item.Items, stocks),
                DispatchInfos: stock && {
                    ...DispatchInfos,
                    Warehouse: stock.warehouseId || '',
                    Quantity: (DispatchInfos && DispatchInfos.Quantity || 0) + (stock.quantity || 0),
                    Date: new Date().toISOString()
                }
            } as OrderItem;
        });
    }
    private _applyUpdates() {
        const {
            props: { order: { Dispatches, Items }, save, close },
            state: { dispatch, stock }
        } = this;
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
        return StockUnits.Use(uses).then(() => save(changes)).then(close);
    }
}

export default withStyles((theme: OurTheme): StyleRules<injectedClasses> => ({
    ...PayBtnStyles(theme, createPalette({ primary: { main: '#9c27b0', contrastText: '#ffffff' } })),
    paperCls: {
        width: '500px',
        margin: '20px auto 0 auto'
    },
    paperInnerCLs: {
        padding: '10px'
    },
    detailGridColumnInner: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        height: '100%'
    }

}))(OrderCheckout);