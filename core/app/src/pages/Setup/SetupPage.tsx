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
import { SetupPageMessages } from './SetupPageMessages';
import { User, ApiModel } from 'src/@types/our-orders';

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

export type SetupProps =
  InjectedAuthProps &
  InjectedIntlProps &
  WithStyles<injectedClasses>;

type State = {
  username: string;
  email: string
  password: string;
  confirmPassword: string;
  showPassword?: boolean
  showConfirmPassword?: boolean
  error?: boolean;
  errorMessage?: React.ReactNode;
};

class SetupPage extends React.Component<SetupProps, State> {
  constructor(props: SetupProps) {
    super(props);

    this.state = {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
    this._handleShowPasswordClick = this._handleShowPasswordClick.bind(this);
    this._handleShowConfirmPasswordClick = this._handleShowConfirmPasswordClick.bind(this);
    this._handleShowPasswordMouseDown = this._handleShowPasswordMouseDown.bind(this);
    this._handleShowConfirmPasswordMouseDown = this._handleShowConfirmPasswordMouseDown.bind(this);
    this._handleNameChange = this._handleNameChange.bind(this);
    this._handlePasswordChange = this._handlePasswordChange.bind(this);
    this._handleLoginSubmit = this._handleLoginSubmit.bind(this);
  }

  render() {

    const { password, username: name, email, confirmPassword, error,
      errorMessage, showConfirmPassword, showPassword } = this.state;
    const { intl: { formatMessage }, authCtx: { fetching }, classes } = this.props;

    return (
      <div className={classes.loginPage}>
        <form
          className={classes.form}
          onSubmit={this._handleLoginSubmit}
        >
          <h2 className={classes.title}>{formatMessage(SetupPageMessages.title)}</h2>

          <TextField
            label={formatMessage(SetupPageMessages.username)}
            onChange={(value) => this._handleNameChange(value.target.value)}
            name="username"
            value={name || ''}
            inputProps={{ autoComplete: 'username' }}
            fullWidth={true}
          />

          <TextField
            label={formatMessage(SetupPageMessages.email)}
            onChange={(value) => this._handleEmailChange(value.target.value)}
            value={email || ''}
            name="email"
            inputProps={{ autoComplete: 'email' }}
            fullWidth={true}
          />

          <FormControl fullWidth={true}>
            <InputLabel htmlFor="password">{formatMessage(SetupPageMessages.passwordTitle)}</InputLabel>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={password || ''}
              autoComplete="new-password"
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

          <FormControl fullWidth={true}>
            <InputLabel
              htmlFor="confirm_password"
            >
              {formatMessage(SetupPageMessages.confirmPasswordTitle)}
            </InputLabel>
            <Input
              id="confirm_password"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword || ''}
              autoComplete="new-password"
              onChange={(value) => this._handleConfirmPasswordChange(value.target.value)}
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Toggle password visibility"
                    onClick={this._handleShowConfirmPasswordClick}
                    onMouseDown={this._handleShowConfirmPasswordMouseDown}
                  >
                    {this.state.showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>

          {fetching ?
            (
              <Button
                variant="contained"
                color="secondary"
                disabled={true}
              >
                <FormattedMessage {...SetupPageMessages.loadingText} />
              </Button>) :
            (
              <Button
                type="submit"
                variant="contained"
                color="secondary"
              >
                <FormattedMessage {...SetupPageMessages.submitBtn} />
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
  private _handleShowConfirmPasswordClick() {
    this.setState(prev => ({
      showConfirmPassword: !prev.showConfirmPassword
    }));
  }
  private _handleShowPasswordMouseDown(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault();
  }
  private _handleShowConfirmPasswordMouseDown(e: React.MouseEvent<HTMLElement>) {
    e.preventDefault();
  }

  private _handleLoginSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // tslint:disable-next-line:no-console
    console.log('handle submit');

    const { username, password, email, confirmPassword } = this.state;
    const { authCtx, intl: { formatMessage } } = this.props;
    if (!username || !password || confirmPassword !== password) {
      this.setState(() => ({
        error: true,
        errorMessage: formatMessage(SetupPageMessages.incomplete)
      }));

      return;
    }

    authCtx
      .setup(username, password, { Email: email })
      .then((result) => {
        if (!result) {
          this.setState(() => ({
            error: true,
            errorMessage: formatMessage(SetupPageMessages.failed)
          }));
        }
      })
      .catch((reason: ApiModel<User>) => {
        this.setState(() => ({
          error: true,
          errorMessage: reason.Result.Message
        }));
      });
  }

  private _handlePasswordChange(value: string) {
    this.setState(() => ({
      password: value
    }));
  }

  private _handleConfirmPasswordChange(value: string) {
    this.setState(() => ({
      confirmPassword: value
    }));
  }

  private _handleNameChange(value: string) {
    this.setState(() => ({
      username: value
    }));
  }

  private _handleEmailChange(value: string) {
    this.setState(() => ({
      email: value
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
    paddingBottom: '0.5rem',
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
    textAlign: 'right'
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
}))(withAuth(injectIntl(SetupPage)));