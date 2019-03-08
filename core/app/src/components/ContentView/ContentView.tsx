import * as React from 'react';

import { ContentViewTab } from './Tab';
import { MoreHoriz } from '@material-ui/icons';
import { WithStyles, withStyles } from '@material-ui/core';
import { OurTheme } from '../ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import * as classNames from 'classnames';
type TabKey =
    'dashboard' |
    'orders' |
    'shop' |
    'clients' |
    'products' |
    'specials' |
    'settings' |
    'voucher'
    ;
export interface Itab {
    Title: string;
    Icon?: React.ReactNode;
    Key: TabKey;
    View: JSX.Element;
}

type injectedClasses =
    'contentView' |
    'view' |
    'tabs' |
    'tabsContainer' |
    'orders' |
    'tabsContainerShow';

export type ContentViewProps = WithStyles<injectedClasses> & {
    Tabs: Itab[];
    InitKey?: TabKey;
};

interface State {
    ActiveKey: TabKey;
    showMore: boolean;
}

export class ContentView extends React.Component<ContentViewProps, State> {
    constructor(props: ContentViewProps) {
        super(props);

        const intiKey =
            this.props.InitKey ||
            localStorage.getItem('activeKey') as TabKey ||
            this.props.Tabs[0].Key;

        this.state = {
            ActiveKey: intiKey,
            showMore: false
        };
    }
    render() {
        if (!this.props.Tabs.length) { return null; }

        const { ActiveKey, showMore } = this.state;
        const { Tabs, classes } = this.props;

        const activeTabs = Tabs.find(t => t.Key === ActiveKey) || Tabs[0];
        const activeTab = activeTabs.View;
        const tabMoreTitle = showMore ? 'Less' : 'More';

        return (
            <div className={classes.contentView}>
                <div className={classes.view}>
                    {activeTab}
                </div>
                <div className={classes.tabs}>
                    <div className={classNames(classes.tabsContainer, showMore && classes.tabsContainerShow)}>
                        {Tabs.map(t => this._renderTab(t, ActiveKey))}
                        <ContentViewTab
                            key="content-view__tab--more"
                            {...{
                                title: tabMoreTitle,
                                id: 'more',
                                active: this.state.showMore,
                                onClick: () => this._handleMoreClick(),
                                icon: <MoreHoriz />
                            }}
                        />
                    </div>
                </div>
            </div>);
    }

    private _handleTabClick(tab: Itab) {
        this.setState(prev => ({
            ActiveKey: tab.Key
        }));
        localStorage.setItem('activeKey', tab.Key);
    }

    private _handleMoreClick() {
        this.setState(prev => ({
            showMore: !prev.showMore
        }));
    }

    private _renderTab(tab: Itab, activeKey: string) {
        const key = `content-view__tab--${tab.Key}`;
        const active = tab.Key === activeKey;
        // const { classes } = this.props;

        // const classnames = ['content-view__tab', key];
        // if (active) {
        //     classnames.push('content-view__tab--active');
        // }

        return (
            <ContentViewTab
                key={key}
                {...{
                    title: tab.Title,
                    id: tab.Key,
                    active: active,
                    onClick: () => this._handleTabClick(tab),
                    icon: tab.Icon
                }}
            />);
    }
}

const heightTabsBarTablet = 60;
export default withStyles((theme: OurTheme): StyleRules<injectedClasses> => {

    return {
        contentView: {
            position: 'relative',
            height: '100%',
            overflow: 'hidden',
            zIndex: 0,
            background: 'white'
        },
        view: {
            height: '100%',
            paddingBottom: heightTabsBarTablet,
            boxSizing: 'border-box',
            zIndex: 0,
            position: 'relative',
        },
        tabs: {
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: heightTabsBarTablet,
            zIndex: 1,
            boxShadow: '0px -2px 3px rgba(0, 0, 0, 0.15)'
        },
        tabsContainer: {
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
            transition: 'all 0.2s ease',
            background: '#F0F0F0'
        },
        tabsContainerShow: {
            transform: 'translateY(-100%)',
            marginTop: heightTabsBarTablet,
        },
        orders: {
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            flexWrap: 'nowrap',
            height: '100%'
        }
    };
})(ContentView);