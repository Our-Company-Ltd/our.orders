import {
    defineMessages
} from 'react-intl';

export const MovementsFieldsMessages = defineMessages({
    shop: {
        id: 'src.components.forms.movements.shop',
        defaultMessage: 'Shop',
        description: 'Legend for shop'
    },
    user: {
        id: 'src.components.forms.movements.user',
        defaultMessage: 'User',
        description: 'Legend for user'
    },
    note: {
        id: 'src.components.forms.movements.note',
        defaultMessage: 'Note',
        description: 'Legend for multiple use switch'
    },
    archived: {
        id: 'src.components.forms.movements.archived',
        defaultMessage: 'Archived',
        description: 'Legend for Archived switch'
    },
    currency: {
        id: 'src.components.forms.movements.currency',
        defaultMessage: 'Currency',
        description: 'Legend for Currency'
    },
    amount: {
        id: 'src.components.forms.movements.amount',
        defaultMessage: 'Amount',
        description: 'Legend for Amount'
    },
});

export default MovementsFieldsMessages;