import LangSwitch, { Props as LangSwitchProps } from './Component';

import { connect, Dispatch } from 'react-redux';

import { State } from '../../_store';
import { LocaleAction, setLocale } from '../../_store/_actions';

function mapStateToProps({ localeState }: State): Partial<LangSwitchProps> {
    return {
        locale: localeState
    };
}

function mapDispatchToProps(dispatch: Dispatch<LocaleAction>): Partial<LangSwitchProps> {
    return {
        onRequestSet: (lang) => setLocale(lang)(dispatch)
    };
}

export default
    connect<Partial<LangSwitchProps>, Partial<LangSwitchProps>>(mapStateToProps, mapDispatchToProps)(LangSwitch);