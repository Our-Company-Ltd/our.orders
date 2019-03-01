import { defineMessages } from 'react-intl';

export const ShopDetailMesseges = defineMessages({
    firstName: {
        id: 'src.components.settings.shops.name',
        defaultMessage: 'Name',
        description: 'Legend for Name field in users submenu of settings'
    },
    address: {
        id: 'src.components.settings.shops.address',
        defaultMessage: 'Address',
        description: 'Legend for Address field in users submenu of settings'
    },
    city: {
        id: 'src.components.settings.shops.city',
        defaultMessage: 'City',
        description: 'Legend for City field in users submenu of settings'
    },
    countryIso: {
        id: 'src.components.settings.shops.countryIso',
        defaultMessage: 'Country Iso',
        description: 'Legend for Country Iso field in users submenu of settings'
    },
    email: {
        id: 'src.components.settings.shops.email',
        defaultMessage: 'Email',
        description: 'Legend for Email field in users submenu of settings'
    },
    organizationName: {
        id: 'src.components.settings.shops.organizationName',
        defaultMessage: 'Organization name',
        description: 'Legend for Organization name field in users submenu of settings'
    },
    phone: {
        id: 'src.components.settings.shops.phone',
        defaultMessage: 'Phone',
        description: 'Legend for Phone field in users submenu of settings'
    },
    postalCode: {
        id: 'src.components.settings.shops.postalCode',
        defaultMessage: 'Postal code',
        description: 'Legend for Postal code field in users submenu of settings'
    },
    state: {
        id: 'src.components.settings.shops.state',
        defaultMessage: 'State',
        description: 'Legend for State field in users submenu of settings'
    },
    vatNumber: {
        id: 'src.components.settings.shops.vatNumber',
        defaultMessage: 'VAT number',
        description: 'Legend for VAT number field in users submenu of settings'
    },
    deleteConfirm: {
        id: 'src.components.settings.shops.deleteConfirm',
        defaultMessage: 'Are you sure you want to delete this shop?',
        description: 'Default messege for confirm if user are sure about deleting the shop'
    }
});

export default ShopDetailMesseges;