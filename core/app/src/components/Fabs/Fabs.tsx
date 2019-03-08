import * as React from 'react';
import Fab, { FabProps } from '@material-ui/core/Fab';
import { Tooltip, withStyles } from '@material-ui/core';
import { MuiThemeProvider, withTheme, WithTheme, StyleRules, WithStyles } from '@material-ui/core/styles';

import * as classNames from 'classnames';
import { OurColors, OurTheme } from '../ThemeProvider/ThemeProvider';
import { Cached } from '@material-ui/icons';

export type FabBtnProps = FabProps & {
  icon: React.ReactNode;
  themeColor?: OurColors;
  legend?: string;
  secondary?: boolean;
};

type injectedFabBtnClasses = 'tooltip' | 'btn' | OurColors;

export const FabBtn: React.ComponentType<FabBtnProps> = withTheme()(
  withStyles((theme: OurTheme): StyleRules<injectedFabBtnClasses> =>
    ({
      btn: {
        margin: '.5rem'
      },
      tooltip: {
        background: theme.palette.common.white,
        color: theme.palette.text.primary,
        boxShadow: theme.shadows[1],
        fontSize: 11,
      },
      blue: {
        '&:hover': {
          background: theme.Colors.blue.primary.main,
          color: theme.Colors.blue.primary.contrastText,
        }
      },
      gray: {
        '&:hover': {
          background: theme.Colors.gray.primary.main,
          color: theme.Colors.gray.primary.contrastText,
        }
      },
      green: {
        '&:hover': {
          background: theme.Colors.green.primary.main,
          color: theme.Colors.green.primary.contrastText,
        }
      },
      orange: {
        '&:hover': {
          background: theme.Colors.orange.primary.main,
          color: theme.Colors.orange.primary.contrastText,
        }
      },
      red: {
        '&:hover': {
          background: theme.Colors.red.primary.main,
          color: theme.Colors.red.primary.contrastText,
        }
      },
      white: {
        '&:hover': {
          background: theme.Colors.white.primary.main,
          color: theme.Colors.white.primary.contrastText,
        }
      }
    }))
    (
      (props: FabBtnProps & WithStyles<injectedFabBtnClasses> & WithTheme) => {

        const {
          icon,
          legend,
          secondary,
          classes,
          themeColor, theme, ...overidefabProps } = props;

        const fabProps: FabProps = {
          size: secondary ? 'small' : 'large',
          color: 'primary',
          ...overidefabProps,
          className: classNames(classes.btn, overidefabProps.className, { [classes[themeColor || 'white']]: secondary })
        };

        let btn = (
          <Fab {...fabProps} >
            {icon}
          </Fab>);

        if (legend) {
          btn = (
            <Tooltip placement="left" title={legend} aria-label={legend} classes={{ tooltip: classes.tooltip }}>
              {btn}
            </Tooltip>);
        }
        const palette = secondary ?
          (theme as OurTheme).Colors.white :
          (theme as OurTheme).Colors[themeColor || 'white'];
        btn = (
          <MuiThemeProvider theme={{ ...theme, palette }}>
            {btn}
          </MuiThemeProvider>);

        return btn;
      }));

type injectedFabsClasses = 'container' | 'loading' | '@keyframes loading-rotate';
export type FabsProps = WithStyles<injectedFabsClasses> & {
  map: (FabBtnProps | 'loading' | boolean | undefined | 0 | null)[];
};

class Fabs extends React.Component<FabsProps> {

  render() {
    const { map, classes } = this.props;

    const loading: FabBtnProps = {
      icon: <Cached classes={{ root: classes.loading }} />,
      legend: 'loading',
      themeColor: 'gray',
      color: 'primary'
    };

    const btns = map.filter(m => m).map(m => m === 'loading' ? loading : m);
    return (
      <div className={classes.container}>
        {btns.map((b: FabBtnProps, i) =>
          <FabBtn
            key={i}
            {...{ ...b, secondary: i !== 0 }}
          />)
        }
      </div>);
  }
}

export default withStyles((theme: OurTheme): StyleRules<injectedFabsClasses> =>
  ({
    container: {
      position: 'absolute',
      bottom: '1rem',
      right: '0',
      display: 'flex',
      flexDirection: 'column-reverse',
      alignItems: 'center',
      zIndex: theme.zIndex.appBar,

    },
    '@keyframes loading-rotate': {
      'from': {
        transform: 'rotate(0deg)'
      },
      'to': {
        transform: 'rotate(-360deg)'
      }
    },
    loading: {
      animation: `loading-rotate 1500ms linear infinite`,

    }
  }))(Fabs);
