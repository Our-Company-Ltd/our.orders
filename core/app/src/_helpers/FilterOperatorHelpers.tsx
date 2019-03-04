import { defineMessages, InjectedIntl } from 'react-intl';
import { FilterOperator } from 'src/@types/our-orders';

const messages = defineMessages({
    'eq': {
        id: `FilterOperator.eq`,
        defaultMessage: '=',
        description: 'Equal oprerator'
    },
    'ne': {
        id: `FilterOperator.ne`,
        defaultMessage: '!=',
        description: 'Not equal siopreratorgn'
    },
    'lt': {
        id: `FilterOperator.lt`,
        defaultMessage: '<',
        description: 'Less then oprerator'
    },
    'bt': {
        id: `FilterOperator.gt`,
        defaultMessage: '>',
        description: 'Bigger then oprerator'
    },
    'lte': {
        id: `FilterOperator.lte`,
        defaultMessage: '<=',
        description: 'Less or equal then oprerator'
    },
    'gte': {
        id: `FilterOperator.gte`,
        defaultMessage: '>=',
        description: 'Bigger or equal then oprerator'
    },
    'and': {
        id: `FilterOperator.and`,
        defaultMessage: 'and',
        description: 'and oprerator'
    },
    'or': {
        id: `FilterOperator.or`,
        defaultMessage: 'or',
        description: 'or oprerator'
    },
    'like': {
        id: `FilterOperator.like`,
        defaultMessage: 'like',
        description: 'like oprerator'
    }
    
});

export const GetLegend = (intl: InjectedIntl, operator: FilterOperator): string => {
    var messageDescriptor = messages[operator] ||
     { defaultMessage: operator.toString(), id: `FilterOperator.${operator}` };
    return intl.formatMessage(messageDescriptor);
};
