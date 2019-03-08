import * as React from 'react';
import { Settings } from '../_services';
import { withAuth, InjectedAuthProps } from '.';
import { Setting } from 'src/@types/our-orders';
import { Subtract } from 'utility-types';

export type SettingsContext = {
    Settings: Setting;
    refresh: () => void;
    update: (changes: Partial<Setting>) => Promise<Setting>;
};

export type InjectedSettingsProps = { settingsCtx: SettingsContext };

const ReactSettingsContext = React.createContext<SettingsContext>({
    Settings: {
        Path: '',
        Currencies: [],
        PaymentProviders: [],
        HidePaymentProviders: [],
        NewsletterProviders: [],
        TransferMessage: '',
        ShowTaxRateExcluded: true,
        ShowTaxRateIncluded: true,
        ShowWeight: false,
    },
    refresh: () => ({}),
    update: () => ({}) as never
});
type SettingsProviderProps = InjectedAuthProps & {};
export class SettingsProvider extends React.Component<SettingsProviderProps, SettingsContext> {
    static Consumer: React.SFC<{ children: (context: SettingsContext) => React.ReactNode }> = (props) => {
        return <ReactSettingsContext.Consumer>{props.children}</ReactSettingsContext.Consumer>;
    }

    constructor(props: SettingsProviderProps) {
        super(props);
        this.state = {
            Settings: {
                Path: '',
                Currencies: [],
                PaymentProviders: [],
                TransferMessage: '',
                HidePaymentProviders: [],
                NewsletterProviders: [],
                ShowTaxRateExcluded: true,
                ShowTaxRateIncluded: true,
                ShowWeight: false
            },
            refresh: this._refresh.bind(this),
            update: this._update.bind(this)
        };
    }

    componentDidUpdate(prevProps: SettingsProviderProps) {

        const { authCtx: { user } } = this.props;
        const { authCtx: { user: prevUser } } = prevProps;
        const id = user && user.Id;
        const prevId = prevUser && prevUser.Id;
        if (id !== prevId) {
            this._refresh();
        }
    }

    componentDidMount() {
        this._refresh();
    }
    render() {
        return (
            <ReactSettingsContext.Provider value={this.state}>
                {this.props.children}
            </ReactSettingsContext.Provider>
        );
    }

    private _refresh() {
        Settings.Get().then(result => this.setState(prev => ({ Settings: result })));
    }
    private _update(changes: Partial<Setting>) {
        return Settings
            .Patch(changes)
            .then(result => {
                this.setState(prev => ({ Settings: result }));
                return result;
            });
    }

}
export const withSettings =
    <OriginalProps extends InjectedSettingsProps>(
        Component: React.ComponentType<OriginalProps>
    ): React.FunctionComponent<Subtract<OriginalProps, InjectedSettingsProps>> => {

        return (props: Subtract<OriginalProps, InjectedSettingsProps>) => {
            return (
                <ReactSettingsContext.Consumer>
                    {(settingsCtx) => <Component {...{ ...(props as object), settingsCtx } as OriginalProps} />}
                </ReactSettingsContext.Consumer>
            );
        };

    };
export const SettingsProviderStandalone = withAuth(SettingsProvider);
export default SettingsProvider;