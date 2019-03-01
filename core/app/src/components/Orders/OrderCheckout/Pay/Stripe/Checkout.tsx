// CheckoutForm.js
import * as React from 'react';

import {
    injectStripe,
    ReactStripeElements,
    CardNumberElement,
    CardExpiryElement,
    CardCVCElement,
    PostalCodeElement
} from 'react-stripe-elements';
import { FormEvent } from 'react';
import { ChargeStripe } from './Services';
import { Order } from 'src/@types/our-orders';
import { Button } from '@material-ui/core';

export interface Props extends ReactStripeElements.InjectedStripeProps {
    order: Order;
    onRequestClose: () => void;
    onChange: (changes: Partial<Order>) => void;
}
interface State {
    loading?: boolean;
}

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

class Checkout extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {};
    }
    render() {
        const fontsize = '1rem';
        return (
            <form onSubmit={(e: FormEvent<HTMLFormElement>) => this._handleSubmit(e)} className="stripe">
                <label>
                    Card number
                    <CardNumberElement
                        {...createOptions(fontsize)}
                    />
                </label>
                <label>
                    Expiration date
                    <CardExpiryElement

                        {...createOptions(fontsize)}
                    />
                </label>
                <label>
                    CVC
                    <CardCVCElement

                        {...createOptions(fontsize)}
                    />
                </label>
                <label>
                    Postal code
                    <PostalCodeElement

                        {...createOptions(fontsize)}
                    />
                </label>
                
                {!this.state.loading &&
                    <Button type="submit">Confirm order</Button>
                }
                {this.state.loading && 'loading result...'}

            </form>
        );
    }

    private _handleSubmit(e: FormEvent<HTMLFormElement>) {
        // We don't want to let default form submission happen here, which would refresh the page.
        e.preventDefault();

        // Within the context of `Elements`, this call to createToken knows which Element to
        // tokenize, since there's only one in this group.
        const stripe = this.props.stripe;
        if (!stripe) { return; }
        this.setState(prev => ({ loading: true }));
        stripe.createToken({}).then(({ token, error }) => {
            const t = token;
            if (!t || error) {
                this.setState(prev => ({ loading: false }));
                return;
            }
            ChargeStripe(this.props.order, t).then(payment => {
                this.props.onRequestClose();
                this.props.onChange({ Payments: [...this.props.order.Payments, payment] });
            });
        });

        // However, this line of code will do the same thing:
        // this.props.stripe.createToken({type: 'card', name: 'Jenny Rosen'});
    }
}

export const StripeCheckout = injectStripe(Checkout);
