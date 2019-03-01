import { LocaleState } from '../_states';
import { LocaleAction } from '../_actions';
import { LOCALE } from '../_constants';

export const initLocaleState: LocaleState = {
    lang: 'en',
    loading: false,
    messages: require('./../../i18n/en.json')
};

export function LocaleReducer(state: LocaleState = initLocaleState, action: LocaleAction): LocaleState {
    switch (action.type) {
        case LOCALE.LOCALE_REQUEST:
            return {
                ...state,
                loading: true
            };
        case LOCALE.LOCALE_FAILURE:
            return {
                ...state,
                loading: false
            };
        case LOCALE.LOCALE_SUCCESS:
            return {
                ...state,
                lang: action.lang ? action.lang : state.lang,
                loading: false,
                messages: action.messages
            };
        default:
            return state;
    }
}
