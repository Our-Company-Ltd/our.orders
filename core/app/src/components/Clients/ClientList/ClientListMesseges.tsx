import {
    defineMessages
} from 'react-intl';

export const ClientListMesseges = defineMessages({
    sortBtn: {
        id: 'src.components.orders.orderList.sortBtn',
        defaultMessage: 'Sort and Filters',
        description: 'Legend for sort and filters button on side bar'
    },
    firstName: {
        id: 'src.components.orders.orderList.firstName',
        defaultMessage: 'First Name',
        description: 'Legend for First Name filter'
    },
    lastName: {
        id: 'src.components.orders.orderList.lastName',
        defaultMessage: 'Last Name',
        description: 'Legend for Last Name filter'
    },
    email: {
        id: 'src.components.orders.orderList.toDispatch',
        defaultMessage: 'Email',
        description: 'Legend for Email filter'
    },
    telephone: {
        id: 'src.components.orders.orderList.payments',
        defaultMessage: 'Telephone',
        description: 'Legend for Telephone filter'
    },
    sort: {
        id: 'src.components.orders.orderList.sort',
        defaultMessage: 'Sort',
        description: 'Legend for Sort filter'
    }
});

export default ClientListMesseges;