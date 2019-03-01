import * as React from 'react';
import './styles.css';
import { withStyles, WithStyles } from '@material-ui/core';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import * as classNames from 'classnames';

type injectedClasses =
    'tab' |
    'active' |
    'icon' |
    'iconInner' |
    'title';

export type ContentViewTabProps =
    WithStyles<injectedClasses> & {
        id: string;
        title: string;
        icon?: React.ReactNode;
        active: boolean;
        onClick: () => void;
    };

export class ContentViewTabWithStyles extends React.Component<ContentViewTabProps> {
    constructor(props: ContentViewTabProps) {
        super(props);
        this._handleClick = this._handleClick.bind(this);
    }

    render() {
        const { classes, active } = this.props;

        // const cls: string[] = [
        //     'tab',
        //     `tab--${this.props.id}`
        // ];

        // if (this.props.active) {
        //     cls.push('tab--active');
        // }

        return (
            <a
                className={classNames(
                    classes.tab,
                    active && classes.active,
                    `tab--${this.props.id}`)}
                onClick={this._handleClick}
            >
                <span className={classes.icon}>
                    <span className={classes.iconInner}>
                        {this.props.icon}
                    </span>
                </span>
                <span className={classes.title}>{this.props.title}</span>
            </a>);
    }

    private _handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
        e.preventDefault();
        this.props.onClick();
    }
}

const heightTabsBarTablet = 60;
const tabWidth = 80;
// const tabsCount = 8;
const tabPadding = '0.5rem';
export const ContentViewTab = withStyles((theme: OurTheme): StyleRules<injectedClasses> => {
    return {
        tab: {
            height: heightTabsBarTablet,
            width: tabWidth,
            fontSize: '0.7rem',
            padding: tabPadding,
            boxSizing: 'border-box',
            color: 'gray',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            '&.tab--more':  {
                display: 'none !important'
            }
        },
        active: {
            color: 'black',
        },
        icon: {
            display: 'flex',
            flexBasis: '60%',
            alignItems: 'center',
            fontSize: '1.4rem'
        },
        iconInner: {
            width: '100%',
            height: '100%',
        },
        title: {}
    };
})(ContentViewTabWithStyles);