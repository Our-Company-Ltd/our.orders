import * as React from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { InjectedAuthProps, withAuth } from '../../_context';
import { GetHashVariable } from 'src/_helpers/url';
import { HomePageStandalone } from 'src/pages/Home/HomePage';
import RegisterPage from 'src/pages/Register/RegisterPage';
import ResetPage from 'src/pages/Reset/ResetPage';
import LoginPage from 'src/pages/Login/LoginPage';
import { WithStyles, withStyles } from '@material-ui/core';
import { OurTheme } from '../ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import SetupPage from 'src/pages/Setup/SetupPage';

type injectedClasses = 'page' | 'pageEnter' | 'pageEnterActive' | 'pageExit' | 'pageExitActive';
export type AuthenticatorProps =
    InjectedAuthProps &
    WithStyles<injectedClasses> &
    {
    };

type State = {
    action: string;
    code: string;
    id: string;
    username: string;
};

const FadeInDuration = 300;
const FadeOutDuration = 300;

class HashRouter extends React.Component<AuthenticatorProps, State> {
    constructor(props: AuthenticatorProps) {
        super(props);
        this._hashChange = this._hashChange.bind(this);

        this.state = {
            action: GetHashVariable('action'),
            code: GetHashVariable('code'),
            id: GetHashVariable('id'),
            username: GetHashVariable('username')
        };
    }
    componentDidMount() {
        window.addEventListener('hashchange', this._hashChange, false);
    }
    componentWillUnmount() {
        window.removeEventListener('hashchange', this._hashChange);
    }

    render() {
        const { authCtx, classes } = this.props;
        let { action, code, id, username } = this.state;
        const key = action || (authCtx.loggedin ? 'home' : authCtx.needSetup ? 'setup' : 'login');
        return (
            <TransitionGroup className={classes.page}>
                <CSSTransition
                    key={key}
                    appear={true}
                    classNames={{
                        enter: classes.pageEnter,
                        enterActive: classes.pageEnterActive,
                        exit: classes.pageExit,
                        exitActive: classes.pageExitActive
                    }}
                    timeout={{ enter: FadeInDuration, exit: FadeOutDuration }}
                >
                    {this._getView(key, code, id, username)}
                </CSSTransition>
            </TransitionGroup >);
    }
    private _hashChange() {
        this.setState((prev) => ({
            action: GetHashVariable('action'),
            code: GetHashVariable('code'),
            id: GetHashVariable('id'),
            username: GetHashVariable('username'),
            previous: prev.action
        }));
    }
    private _getView(action: string, code: string, id: string, username: string) {
        const { classes } = this.props;
        switch (action) {
            case 'register':
                return (
                    <div key="register" className={classes.page}>
                        <RegisterPage key="register" registerKey={code} userId={id} userName={username} />
                    </div>);
            case 'setup':
                return (
                    <div key="setup" className={classes.page}>
                        <SetupPage />
                    </div>);
            case 'reset':
                return (
                    <div key="reset" className={classes.page}>
                        <ResetPage key="reset" registerKey={code} userId={id} userName={username} />
                    </div>);
            case 'login':
                return <div key="login" className={classes.page}><LoginPage key="login" /></div>;
            case 'home':
                return <div key="home" className={classes.page}> <HomePageStandalone key="home" /></div>;
            default:
                return null;

        }
    }
}

export default withStyles((theme: OurTheme): StyleRules<injectedClasses> => ({
    page: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
    },
    pageEnter: {
        opacity: 0.01
    },
    pageEnterActive: {
        opacity: 1,
        transition: `opacity ${FadeInDuration}ms ease-in`
    },
    pageExit: {
        opacity: 1
    },
    pageExitActive: {
        opacity: 0.01,
        transition: `opacity ${FadeOutDuration}ms ease-in`
    }
}))(withAuth(HashRouter));