import { defineMessages } from 'react-intl';

export default defineMessages({
  mainTitle: {
    id: 'pages.register.registerpage.mainTitle',
    defaultMessage: 'Register',
    description: 'mainTitle'
  },
  
  passwordTitle: {
    id: 'pages.register.registerpage.passwordTitle',
    defaultMessage: 'Password',
    description: 'Password input field title'
  },

  confirmPasswordTitle: {
    id: 'pages.register.registerpage.passwordTitle',
    defaultMessage: 'Password',
    description: 'Password input field title'
  },
  backBtn: {
    id: 'pages.register.registerpage.backBtn',
    defaultMessage: 'Back',
    description: 'Back button'
  },
  loadingText: {
    id: 'pages.register.registerpage.loadingText',
    defaultMessage: 'Loading',
    description: 'Loading button'
  },
  forgot: {
    id: 'pages.register.registerpage.forgot',
    defaultMessage: 'forgot your {password_link}?',
    description: 'Forgot password'
  },
  passwordLink: {
    id: 'pages.register.registerpage.passwordLink',
    defaultMessage: 'password',
    description: 'Password link text'
  },
  resetBtn: {
    id: 'pages.register.registerpage.resetBtn',
    defaultMessage: 'Reset',
    description: 'Reset link text'
  },
  submitBtn: {
    id: 'pages.register.registerpage.submitBtn',
    defaultMessage: 'Submit',
    description: 'Submit link text'
  },
  failed: {
    id: 'pages.register.registerpage.error.failed',
    defaultMessage: 'Please check your credentials',
    description: 'Error message when lofgin filled'
  },
  incomplete: {
    id: 'pages.register.registerpage.error.incomplete',
    defaultMessage: 'Please fill all information',
    description: 'Error message when email or password not filled'
  },
  different: {
    id: 'pages.register.registerpage.error.different',
    defaultMessage: 'Different password and confirm',
    description: 'Error message when password different'
  }
});