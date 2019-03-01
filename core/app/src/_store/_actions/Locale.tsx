import { Dispatch } from 'react-redux';

import { LOCALE } from '../_constants';

export interface LocaleAction {
  type: LOCALE;
  lang?: string;
  messages?: { [id: string]: string };
}

export function setLocale(newlang: string): ((o: Dispatch<LocaleAction>) => void) {
  return dispatch => {
    dispatch({ type: LOCALE.LOCALE_REQUEST, lang: newlang });

    // find the messages...
    fetch(`/locales/${newlang.toLowerCase()}.json`)
      .then(response => response.json())
      .then(messages => {
        dispatch({
          type: LOCALE.LOCALE_SUCCESS,
          lang: newlang,
          messages: messages
        });

      })
      .catch(reason => {
        dispatch({
          type: LOCALE.LOCALE_FAILURE
        });

      });
  };
}
