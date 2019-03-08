import { defineMessages } from 'react-intl';

export const SetupPageMessages = defineMessages({
  title: {
    id: 'pages.login.loginpage.title',
    defaultMessage: 'Setup',
    description: 'Setup screen main title'
  },
  usernamePlaceholder: {
    id: 'pages.login.loginpage.usernamePlaceholder',
    defaultMessage: 'Username placeholder',
    description: 'Username input field placeholder when no value'
  },
  username: {
    id: 'pages.login.loginpage.username',
    defaultMessage: 'UserName',
    description: 'UserName input field title'
  },
  passwordTitle: {
    id: 'pages.login.loginpage.passwordTitle',
    defaultMessage: 'Password',
    description: 'Password input field title'
  },
  confirmPasswordTitle: {
    id: 'pages.login.loginpage.confirmPasswordTitle',
    defaultMessage: 'Confirm password',
    description: 'Confirm password input field title'
  },
  email: {
    id: 'pages.login.loginpage.email',
    defaultMessage: 'Email',
    description: 'Email input field title'
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
    description: 'Error message when login filled'
  },
  incomplete: {
    id: 'pages.login.loginpage.error.incomplete',
    defaultMessage: 'Please fill all information',
    description: 'Error message when email or password not filled'
  }
});