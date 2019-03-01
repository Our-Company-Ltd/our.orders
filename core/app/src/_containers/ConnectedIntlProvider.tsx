import { connect } from 'react-redux';
import { IntlProvider, addLocaleData } from 'react-intl';

// get the French locale information from the browser
import * as fr from 'react-intl/locale-data/fr';
import * as en from 'react-intl/locale-data/en';
import * as de from 'react-intl/locale-data/de';
import * as pt from 'react-intl/locale-data/pt';
import * as countriesEn from 'i18n-iso-countries/langs/en';
import * as countriesDe from 'i18n-iso-countries/langs/de';

import * as React from 'react';
import { State } from '../_store';
import Countries from 'i18n-iso-countries';

addLocaleData([...en, ...de, ...fr, ...pt]);

class IntlProviderWrapper extends React.Component<IntlProvider.Props> {

    constructor(props: IntlProvider.Props) {
        super(props);
    }
    componentDidMount() {
        this._updateCountries();
    }

    componentDidUpdate(prevProps: IntlProvider.Props) {
        if (prevProps.locale !== this.props.locale) {
            this._updateCountries();
        }
    }
    render() {
        return (
            <React.Fragment>
                <IntlProvider locale={this.props.locale} messages={this.props.messages} key={this.props.locale} >
                    {this.props.children}
                </IntlProvider>
            </React.Fragment>);
    }
    private _updateCountries() {
        switch (this.props.locale) {
            case 'de':
                Countries.registerLocale(countriesDe);
                return;
            default:
                Countries.registerLocale(countriesEn);
                return;

        }
    }
}

// This function will map the current redux state to the props for the component that it is "connected" to.
// When the state of the redux store changes, this function will be called, if the props that come out of
// this function are different, then the component that is wrapped is re-rendered.
function mapStateToProps({ localeState }: State): Partial<IntlProvider.Props> {
    const { lang, messages } = localeState;
    return { locale: lang, messages };
}

export default connect(mapStateToProps)(IntlProviderWrapper);