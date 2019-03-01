import { defineMessages } from 'react-intl';

export const logInMessages = defineMessages({
  mainTitle: {
    id: 'pages.login.loginpage.mainTitle',
    defaultMessage: 'Login',
    description: 'mainTitle'
  },
  usernamePlaceholder: {
    id: 'pages.login.loginpage.usernamePlaceholder',
    defaultMessage: 'Username placeholder',
    description: 'Username input field placeholder when no value'
  },
  usernameTitle: {
    id: 'pages.login.loginpage.usernameTitle',
    defaultMessage: 'Username',
    description: 'Username input field title'
  },
  passwordTitle: {
    id: 'pages.login.loginpage.passwordTitle',
    defaultMessage: 'Password',
    description: 'Password input field title'
  },
  rememberMe: {
    id: 'pages.login.loginpage.rememberMe',
    defaultMessage: 'remember me',
    description: 'Text for remember checkbox'
  },
  backBtn: {
    id: 'pages.login.loginpage.backBtn',
    defaultMessage: 'Back',
    description: 'Back button'
  },
  loadingText: {
    id: 'pages.login.loginpage.loadingText',
    defaultMessage: 'Loading',
    description: 'Loading button'
  },
  forgot: {
    id: 'pages.login.loginpage.forgot',
    defaultMessage: 'forgot your {password_link}?',
    description: 'Forgot password'
  },
  passwordLink: {
    id: 'pages.login.loginpage.passwordLink',
    defaultMessage: 'password',
    description: 'Password link text'
  },
  resetBtn: {
    id: 'pages.login.loginpage.resetBtn',
    defaultMessage: 'Reset',
    description: 'Reset link text'
  },
  submitBtn: {
    id: 'pages.login.loginpage.submitBtn',
    defaultMessage: 'Submit',
    description: 'Submit link text'
  },
  failed: {
    id: 'pages.login.loginpage.error.failed',
    defaultMessage: 'Please check your credentials',
    description: 'Error message when lofgin filled'
  },
  imcomplete: {
    id: 'pages.login.loginpage.error.imcomplete',
    defaultMessage: 'Please fill all information',
    description: 'Error message when email or password not filled'
  }
});