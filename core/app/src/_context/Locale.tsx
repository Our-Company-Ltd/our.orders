import * as React from 'react';
import { Subtract } from 'utility-types';
import { IntlProvider, addLocaleData } from 'react-intl';
import Countries from 'i18n-iso-countries';
export type LocaleContext = {
    locale?: string,
    loading: boolean,
    messages?: { [id: string]: string };
    set: (locale: string) => void;
};
export type InjectedLocaleProps = { localeCtx: LocaleContext };

const ReactLocaleContext = React.createContext<LocaleContext>({
    loading: false,
    set: () => null as never
});
export type LocaleProviderProps = {
    default: string;
};
export class LocaleProvider extends React.Component<LocaleProviderProps, LocaleContext> {
    static Consumer: React.SFC<{ children: (context: LocaleContext) => React.ReactNode }> = (props) => {
        return <ReactLocaleContext.Consumer>{props.children}</ReactLocaleContext.Consumer>;
    }

    constructor(props: LocaleProviderProps) {
        super(props);
        this.state = {
            loading: false,
            set: this._set.bind(this)
        };
    }

    componentDidMount() {
        const { default: defaultLocale } = this.props;
        this._set(defaultLocale);
    }
    render() {
        const { locale, messages } = this.state;
        return (
            <ReactLocaleContext.Provider value={this.state} >
                <IntlProvider locale={locale || 'en'} messages={messages} key={locale} >
                    {this.props.children}
                </IntlProvider>
            </ReactLocaleContext.Provider>
        );
    }

    private _set(locale: string) {

        import(/* webpackMode: "lazy" */ `react-intl/locale-data/${locale}`)
            .then(localeData => addLocaleData(localeData.default));

        const loadLocale = fetch(`locales/${locale}.json`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Network response was not ok.');
                }
            })
            .then((messages: { [id: string]: string }) => {

                this.setState(() => ({

                    locale,
                    messages
                }));
            })
            .catch(reason => {
                // tslint:disable-next-line:no-console
                console.log(`locale ${locale} not loaded: (${reason})`);
                this.setState(() => ({
                    loading: false
                }));
            });
        const loadCountries =
            import(/* webpackMode: "lazy" */ `i18n-iso-countries/langs/${locale}`)
            .then(response => {
                if (response) {
                    return response;
                } else {
                    throw new Error('Network response was not ok.');
                }
            })
            .then((countries) => {
                Countries.registerLocale(countries);
                this.setState(() => ({
                    locale
                }));
            })
            .catch(reason => {
                // tslint:disable-next-line:no-console
                console.log(`countries in ${locale} not loaded: (${reason})`);
            });
        this.setState(
            () => ({
                loading: true
            }),
            () => {
                Promise.all([loadLocale, loadCountries])
                    .then(() =>
                        this.setState(() => ({
                            loading: false
                        })))
                    .catch((reason) => {
                        // tslint:disable-next-line:no-console
                        console.log(`${locale} not loaded: (${reason})`);
                        this.setState(() => ({
                            loading: false
                        }));
                    });
            });
    }

}

export const withLocale =
    <P extends InjectedLocaleProps>(
        Component: React.ComponentType<P>
    ) => {
        return (props: Subtract<P, InjectedLocaleProps>) => {
            return (
                <ReactLocaleContext.Consumer>
                    {(ctx) => <Component {...{ ...(props as object), localeCtx: ctx } as P} />}
                </ReactLocaleContext.Consumer>
            );
        };
    };
export default LocaleProvider;