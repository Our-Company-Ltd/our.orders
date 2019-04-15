import * as React from 'react';
import {
  AuthProvider,
  ShopProviderStandalone,
  SettingsProviderStandalone,
  UsersProviderStandalone,
  WarehouseProviderStandalone
} from './_context';
import { SnackbarProvider } from 'notistack';
import './App.css';

import ThemeProvider from './components/ThemeProvider/ThemeProvider';

import ThemeStylesImporter from './_helpers/ThemeStylesImporter';

import HashRouter from './components/HashRouter/HashRouter';
import { CategoryProviderStandalone } from './_context/Category';
import { ProductProviderStandalone } from './_context/Product';
import { TemplatesProviderStandalone } from './_context/Templates';
import LocaleProvider from './_context/Locale';
import { PaymentNotificationsProviderStandalone } from './_context/PaymentNotification';

class App extends React.Component {

  componentWillMount() {
    document.body.classList.remove('loading');
  }
  render() {
    return (

      <LocaleProvider default="en">
        <ThemeProvider path="/theme/orders.json">
            <AuthProvider>
              <PaymentNotificationsProviderStandalone>
                <SnackbarProvider maxSnack={3}>
                  <ProductProviderStandalone>
                    <TemplatesProviderStandalone>
                      <CategoryProviderStandalone>
                        <UsersProviderStandalone>
                          <ShopProviderStandalone>
                            <WarehouseProviderStandalone>
                              <SettingsProviderStandalone>
                                <div className="app">
                                  <HashRouter />
                                  <ThemeStylesImporter />
                                </div>
                              </SettingsProviderStandalone>
                            </WarehouseProviderStandalone>
                          </ShopProviderStandalone>
                        </UsersProviderStandalone>
                      </CategoryProviderStandalone>
                    </TemplatesProviderStandalone>
                  </ProductProviderStandalone>
                </SnackbarProvider>
              </PaymentNotificationsProviderStandalone>
            </AuthProvider>
        </ThemeProvider>
      </LocaleProvider>

    );
  }
  // <ThemeSwitchContainer />
  // <LangSwitchContainer />
  // <Notifier />
}

export default App;
