import * as React from 'react';
import { DocumentTemplates, PaymentNotifications } from '../_services';
import { InjectedAuthProps, withAuth } from '.';
import { Subtract } from 'utility-types';
import { PaymentNotificationTemplate } from 'src/@types/our-orders/PaymentNotificationTemplate';

export type PaymentNotificationContext = {
    notifications: PaymentNotificationTemplate[];
    update: () => void;
    delete: (id: string) => Promise<string>;
    patch: (id: string, changes: Partial<PaymentNotificationTemplate>) => Promise<PaymentNotificationTemplate>;
    create: (changes: Partial<PaymentNotificationTemplate>) => Promise<PaymentNotificationTemplate>;
};
export type InjectedPaymentNotificationTemplateProps = { paymentNotificationsCtx: PaymentNotificationContext };

const ReactPaymentNotificationContext = React.createContext<PaymentNotificationContext>({
    notifications: [],
    update: () => null as never,
    delete: (id: string) => null as never,
    patch: (id: string, changes: Partial<PaymentNotificationTemplate>) => null as never,
    create: (changes: Partial<PaymentNotificationTemplate>) => null as never
});
export type PaymentNotificationProviderProps = InjectedAuthProps & {

};
export class PaymentNotificationsProvider extends
    React.Component<PaymentNotificationProviderProps, PaymentNotificationContext> {

    static Consumer: React.SFC<{ children: (context: PaymentNotificationContext) => React.ReactNode }> = (props) => {
        return <ReactPaymentNotificationContext.Consumer>{props.children}</ReactPaymentNotificationContext.Consumer>;
    }

    constructor(props: PaymentNotificationProviderProps) {
        super(props);

        this.state = {
            notifications: [],
            update: this._update.bind(this),
            delete: this._delete.bind(this),
            patch: this._patch.bind(this),
            create: this._create.bind(this),
        };
    }

    componentDidMount() {
        this._update();
    }

    componentDidUpdate(prevProps: PaymentNotificationProviderProps) {

        const { authCtx: { user } } = this.props;
        const { authCtx: { user: prevUser } } = prevProps;
        const id = user && user.Id;
        const prevId = prevUser && prevUser.Id;
        if (id !== prevId) {
            this._update();
        }
    }
    render() {
        return (
            <ReactPaymentNotificationContext.Provider value={this.state}>
                {this.props.children}
            </ReactPaymentNotificationContext.Provider>
        );
    }

    private _setTemplates(notifications: PaymentNotificationTemplate[]) {
        this.setState(() => ({ notifications }));
    }

    private _update() {
        PaymentNotifications.Find({}, 0, 1000).then(result => this._setTemplates(result.Values));
    }

    private _patch(id: string, changes: Partial<PaymentNotificationTemplate>) {
        return PaymentNotifications
            .Patch(id, changes)
            .then((model) => {
                return new Promise(resolve => this.setState(
                    (prev) => ({ notifications: prev.notifications.map(t => t.Id === model.Id ? model : t) }),
                    () => resolve(model)
                ));
            });
    }
    private _delete(id: string) {
        return DocumentTemplates
            .Delete(id)
            .then(() => {
                return new Promise(resolve => this.setState(
                    (prev) => ({ notifications: prev.notifications.filter(t => t.Id !== id) }),
                    () => resolve(id)
                ));
            });
    }
    private _create(changes: Partial<PaymentNotificationTemplate>) {
        return PaymentNotifications
            .Create(changes)
            .then((model) => {
                return new Promise(resolve => this.setState(
                    (prev) => ({ notifications: [...prev.notifications, model] }),
                    () => resolve(model)
                ));
            });
    }
}

export const withPaymentNotifications =
    <OriginalProps extends InjectedPaymentNotificationTemplateProps>(
        Component: React.ComponentType<OriginalProps>
    ): React.FunctionComponent<Subtract<OriginalProps, InjectedPaymentNotificationTemplateProps>> => {

        return (props: Subtract<OriginalProps, InjectedPaymentNotificationTemplateProps>) => {
            return (
                <ReactPaymentNotificationContext.Consumer>
                    {(notifications) => <Component
                        {...{ ...(props as object), paymentNotificationsCtx: notifications } as OriginalProps}
                    />}
                </ReactPaymentNotificationContext.Consumer>
            );
        };

    };
export const PaymentNotificationsProviderStandalone = withAuth(PaymentNotificationsProvider);
export default PaymentNotificationsProvider;