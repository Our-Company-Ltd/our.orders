import * as React from 'react';

import {
  injectIntl,
  InjectedIntlProps,
  FormattedMessage
} from 'react-intl';

import { withAuth, InjectedAuthProps } from '../../_context';
import IconButton from '@material-ui/core/IconButton';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import InputAdornment from '@material-ui/core/InputAdornment';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { Button, withStyles, WithStyles } from '@material-ui/core';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import { logInMessages } from './LoginPageMessages';
import { RadioButtonUnchecked, CheckCircle } from '@material-ui/icons';

type injectedClasses =
  'root' |
  'loginPage' |
  'form' |
  'title' |
  'cancel' |
  'resetBtn' |
  'passwordOptions' |
  'forgot' |
  'remember' |
  'forgotLink' |
  'rememberIcon' |
  'submitBtn' |
  'errorMessage';

export type LoginProps =
  InjectedAuthProps &
  InjectedIntlProps &
  WithStyles<injectedClasses>;

type State = {
  username?: string;
  password?: string;
  forgot?: boolean;
  showPassword?: boolean
  usernameFocussed?: boolean;
  rememberMe?: boolean;
  error?: boolean;
  errorMessage?: React.ReactNode;
};

class LoginPage extends React.Component<LoginProps, State> {
  constructor(props: LoginProps) {
    super(props);
    const { authCtx: { user } } = this.props;

    this.state = {
      username: (user && user.UserName) || undefined
    };
    this._handleShowPasswordClick = this._handleShowPasswordClick.bind(this);
    this._handleShowPasswordMouseDown = this._handleShowPasswordMouseDown.bind(this);
    this._handleUsernameChange = this._handleUsernameChange.bind(this);
    this._handlePasswordChange = this._handlePasswordChange.bind(this);
    this._handleLoginSubmit = this._handleLoginSubmit.bind(this);
    this._handleResetSubmit = this._handleResetSubmit.bind(this);
    this._handleForgotPassword = this._handleForgotPassword.bind(this);
    this._handleRmemberMeCLick = this._handleRmemberMeCLick.bind(this);
  }

  render() {

    const { password, username, forgot, rememberMe, error, errorMessage } = this.state;
    const { intl: { formatMessage }, authCtx: { fetching }, classes } = this.props;

    const usernameTitle = formatMessage(logInMessages.usernameTitle);

    const passwordTitle = formatMessage(logInMessages.passwordTitle);

    return (
      <div className={classes.loginPage}>
        <form
          className={classes.form}
          onSubmit={
            this.state.forgot
              ? this._handleResetSubmit
              : this._handleLoginSubmit
          }
        >
          <h2 className={classes.title}>
            <FormattedMessage
              id="pages.login.loginpage.mainTitle"
              defaultMessage="Login"
              description="Welcome Message"
            />
          </h2>

          <TextField
            label={usernameTitle}
            onChange={(value) => this._handleUsernameChange(value.target.value)}
            value={username || ''}
            fullWidth={true}
            inputProps={{ autoComplete: 'username' }}
          />

          {!this.state.forgot &&
            <React.Fragment>
              <FormControl fullWidth={true}>
                <InputLabel htmlFor="password">{passwordTitle}</InputLabel>
                <Input
                  id="password"
                  type={this.state.showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password || ''}
                  onChange={(value) => this._handlePasswordChange(value.target.value)}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="Toggle password visibility"
                        onClick={this._handleShowPasswordClick}
                        onMouseDown={this._handleShowPasswordMouseDown}
                      >
                        {this.state.showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>
              <div className={classes.passwordOptions}>
                <div className={classes.forgot}>
                  <FormattedMessage
                    {...logInMessages.forgot}
                    values={{
                      password_link:
                        <a className={classes.forgotLink} onClick={this._handleForgotPassword}>
                          <FormattedMessage {...logInMessages.passwordLink} />
                        </a>
                    }}
                  />
                </div>
                <a
                  className={classes.remember}
                  onClick={this._handleRmemberMeCLick}
                >
                  <FormattedMessage {...logInMessages.rememberMe} />
                  <span className={classes.rememberIcon}>
                    {rememberMe ? <CheckCircle /> : <RadioButtonUnchecked />}
                  </span>
                </a>
              </div>
            </React.Fragment>
          }
          {forgot && (
            <Button onClick={() => this._handleBackClick()}>
              <FormattedMessage {...logInMessages.backBtn} />
            </Button>)}
          {fetching ?
            (
              <Button
                variant="contained"
                color="secondary"
                disabled={true}
              >
                <FormattedMessage {...logInMessages.loadingText} />
              </Button>) :
            (
              <Button
                type="submit"
                variant="contained"
                color="secondary"
              >
                {forgot ?
                  <FormattedMessage {...logInMessages.resetBtn} /> :
                  <FormattedMessage {...logInMessages.submitBtn} />
                }
              </Button>)}
          {error &&
            <div className={classes.errorMessage}>
              {errorMessage}
            </div>
          }
        </form>
      </div>
    );
  }
  private _handleShowPasswordClick() {
    this.setState(prev => ({
      showPassword: !prev.showPassword
    }));
  }
  private _handleShowPasswordMouseDown(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault();
  }
  private _handleRmemberMeCLick() {
    this.setState(prev => ({
      rememberMe: !prev.rememberMe
    }));
  }

  private _handleLoginSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { username, password } = this.state;
    const { authCtx, intl: { formatMessage } } = this.props;
    if (!username || !password) {
      this.setState(() => ({
        error: true,
        errorMessage: formatMessage(logInMessages.imcomplete)
      }));

      return;
    }
    authCtx
      .login(username, password)
      .then((result) => {
        if (!result) {
          this.setState(() => ({
            error: true,
            errorMessage: formatMessage(logInMessages.failed)
          }));
        }
      });
  }

