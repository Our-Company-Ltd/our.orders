import * as React from 'react';

import { injectIntl, InjectedIntlProps, FormattedMessage, defineMessages } from 'react-intl';
import { LocaleState } from '../../_store/_states';
import { withStyles } from '@material-ui/core';
import { OurTheme } from '../ThemeProvider/ThemeProvider';
import { StyleRules, WithStyles } from '@material-ui/core/styles';

type injectedClasses =
    'langSwitch' |
    'link';

export type Props =
    WithStyles<injectedClasses> & {
        onRequestSet: (lang: string) => void;
        locale: LocaleState;
    };

type State = {
    username?: string;
    password?: string;
    forgot: boolean;
};

export const Messages = defineMessages({
    changelanguage: {
        id: 'LangSwitch.title',
        defaultMessage: 'Swicth Langs',
        description: 'Swicth Langs'
    }
});

class LangSwitch extends React.Component<Props & InjectedIntlProps, State> {

    constructor(props: Props & InjectedIntlProps) {
        super(props);
    }

    render() {
        const {classes} = this.props;
        const links = ['en', 'fr', 'de', 'pt'].map(l => {
            return (
                <a
                    className={classes.link}
                    key={`switch-lang-${l}`}
                    onClick={(e) => this._handleLinkClick(e, l)}
                >
                    {l}
                </a>
            );
        });
        return (
            <div className={classes.langSwitch}>
                <FormattedMessage {...Messages.changelanguage} />
                {links}
            </div>);
    }

    private _handleLinkClick(e: React.MouseEvent<HTMLAnchorElement>, lang: string) {
        e.preventDefault();
        this.props.onRequestSet(lang);
    }
}

export default withStyles((theme: OurTheme): StyleRules<injectedClasses> => {
    return {
        langSwitch: {
            position: 'absolute',
            top: 30,
            right: 30
        },
        link: {
            display: 'inline-block',
            margin: '0 5px'
        }
    };
})(injectIntl(LangSwitch));