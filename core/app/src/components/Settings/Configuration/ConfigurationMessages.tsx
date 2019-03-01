import {
    defineMessages
} from 'react-intl';

export const ConfigurationMessages = defineMessages({
    showWeight: {
        id: 'src.components.settings.configuration.showWeight',
        defaultMessage: 'Show weight',
        description: 'Default text to show weight switch in configuration'
    },
    showTaxRateIncluded: {
        id: 'src.components.settings.configuration.showTaxRateIncluded',
        defaultMessage: 'Show tax rate included',
        description: 'Default text to show weight switch in configuration'
    },
    showTaxRateExcluded: {
        id: 'src.components.settings.configuration.showTaxRateExcluded',
        defaultMessage: 'Show tax rate excluded',
        description: 'Default text to show weight switch in configuration'
    },
    taxRateIncluded: {
        id: 'src.components.settings.configuration.taxRateIncluded',
        defaultMessage: 'Tax rate included value',
        description: 'Default text to show weight switch in configuration'
    },
    taxRateExcluded: {
        id: 'src.components.settings.configuration.taxRateExcluded',
        defaultMessage: 'Tax rate excluded value',
        description: 'Default text to show weight switch in configuration'
    },
    bankTransferSentence: {
        id: 'src.components.settings.configuration.bankTransferSentence',
        defaultMessage: 'Bank transfer message ',
        description: 'Default text to for bank transference'
    }
});

export default ConfigurationMessages;