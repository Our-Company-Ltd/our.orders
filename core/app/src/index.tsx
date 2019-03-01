import * as React from 'react';
import * as ReactDOM from 'react-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import '../node_modules/reset-css/reset.css';
import './index.css';
import './fonts.css';

// import { IntlProvider, addLocaleData } from 'react-intl';

// const supportedLanguages = ['de', 'en', 'pt', 'fr'];

// Define user's language. Different browsers have the user locale defined
// on different fields on the `navigator` object, so we make sure to account
// for these different by checking all of them
// const language = (navigator.languages && navigator.languages[0]) ||
//   navigator.language;
// || navigator.userLanguage;

// const languageWithoutRegionCode = language.toLowerCase().split(/[_-]+/)[0];

// addLocaleData([...en, ...pt, ...fr, ...de]);

// import * as en from 'react-intl/locale-data/en';
// import * as fr from 'react-intl/locale-data/fr';
// import * as de from 'react-intl/locale-data/de';
// import * as pt from 'react-intl/locale-data/de';
// import { ConnectedIntlProvider } from './_containers';

// // // Our translated strings
// // import * as messagesFR from './i18n/locales/fr.json';

// const localeData = {
//   en: en,
//   fr: fr,
//   pt: pt,
//   de: de
// };

// const messages = localeData[languageWithoutRegionCode] || localeData[language] || localeData.en;

// const messagesFR = require('react-intl/locale-data/fr');
// addLocaleData(fr);

// Split locales with a region code

// Try full locale, try locale without region code, fallback to 'en'

ReactDOM.render(
  <App />,
  document.getElementById('root') as HTMLElement
);
registerServiceWorker();
