import * as React from 'react';

import { WithStyles, withStyles, Avatar } from '@material-ui/core';
import { OurTheme } from '../ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import * as classNames from 'classnames';

type thumbInjectedClasses = 'root' | 'img' | 'loading';

export type ThumbProps =
    WithStyles<thumbInjectedClasses> &
    React.HTMLAttributes<HTMLDivElement> &
    {
        src?: string;
        loading?: boolean;
    };

class ThumbWithStyles extends React.Component<ThumbProps> {
    render() {
        const { src, classes, children, loading, className, ...divprops } = this.props;
        return (
            <Avatar
                src={src}
                className={classNames(classes.root, !!loading && classes.loading, className)}
                {...divprops}
            >
                {children}
            </Avatar>
        );
    }
}
export const Thumb = withStyles((theme: OurTheme): StyleRules<thumbInjectedClasses> => ({
    root: {
        flexGrow: 0,
        flexShrink: 0
    },
    loading: {
        backgroundColor: theme.Colors.gray.primary.main
    },
    img: {}
})
)(ThumbWithStyles);

type lineInjectedClasses = 'root' | 'loading' | 'empty' | 'title';

export type LineProps =
    WithStyles<lineInjectedClasses> &
    React.HTMLAttributes<HTMLDivElement> &
    {

        loading?: boolean;
        empty?: boolean;
        isTitle?: boolean;

    };

export class LineWithStyles extends React.Component<LineProps> {
    render() {
        const { classes, children, loading, empty, isTitle: title, className, ...divprops } = this.props;

        return (
            <div
                className={
                    classNames(
                        classes.root, 
                        !!loading && classes.loading, 
                        !!empty && classes.empty, 
                        !!title && classes.title,
                        className)
                }
                {...divprops}
            >
                {children}
            </div>
        );
    }
}
export const Line = withStyles((theme: OurTheme): StyleRules<lineInjectedClasses> => ({
    root: {
        lineHeight: '1.2rem',
        minHeight: '1.2rem',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    loading: {
        '&:after': {
            content: '',
            backgroundColor: theme.Colors.gray.primary.main,
            width: '4rem',
            height: '1rem',
            margin: '0.1rem 0',
            display: 'inline-block'
        },
        '&:first-child:after': {
            width: '6rem'
        }
    },
    empty: {

        minWidth: '1px',
        fontStyle: 'italic',
        color: theme.Colors.gray.primary.main

    },
    title: {
        color: theme.palette.text.primary
    }
})
)(LineWithStyles);

type linesInjectedClasses = 'root' | 'actions';
export type LinesProps =
    WithStyles<linesInjectedClasses> &
    React.HTMLAttributes<HTMLDivElement> &
    {
        actions?: boolean;
    };

class LinesWithStyles extends React.Component<LinesProps> {
    render() {
        const { classes, children, actions, className, ...divprops } = this.props;
        
        return (
            <div
                className={
                    classNames(classes.root, !!actions && classes.actions, className)
                }
                {...divprops}
            >
            {children}
            </div>
        );
    }
}
export const Lines = withStyles((theme: OurTheme): StyleRules<linesInjectedClasses> => ({
    root: {
        flexGrow: 1,
        flexShrink: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        overflow: 'hidden',
        color: theme.Colors.gray.primary.dark,
        fontSize: '0.8rem'
    },
    actions: {
        textAlign: 'right',
        flexShrink: 0,
        minWidth: '1px',
    }
})
)(LinesWithStyles);

type itemPreviewCls = 'main' | 'active' | 'noDividers';

export type ItemPreviewProps =
    React.HTMLAttributes<HTMLDivElement> &
    WithStyles<itemPreviewCls> &
    {
        active?: boolean;
        noDividers?: boolean;
    };

export class ItemPreview extends React.Component<ItemPreviewProps> {
    constructor(props: ItemPreviewProps) {
        super(props);
    }

    render() {
        const { active, noDividers, classes, ...divprops } = this.props;

        return (
            <div
                className={
                    classNames(
                        classes.main,
                        active && classes.active,
                        noDividers && classes.noDividers)}
                {...divprops}
            >
                {this.props.children}
            </div>
        );
    }

}

export default withStyles((theme: OurTheme): StyleRules<itemPreviewCls> => {
    return {
        main: {
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'nowrap',
            alignItems: 'center',
            minHeight: '4.4rem',
            padding: '.7rem 0',
            boxSizing: 'border-box',
            position: 'relative',
            color: 'black',

            '&:after': {
                content: '""',
                position: 'absolute',
                height: 1,
                bottom: 0,
                left: 0,
                right: 0,
                background: '#eee',
            },

            '&:before': {
                content: '""',
                position: 'absolute',
                height: 1,
                bottom: 0,
                left: '50%',
                width: 0,
                background: 'blue',
                transform: 'translateX(-50%)',
                transition: 'width 0.2s ease-in-out',
                zIndex: 1
            },

            '& > *': {
                marginRight: '.7rem',

                '&:last-child': {
                    marginRight: 0
                }
            }
        },
        active: {
            color: theme.Colors.white.primary.dark
        },
        noDividers: {
            '&:after': {
                content: 'initial'
            },

            '&:before': {
                content: 'initial'
            },
        }
    };
})(ItemPreview);