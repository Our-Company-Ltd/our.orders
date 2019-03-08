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
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import { Button, withStyles, WithStyles, TextField } from '@material-ui/core';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import RegisterPageMessages from './RegisterPageMessages';

type injectedClasses =
  'root' |
  'page' |
  'form' |
  'title' |
  'cancel' |
  'submitBtn' |
  'errorMessage';
export type RegisterPageProps =
  InjectedAuthProps &
  InjectedIntlProps &
  WithStyles<injectedClasses> & {
    registerKey: string;
    userId: string;
    userName: string;

  };

type State = {
  password: string;
  confirmPassword: string;
  error: boolean;
  showPassword: boolean;
  errorMessage: React.ReactNode;
};

class RegisterPage extends React.Component<RegisterPageProps, State> {
  constructor(props: RegisterPageProps) {
    super(props);
    this._handleSubmit = this._handleSubmit.bind(this);
    this.state = {
      password: '',
      confirmPassword: '',
      error: false,
      showPassword: false,
      errorMessage: ''
    };

  }

  render() {

    const { password, confirmPassword, showPassword } = this.state;
    const { authCtx: { fetching }, classes, userName } = this.props;

    const change = (key: keyof State) => (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
      const v = e.target.value;
      // tslint:disable-next-line:no-any
      this.setState(() => ({ [key]: v } as any as Pick<State, keyof State>));
    };
    return (
      <div className={classes.page}>
        <form
          className={classes.form}
          onSubmit={this._handleSubmit}
        >
          <h2 className={classes.title}>
            <FormattedMessage {...RegisterPageMessages.mainTitle} />
          </h2>
          <TextField
            label={'username'}
            name="username"
            value={userName || ''}
            fullWidth={true}
            inputProps={{ autoComplete: 'username' }}
          />
          <FormControl fullWidth={true}>
            <InputLabel htmlFor="password"><FormattedMessage {...RegisterPageMessages.passwordTitle} /></InputLabel>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password || ''}
              name="password"
              onChange={change('password')}
              autoComplete="new-password"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Toggle password visibility"
                    onClick={() => this.setState((p) => ({ showPassword: !p.showPassword }))}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              }
            />
          </FormControl>
          <FormControl fullWidth={true}>
            <InputLabel htmlFor="password">
              <FormattedMessage {...RegisterPageMessages.confirmPasswordTitle} />
            </InputLabel>
            <Input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword || ''}
              onChange={change('confirmPassword')}
              autoComplete="new-password"
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="Toggle password visibility"
                    onClick={() => this.setState((p) => ({ showPassword: !p.showPassword }))}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
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
                <FormattedMessage {...RegisterPageMessages.loadingText} />
              </Button>) :
            (
              <Button
                type="submit"
                variant="contained"
                color="secondary"
              >
                <FormattedMessage {...RegisterPageMessages.resetBtn} />
              </Button>)}
          {this.state.error &&
            <div className={classes.errorMessage}>
              {this.state.errorMessage}
            </div>
          }
        </form>
      </div>
    );
  }

  private _handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const { password, confirmPassword } = this.state;
    const { registerKey, userId, authCtx, intl } = this.props;
    if (!password) {
      this.setState(() => ({
        error: true,
        errorMessage: intl.formatMessage(RegisterPageMessages.incomplete)
      }));

      return;
    }
    if (password !== confirmPassword) {
      this.setState(() => ({
        error: true,
        errorMessage: intl.formatMessage(RegisterPageMessages.different)
      }));

      return;
    }

    authCtx
      .confirmRegister(userId, registerKey, password)
      .then((result) => {
        if (!result) {
          this.setState(() => ({
            error: true,
            errorMessage: intl.formatMessage(RegisterPageMessages.failed)
          }));
          return;
        }
        document.location.hash = 'home';
      })
      .catch((reason) => {
        this.setState(() => ({
          error: true,
          errorMessage: reason
        }));
      });
  }

}

export default withStyles((theme: OurTheme): StyleRules<injectedClasses> => ({
  root: {
  },
  page: {
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
}))(withAuth(injectIntl(RegisterPage)));