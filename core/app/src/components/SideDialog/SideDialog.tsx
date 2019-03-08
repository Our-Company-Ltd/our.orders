import * as React from 'react';
import Slide, { SlideProps } from '@material-ui/core/Slide';
import { Dialog } from '@material-ui/core';
import { StyleRules, withStyles } from '@material-ui/core/styles';
import { OurTheme } from '../ThemeProvider/ThemeProvider';
import { DialogProps } from '@material-ui/core/Dialog';

const Transition: (direction: 'left' | 'right' | 'up' | 'down') =>
    React.FunctionComponent<SlideProps> = (direction) => (props) => {
        return <Slide direction={direction} {...props} />;
    };

const TransitionLeft = Transition('left');

type injectedClasses = 'dialogCls' | 'dialogScrollPaperCls';
export type InjectedSideDialogStylesProps = { classes: { [key in injectedClasses]: string } };

export const SideDialogStyles = (theme: OurTheme): StyleRules<injectedClasses> => ({

    dialogCls: {
        width: '50%',
        left: 'auto'
    },
    dialogScrollPaperCls: {
        justifyContent: 'flex-end'
    }
});

export type SideDialogProps = InjectedSideDialogStylesProps & DialogProps & {
    open: boolean
};
class SideDialog extends React.Component<SideDialogProps> {

    constructor(props: SideDialogProps) {
        super(props);
        
    }
    render() {
        const { classes: { dialogCls, dialogScrollPaperCls }, ...rest } = this.props;

        return (
            <Dialog
                {...rest}
                TransitionComponent={TransitionLeft}
                classes={{
                    paperFullScreen: dialogCls,
                    scrollPaper: dialogScrollPaperCls
                }}
                fullScreen={true}
            >
                {this.props.children}
            </Dialog>
        );
    }

}
export default React.memo(withStyles(SideDialogStyles)(SideDialog));