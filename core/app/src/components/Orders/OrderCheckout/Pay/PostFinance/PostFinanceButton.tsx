import * as React from 'react';
import { Order } from 'src/@types/our-orders';
import { GetFormPostFinance, PostFinanceFormResponse } from './Services';
import {
    withStyles,
    WithStyles,
    ButtonBase,
    DialogTitle,
    DialogContent,
    DialogActions
} from '@material-ui/core';

import Button, { ButtonProps } from '@material-ui/core/Button';
import PostFinanceIcon from './PostFinanceIcon';
import PayBtnStyles, { PayBtnClasses } from '../../OrderCheckoutBtnStyles';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import createPalette from '@material-ui/core/styles/createPalette';
import SideDialog from 'src/components/SideDialog/SideDialog';

export type PostFinanceButtonProps = WithStyles<PayBtnClasses | 'iframe' | 'paper' | 'dialogPaper'> & {
    order: Order;
    buttonProps?: ButtonProps;
    refresh: () => void;
    onChange: (changes: Partial<Order>) => void;
};

type State = {
    loading?: boolean;
    open: boolean;
    current?: PostFinanceFormResponse;
};

class PostFinanceButton extends React.Component<PostFinanceButtonProps, State> {
    private _formContainer: React.RefObject<HTMLIFrameElement>;
    constructor(props: PostFinanceButtonProps) {
        super(props);
        this._formContainer = React.createRef<HTMLIFrameElement>();
        this._request = this._request.bind(this);
        this._handleOpen = this._handleOpen.bind(this);
        this._handleClose = this._handleClose.bind(this);

        this.state = {
            loading: false,
            open: false
        };
    }

    render() {
        const { classes } = this.props;
        return (
            <React.Fragment>
                <ButtonBase
                    focusRipple={true}
                    onClick={this._handleOpen}
                    classes={{ root: classes.buttonBase }}
                >
                    <PostFinanceIcon className={classes.btnIcon} />
                    <span className={classes.btnText}>
                        Post Finance
                    </span>
                </ButtonBase>
                {this._renderLightbox()}
            </React.Fragment>
        );
    }
    componentDidUpdate() {
        const { current, open } = this.state;

        if (this._formContainer && this._formContainer.current && open && current) {
            var modalContent = this._formContainer!.current!.contentWindow!.document.body;

            const form = document.createElement('form');
            modalContent.appendChild(form);

            form.action = current.action;

            if (current.method) {
                form.method = current.method;
            }
            for (var name in current.param) {
                if (!current.param.hasOwnProperty(name)) { continue; }
                const f = document.createElement('input');
                f.type = 'hidden';
                f.name = name;
                f.value = current.param[name];
                form.appendChild(f);
            }
            // form.target = '_blank';
            form.submit();
            this.setState(() => ({ current: undefined }));
        }
    }
    private _request() {

        GetFormPostFinance(this.props.order).then(response => {
            this.setState(() => ({ current: response }));
        });
    }
    private _handleOpen() {
        this.setState(() => ({ open: true }), this._request);
    }
    private _handleClose() {
        this.setState(() => ({ open: false }), this.props.refresh);
    }

    private _renderLightbox() {
        const { classes } = this.props;
        const { open } = this.state;
        return (
            <SideDialog
                open={!!open}
                onClose={this._handleClose}
                classes={{ dialogCls: classes.dialogPaper}}
            >
                <DialogTitle id="form-dialog-title">Pay with Post Finance</DialogTitle>
                <DialogContent style={{ height: '100%' }}>
                    <iframe className={classes.iframe} ref={this._formContainer} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={this._handleClose} color="primary" variant="contained">
                        Done
                    </Button>
                </DialogActions>
            </SideDialog>);
    }
    // private _charge() {
    //     const { cc, cvc, exp } = this.state;
    //     if (!cc || !cvc || !exp) { return; }

    //     ChargePostFinance(this.props.order, cc, cvc, exp)
    //         .then(payment =>
    //             this.props.onChange({ Payments: [...this.props.order.Payments, payment] }));
    // }

}

export default withStyles((theme: OurTheme) =>
    ({
        ...PayBtnStyles(theme, createPalette({ primary: { main: '#fc0', contrastText: '#ffffff' } })),
        iframe: {
            width: '100%',
            display: 'block',
            height: '100%',
            background: '#FFCC00'
        },
        dialogPaper: {
            background: '#FFCC00'
        }
    })
)(PostFinanceButton);