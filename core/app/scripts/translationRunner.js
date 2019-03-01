// translationRunner.js
const manageTranslations = require('react-intl-translations-manager').default;

manageTranslations({
    messagesDirectory: 'src/i18n/extracted/',
    translationsDirectory: 'public/locales/',
    languages: ['fr', 'pt', 'de']
});

manageTranslations({
    messagesDirectory: 'src/i18n/extracted/',
    translationsDirectory: 'src/i18n/',
    languages: ['en']
});