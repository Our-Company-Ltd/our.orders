import { createStore, combineReducers } from 'redux';
import {
    LocaleReducer,
    initLocaleState
} from './_reducers';

import { 
    LocaleState, 
} from './_states';

export type State = {
    localeState: LocaleState;
};

export const Reducer = combineReducers<State>({
    localeState: LocaleReducer,
});

export const Store = createStore<State>(Reducer, {
    localeState: initLocaleState,
});

export default Store;