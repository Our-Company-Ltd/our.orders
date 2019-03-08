type PaypalClient = {
    sandbox: string;
    production: string;
};


type PaypalButtonStyle = {
    color?: 'gold' | 'blue' | 'silver' | 'black';
    shape?: 'pill' | 'rect';
    size?: 'small' | 'medium' | 'large' | 'responsive';
    label?: 'checkout' | 'credit' | 'pay' | 'buynow' | 'paypal';
    layout?: 'horizontal' | 'vertical';
};

type PaypalActions = {
    payment: { create: (props: any) => any; execute: () => Promise<any> };

};
type PaypalData = { paymentID: string; payerID:string };

type PaypalReactButtonProps = {
    client: PaypalClient;
    payment: (data: PaypalData, actions: PaypalActions) => any;
    commit: boolean;
    env?: 'production' | 'sandbox';
    locale?: string;
    style?: PaypalButtonStyle;
    onAuthorize: (data: PaypalData, actions: PaypalActions) => any;
    onCancel?: (data: PaypalData) => void;
};

type PaypalReactButton = React.ComponentClass<PaypalReactButtonProps>;
type PaypalPromiseCallback = (resolve: (paymentId: string) => void, reject: (err: any) => void) => void;
interface PayPayPromise {
    constructor(callback: PaypalPromiseCallback): PayPayPromise;
}

interface IPaypalInstance {
    Button: {
        driver: (frameworkid: 'react', framwork: { React: any; ReactDOM: any }) => any;
    }
    Promise: any;
}
declare const paypal: IPaypalInstance;