import * as React from 'react';
import loadjs from 'loadjs';

import { Order } from 'src/@types/our-orders';
import * as ReactDOM from 'react-dom';
import { GetPaypalClient, ChargePaypalPayment, PaypalSettings } from './PayPalServices';
import {
    withStyles, WithStyles, ButtonBase, Dialog, DialogContent, DialogTitle, DialogActions, Button
} from '@material-ui/core';
import PayBtnStyles, { PayBtnClasses } from '../../OrderCheckoutBtnStyles';
import createPalette from '@material-ui/core/styles/createPalette';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { Cached } from '@material-ui/icons';
import PayPalIcon from './PayPalIcon';

export type PayPalButtonProps = WithStyles<PayBtnClasses> & {
    order: Order;
    onChange: (changes: Partial<Order>) => void;
};

type State = {
    payPalBtn?: PaypalReactButton;
    settings?: PaypalSettings;
    loadingPaypal?: boolean;
    loadingSettings?: boolean;
    error?: boolean;
    open: boolean;
};
let dependencyRequested = false;

class PayPalButton extends React.Component<PayPalButtonProps, State> {
    constructor(props: PayPalButtonProps) {
        super(props);
        this._onClick = this._onClick.bind(this);
        this.state = { open: false };
    }
    render() {
        const { loadingPaypal, loadingSettings } = this.state;
        const { classes } = this.props;
        if (loadingSettings || loadingPaypal) {
            return (
                <ButtonBase
                    disabled={true}
                    classes={{ root: classes.buttonBase }}
                >
                    <Cached className={classes.btnIcon} />
                    <span className={classes.btnText}>
                        loading
                    </span>
                </ButtonBase>
            );
        }

        // const toggle = () => this.setState((prev) => ({ open: !prev.open }));
        return (
            <React.Fragment>
                <ButtonBase
                    focusRipple={true}
                    onClick={this._onClick}
                    classes={{ root: classes.buttonBase }}
                >
                    <PayPalIcon className={classes.btnIcon} />
                    <span className={classes.btnText}>
                        PayPal
                    </span>
                </ButtonBase>
                {this._renderLightbox()}
            </React.Fragment>);
    }
    private _onClick() {
        const { loadingPaypal, loadingSettings } = this.state;
        const { settings, payPalBtn } = this.state;
        if (settings && payPalBtn) { this.setState(() => ({ open: true })); }
        if (loadingPaypal || loadingSettings) { return; }

        const onload = () => {
            const component = paypal.Button.driver('react', { React: React, ReactDOM: ReactDOM });
            dependencyRequested = true;
            this.setState((prev) => ({
                payPalBtn: component,
                loadingPaypal: false,
                open: !!prev.settings
            }));
        };

        if (!dependencyRequested) {
            loadjs('https://www.paypalobjects.com/api/checkout.js', {
                success: onload,
                before: (path, tag) => {
                    tag.setAttribute('data-version-4', '');
                    return true;
                }
            });
        } else {
            onload();
        }
        GetPaypalClient().then(value => {
            if (!value) {
                this.setState(() => ({
                    error: true,
                    loadingSettings: false
                }));
                return;
            }
            this.setState((prev) => ({
                error: false,
                loadingSettings: false,
                settings: value,
                open: !!prev.payPalBtn
            }));
        });

        this.setState(() => ({
            loadingSettings: true,
            loadingPaypal: !dependencyRequested
        }));

    }
    private _renderLightbox() {
        const { open } = this.state;
        const close = () => this.setState(() => ({ open: false }));
        return (
            <Dialog
                open={open}
                onClose={close}
            >
                <DialogTitle>Pay with Paypal</DialogTitle>
                <DialogContent>
                    {this._renderPaypalBtn()}
                </DialogContent>
                <DialogActions>
                    <Button variant="contained" color="default" onClick={close}>Cancel</Button>
                </DialogActions>
            </Dialog>);
    }
    private _renderPaypalBtn() {

        const Btn = this.state.payPalBtn;
        if (!Btn) { return; }
        const settings = this.state.settings;
        if (!settings) { return; }

        const payment = (data: PaypalData, actions: PaypalActions) => {
            // tslint:disable-next-line:no-console
            console.log('create');
            return actions.payment.create({
                transactions: [
                    {
                        amount: { total: this.props.order.Total, currency: this.props.order.Currency || 'EUR' }
                    }
                ]
            });
            // return new paypal.Promise((resolve: (paymentID: string) => void, reject: (reason: string) => void) => {

            //     // Make an ajax call to get the Payment ID. This should call your back-end,
            //     // which should invoke the PayPal Payment Create api to retrieve the Payment ID.

            //     // When you have a Payment ID, you need to call the `resolve` method, e.g `resolve(data.paymentID)`
            //     // Or, if you have an error from your server side, you need to call `reject`, e.g. `reject(err)`
            //     CreatePaypalPayment(this.props.order, this.props.order.Total, this.props.order.Currency || 'EUR')
            //         .then(result => resolve(result.paymentID))
            //         .catch(err => reject(err));
            // });
        };

        const onAuth = (data: PaypalData, actions: PaypalActions) => actions.payment.execute().then(() => {
            ChargePaypalPayment(this.props.order, data)
                .then(payments => {
                    // this.props.onRequestClose();
                    this.setState(() => ({ open: false }));
                    this.props.onChange({ Payments: [...this.props.order.Payments, ...payments] });
                });
        });
        // const onCancel = (data: PaypalData) => {
        //     // tslint:disable-next-line:no-console
        //     console.log('The payment was cancelled!');
        // };

        return (
            <Btn
                env={settings.Environment}
                style={{ shape: 'rect', size: 'large', color: 'blue' }}
                commit={true}
                client={{ sandbox: settings.sandbox, production: settings.production }}
                payment={payment}
                onAuthorize={onAuth}
            />);
    }
}

export default withStyles((theme: OurTheme) =>
    PayBtnStyles(theme, createPalette({ primary: { main: '#003087', contrastText: '#ffffff' } })))(PayPalButton);