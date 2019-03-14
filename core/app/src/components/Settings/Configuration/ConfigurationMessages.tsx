import {
    defineMessages
} from 'react-intl';

export const ConfigurationMessages = defineMessages({
    showWeight: {
        id: 'src.components.settings.configuration.showWeight',
        defaultMessage: 'Show weight',
        description: 'Show weight in UI'
    },
    showTaxRateIncluded: {
        id: 'src.components.settings.configuration.showTaxRateIncluded',
        defaultMessage: 'Show tax rate included',
        description: 'Show tax rate included in UI'
    },
    showTaxRateExcluded: {
        id: 'src.components.settings.configuration.showTaxRateExcluded',
        defaultMessage: 'Show tax rate excluded',
        description: 'Show tax rate excluded in UI'
    },
    taxRateIncluded: {
        id: 'src.components.settings.configuration.taxRateIncluded',
        defaultMessage: 'Default Tax rate included value',
        description: 'Default Tax rate included value'
    },
    taxRateExcluded: {
        id: 'src.components.settings.configuration.taxRateExcluded',
        defaultMessage: 'Default Tax rate excluded value',
        description: 'Default Tax rate excluded value'
    },
    bankTransferSentence: {
        id: 'src.components.settings.configuration.bankTransferSentence',
        defaultMessage: 'Bank transfer message ',
        description: 'Default text to for bank transfer'
    }
});

export default ConfigurationMessages;