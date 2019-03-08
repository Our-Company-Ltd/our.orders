import * as React from 'react';

import {
    injectIntl,
    InjectedIntlProps,
    defineMessages
} from 'react-intl';

import ContentView, { Itab } from '../../components/ContentView';

import {
    withAuth,
    InjectedAuthProps,
    withSettings,
    withWarehouse,
    withShop,
    InjectedSettingsProps,
    InjectedWarehouseProps,
    InjectedShopProps,
    InjectedUsersProps,
    withUsers
} from 'src/_context';

import Settings from 'src/components/Settings/Settings';
import ClientList from 'src/components/Clients/ClientList/ClientList';
import ProductPage from 'src/components/Products/ProductPage/ProductPage';
import OrdersList from 'src/components/Orders/OrderList/OrderList';
import { withCategory, InjectedCategoryProps } from 'src/_context/Category';
import { InjectedProductProps, withProduct } from 'src/_context/Product';
import {
    ShoppingCart,
    FolderShared,
    CardGiftcard,
    Dashboard as DashboardIcon,
    Store,
    Layers,
    Settings as SettingsIcon
} from '@material-ui/icons';
import VoucherList from 'src/components/Vouchers/VoucherList/VoucherList';
import { InjectedTemplatesProps, withTemplates } from 'src/_context/Templates';
import MovementsList from 'src/components/Movements/MovementsList/MovementsList';
import Dashboard from 'src/components/Dashboard/Dashboard';
import { IsAdminOrInRole } from 'src/_helpers/roles';

export const HomePageMessages = defineMessages({
    dashboard: {
        id: 'pages.home.dashboard',
        defaultMessage: 'Dashboard',
        description: 'Page home Dashboard tab'
    },
    orders: {
        id: 'pages.home.orders',
        defaultMessage: 'Orders',
        description: 'Page home Orders tab'
    },
    shop: {
        id: 'pages.home.shop',
        defaultMessage: 'shops',
        description: 'Page home shops tab'
    },
    deliveries: {
        id: 'pages.home.deliveries',
        defaultMessage: 'Deliveries',
        description: 'Page home Deliveries tab'
    },
    clients: {
        id: 'pages.home.clients',
        defaultMessage: 'Clients',
        description: 'home page Clients tab'
    },
    products: {
        id: 'pages.home.products',
        defaultMessage: 'Products',
        description: 'Page home Vouchproductsers tab'
    },
    specials: {
        id: 'pages.home.specials',
        defaultMessage: 'Specials',
        description: 'Page home specials tab'
    },
    settings: {
        id: 'pages.home.settings',
        defaultMessage: 'Settings',
        description: 'Page home Settings tab'
    },
    vouchers: {
        id: 'pages.home.vouchers',
        defaultMessage: 'Vouchers',
        description: 'Page home vouchers tab'
    }
});

export type HomePageProps = {} &
    InjectedCategoryProps &
    InjectedSettingsProps &
    InjectedWarehouseProps &
    InjectedProductProps &
    InjectedAuthProps &
    InjectedShopProps &
    InjectedIntlProps &
    InjectedUsersProps &
    InjectedTemplatesProps;

export class HomePage extends React.Component<HomePageProps> {
    render() {
        const {
            intl, templateCtx, usersCtx, authCtx: { user },
            settingsCtx, warehouseCtx, authCtx, shopCtx, categoryCtx, productCtx
        } = this.props;
        var tabs = [
            IsAdminOrInRole(user, 'VIEW_DASHBOARD') && {
                Key: 'dashboard',
                Title: this.props.intl.formatMessage(HomePageMessages.dashboard),
                Icon: <DashboardIcon />,
                View: (
                    <Dashboard
                        {...{
                            intl,
                            usersCtx,
                            authCtx,
                            settingsCtx,
                            warehouseCtx,
                            categoryCtx,
                            shopCtx,
                            productCtx
                        }}
                    />)
            },
            IsAdminOrInRole(user, 'LIST_ORDERS', 'CRUD_ALL_ORDERS', 'CRUD_OWN_ORDERS') && {
                Key: 'orders',
                Title: intl.formatMessage(HomePageMessages.orders),
                Icon: <ShoppingCart />,
                View: (
                    <OrdersList
                        {...{
                            intl, templateCtx,
                            settingsCtx,
                            warehouseCtx,
                            authCtx,
                            usersCtx,
                            shopCtx,
                            categoryCtx,
                            productCtx
                        }}
                    />)
            },
            {
                Key: 'clients',
                Title: intl.formatMessage(HomePageMessages.clients),
                Icon: <FolderShared />,
                View: (
                    <ClientList
                        {...{
                            intl,
                            settingsCtx,
                            usersCtx,
                            templateCtx,
                            warehouseCtx,
                            authCtx,
                            shopCtx,
                            categoryCtx,
                            productCtx
                        }}
                    />)
            },
            {
                Key: 'products',
                Title: intl.formatMessage(HomePageMessages.products),
                Icon: <Layers />,
                View: (
                    <ProductPage
                        {...{
                            intl,
                            settingsCtx,
                            warehouseCtx,
                            authCtx,
                            shopCtx,
                            categoryCtx,
                            productCtx
                        }}
                    />)
            },
            IsAdminOrInRole(user, 'LIST_VOUCHERS', 'CRUD_VOUCHERS') && {
                Key: 'voucher',
                Title: intl.formatMessage(HomePageMessages.vouchers),
                Icon: <CardGiftcard />,
                View: (
                    <VoucherList
                        {...{
                            intl,
                            settingsCtx,
                            warehouseCtx,
                            authCtx,
                            usersCtx,
                            shopCtx,
                            categoryCtx,
                            productCtx,
                            templateCtx
                        }}
                    />)
            },
            {
                Key: 'shop',
                Title: intl.formatMessage(HomePageMessages.shop),
                Icon: <Store />,
                View: (
                    <MovementsList
                        {...{
                            intl,
                            settingsCtx,
                            templateCtx,
                            usersCtx,
                            warehouseCtx,
                            authCtx, shopCtx,
                            categoryCtx,
                            productCtx
                        }}
                    />)
            },
            {
                Key: 'settings',
                Title: intl.formatMessage(HomePageMessages.settings),
                Icon: <SettingsIcon />,
                View: (
                    <Settings
                        {...{
                            intl,
                            settingsCtx,
                            warehouseCtx,
                            authCtx,
                            shopCtx,
                            categoryCtx,
                            templateCtx
                        }}
                    />)
            }
        ];
        return (
            <ContentView Tabs={tabs.filter(t => !!t) as Itab[]} />
        );
    }
}
export const HomePageStandalone =
    withAuth(
        withUsers(
            withSettings(
                withCategory(
                    withProduct(
                        withWarehouse(
                            withShop(
                                withTemplates(
                                    injectIntl(HomePage)
                                )
                            )

                        )
                    )
                )
            )
        )
    );