  private _handleResetSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { username } = this.state;
    const { authCtx } = this.props;
    if (username) {
      authCtx.reset(username);
    }
  }

  private _handlePasswordChange(value: string) {
    this.setState(() => ({
      password: value
    }));
  }

  private _handleUsernameChange(value: string) {
    this.setState(() => ({
      username: value
    }));
  }

  private _handleBackClick() {
    this.setState(() => ({
      forgot: false
    }));
  }
  private _handleForgotPassword(e: React.FormEvent<HTMLAnchorElement>) {
    this.setState(prev => ({
      forgot: !prev.forgot
    }));
  }
}

export default withStyles((theme: OurTheme): StyleRules<injectedClasses> => ({
  root: {
  },
  loginPage: {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0'
  },
  form: {
    position: 'absolute',
    width: 250,
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    boxShadow: '3px 3px 3px rgba(0, 0, 0, 0.15); //1px 1px 5px rgba(0,0,0,.2)',
    background: '#f8f8f8',
    borderRadius: 4,
    padding: '30px 35px',
    textAlign: 'right'
  },
  title: {
    fontSize: '2.4rem',
    paddingSottom: '0.5rem',
    margin: '0 0 0.5rem 0',
    fontWeight: 'bold',
    color: theme.Colors.blue.primary.main,
    borderBottom: '1px solid #969696',
    textAlign: 'center',
  },
  cancel: {
    display: 'inline-block',
    marginRight: 10,
    fontSize: '0.7rem',
    color: theme.Colors.blue.primary.main,
  },
  resetBtn: {
    marginTop: 15
  },
  passwordOptions: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    padding: '0.3rem 0 0.7rem',
    alignItems: 'center'
  },
  forgot: {
    flexGrow: 1,
    flexShrink: 1,
    fontSize: '0.8rem',
    color: '#969696',
    textAlign: 'left'
  },
  remember: {
    flexGrow: 1,
    flexShrink: 1,
    fontSize: '0.8rem',
    color: '#969696',
    textAlign: 'right',
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  forgotLink: {
    color: theme.Colors.blue.primary.main
  },
  rememberIcon: {
    marginLeft: 5
  },
  submitBtn: {
    textTransform: 'uppercase',
    fontWeight: 'bold'
  },
  errorMessage: {
    display: 'block',
    marginTop: 10,
    color: theme.Colors.red.primary.main,
    fontSize: '.8rem',
    textAlign: 'left'
  }
}))(withAuth(injectIntl(LoginPage)));