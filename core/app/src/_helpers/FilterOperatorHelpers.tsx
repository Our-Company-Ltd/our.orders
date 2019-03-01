import { defineMessages, InjectedIntl } from 'react-intl';
import { FilterOperator } from 'src/@types/our-orders';

const messages = defineMessages({
    'eq': {
        id: `FilterOperator.${FilterOperator.eq}`,
        defaultMessage: '=',
        description: 'Equal oprerator'
    },
    'ne': {
        id: `FilterOperator.${FilterOperator.ne}`,
        defaultMessage: '!=',
        description: 'Not equal siopreratorgn'
    },
    'lt': {
        id: `FilterOperator.${FilterOperator.lt}`,
        defaultMessage: '<',
        description: 'Less then oprerator'
    },
    'bt': {
        id: `FilterOperator.${FilterOperator.gt}`,
        defaultMessage: '>',
        description: 'Bigger then oprerator'
    },
    'lte': {
        id: `FilterOperator.${FilterOperator.lte}`,
        defaultMessage: '<=',
        description: 'Less or equal then oprerator'
    },
    'gte': {
        id: `FilterOperator.${FilterOperator.gte}`,
        defaultMessage: '>=',
        description: 'Bigger or equal then oprerator'
    },
    'and': {
        id: `FilterOperator.${FilterOperator.and}`,
        defaultMessage: 'and',
        description: 'and oprerator'
    },
    'or': {
        id: `FilterOperator.${FilterOperator.or}`,
        defaultMessage: 'or',
        description: 'or oprerator'
    },
    'regex': {
        id: `FilterOperator.${FilterOperator.regex}`,
        defaultMessage: 'like',
        description: 'regex then oprerator'
    }
});

export const GetLegend = (intl: InjectedIntl, operator: FilterOperator): string => {
    var messageDescriptor = messages[operator] ||
     { defaultMessage: operator.toString(), id: `FilterOperator.${operator}` };
    return intl.formatMessage(messageDescriptor);
};
