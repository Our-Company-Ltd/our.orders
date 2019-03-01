import * as React from 'react';

import {
    StripeProvider,
    Elements,
    CardNumberElement,
    CardExpiryElement,
    CardCVCElement,
    PostalCodeElement,
    ReactStripeElements
} from 'react-stripe-elements';
import { GetStripeApiKey } from './Services';
import loadjs from 'loadjs';
import {
    Button, Dialog, DialogTitle, DialogContent, DialogActions, ButtonBase, WithStyles, withStyles
} from '@material-ui/core';
import { Payment, Cached } from '@material-ui/icons';
import { Order } from 'src/@types/our-orders';
import { FormEvent } from 'react';

import { ChargeStripe } from './Services';
import PayBtnStyles, { PayBtnClasses } from '../../OrderCheckoutBtnStyles';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import createPalette from '@material-ui/core/styles/createPalette';

export let ApiKey: string = '';

export type StripeButtonProps = ReactStripeElements.InjectedStripeProps & WithStyles<PayBtnClasses> & {
    order: Order;
    onChange: (changes: Partial<Order>) => void;
};

type State = {
    // loaded?: boolean;
    // scriptLoaded?: boolean;
    apiKey?: string;
    scriptLoaded?: boolean;
    // error?: boolean;
    // open: boolean;
    loadingResult?: boolean;
    loadingScript?: boolean;
    loadingSettings?: boolean;
    error?: boolean;
    open: boolean;
};

let dependencyRequested = false;
class StripeButton extends React.Component<StripeButtonProps, State> {
    constructor(props: StripeButtonProps) {
        super(props);
        this._onClick = this._onClick.bind(this);
        this._handleOpen = this._handleOpen.bind(this);
        this._handleClose = this._handleClose.bind(this);
        this._renderDialog = this._renderDialog.bind(this);

        this.state = {
            // apiKey: ApiKey,
            // loaded: !!ApiKey,
            open: false
            // loading: false
        };
    }

    render() {
        const { loadingScript, loadingSettings } = this.state;
        const { classes } = this.props;
        if (loadingSettings || loadingScript) {
            return (
                <ButtonBase
                    disabled={true}
                    classes={{ root: classes.buttonBase }}
                >
                    <Cached className={classes.btnIcon} />
                    <span className={classes.btnText}>
                        loading
                    </span>
                </ButtonBase>);
        }

        // load the preferences 
        return (
            <React.Fragment>
                <ButtonBase
                    focusRipple={true}
                    onClick={this._onClick}
                    classes={{ root: classes.buttonBase }}
                >
                    <Payment className={classes.btnIcon} />
                    <span className={classes.btnText}>
                        Credit card
                </span>
                </ButtonBase>
                {this._renderDialog()}
            </React.Fragment >);
    }

    private _onClick() {
        const { scriptLoaded, apiKey } = this.state;
        if (scriptLoaded && apiKey) {
            this.setState(() => ({ open: true }));
            return;
        }

        const onload = () => {
            dependencyRequested = true;
            this.setState((prev) => ({ 
                loadingScript: false, 
                scriptLoaded: true,
                open: !prev.loadingSettings
             }));
        };

        if (dependencyRequested) {
            onload();
        } else {
            this.setState(
                () => ({
                    loadingScript: true
                }),
                () => {
                    loadjs('https://js.stripe.com/v3/', {
                        success: () => {
                            onload();
                        },
                        before: () => {
                            return true;
                        }
                    });
                });

        }

        GetStripeApiKey().then(value => {
            if (!value) {
                this.setState(() => ({
                    error: true
                }));
                return;
            }
            ApiKey = value;
            this.setState((prev) => ({
                loadingSettings: false,
                apiKey: value,
                open: !prev.loadingSettings
            }));
        });

        this.setState(() => ({
            loadingSettings: true,
            loadingScript: !dependencyRequested
        }));
    }
    private _handleOpen() {
        this.setState({ open: true });
    }

    private _handleClose() {
        this.setState({ open: false });
    }
    private _renderDialog() {

        const createOptions = (fontSize: string) => {
            return {
                style: {
                    base: {
                        fontSize,
                        color: '#424770',
                        letterSpacing: '0.025em',
                        fontFamily: 'Source Code Pro, monospace',
                        '::placeholder': {
                            color: '#aab7c4',
                        },
                    },
                    invalid: {
                        color: '#9e2146',
                    },
                },
            };
        };

        const fontsize = '1rem';
        const apiKey = this.state.apiKey as string;
        const { open, loadingResult } = this.state;

        return (
            <Dialog
                open={open}
                onClose={this._handleClose}
            >
                <DialogTitle>Credit card payment</DialogTitle>
                <DialogContent>
                    <StripeProvider apiKey={apiKey}>
                        <Elements>
                            <form
                                onSubmit={(e: React.FormEvent<HTMLFormElement>) => this._handleSubmit(e)}
                                className="stripe"
                            >
                                <label>
                                    Card number
                                    <CardNumberElement {...createOptions(fontsize)} />
                                </label>
                                <label>
                                    Expiration date
                                    <CardExpiryElement {...createOptions(fontsize)} />
                                </label>
                                <label>
                                    CVC
                                    <CardCVCElement {...createOptions(fontsize)} />
                                </label>
                                <label>
                                    Postal code
                                    <PostalCodeElement {...createOptions(fontsize)} />
                                </label>
                            </form>
                        </Elements>
                    </StripeProvider>
                </DialogContent>
                <DialogActions>
                    {!!loadingResult ?
                        'loading result...' :
                        (
                            <React.Fragment>
                                <Button
                                    variant="contained"
                                    color="default"
                                    onClick={this._handleClose}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" variant="contained" color="primary">Confirm order</Button>
                            </React.Fragment>
                        )
                    }
                </DialogActions>
            </Dialog >);
    }
    private _handleSubmit(e: FormEvent<HTMLFormElement>) {
        // We don't want to let default form submission happen here, which would refresh the page.
        e.preventDefault();

        // Within the context of `Elements`, this call to createToken knows which Element to
        // tokenize, since there's only one in this group.
        const stripe = this.props.stripe;
        if (!stripe) { return; }
        this.setState(prev => ({ loadingResult: true }));
        stripe.createToken({}).then(({ token, error }) => {
            const t = token;
            if (!t || error) {
                this.setState(prev => ({ loadingResult: false }));
                return;
            }
            ChargeStripe(this.props.order, t).then(payment => {
                this._handleClose();
                this.props.onChange({ Payments: [...this.props.order.Payments, payment] });
            });
        });

        // However, this line of code will do the same thing:
        // this.props.stripe.createToken({type: 'card', name: 'Jenny Rosen'});
    }
}

// <div className="pay__btn-icon">
// {getIcon(
//     {
//         className: 'material-icons',
//         inner: 'cached',
//         tag: 'i'
//     },
//     false,
//     'loading',
//     'icon-loading')}
// </div>

// <div className="pay__btn-icon">
// {getIcon(
//     {
//         className: 'fab fa-stripe',
//         inner: '',
//         tag: 'i'
//     },
//     false,
//     'stripe')}
// </div>

export default withStyles((theme: OurTheme) =>
    PayBtnStyles(theme, createPalette({ primary: { main: '#00afe1', contrastText: '#ffffff' } })))(StripeButton);