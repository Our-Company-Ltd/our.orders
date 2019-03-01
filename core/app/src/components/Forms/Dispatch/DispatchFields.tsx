import * as React from 'react';

import {
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Avatar,
    WithStyles,
    IconButton,
    withStyles
} from '@material-ui/core';
import TextField from '@material-ui/core/TextField';

// import '../styles.css';

import ItemPreview, { Lines, Line, Thumb } from '../../ItemPreview/ItemPreview';
import { InjectedIntlProps, injectIntl } from 'react-intl';

import DispatchFieldsMessages from './DispatchFieldsMessages';
import { DateTimePicker } from 'material-ui-pickers';
import { Dispatch, DispatchMethod, DispatchStatus } from 'src/@types/our-orders';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import {
    LocalShipping,
    HowToVote,
    Check,
    HighlightOff,
    QueryBuilder,
    MoreHoriz,
    Close,
    Delete
} from '@material-ui/icons';
import * as classNames from 'classnames';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';

type injectedClasses =
    'svgIcon' |
    'svgIconRemove' |
    'title' |
    'date';

export type DispatchFieldsProps =
    WithStyles<injectedClasses> &
    InjectedIntlProps & {
        onChange: (changes: Partial<Dispatch>) => void;
        initial: Dispatch;
        preview: Dispatch;
        changes: Partial<Dispatch>;
        hasRights: boolean;

        onRequestRemove: () => void;
    };

type State = {
    open: boolean;
};
export class DispatchFields extends React.Component<DispatchFieldsProps, State> {
    constructor(props: DispatchFieldsProps) {
        super(props);

        this._open = this._open.bind(this);
        this._close = this._close.bind(this);
        this._handleDelete = this._handleDelete.bind(this);

        this.state = {
            open: false
        };
    }
    render(): React.ReactElement<HTMLDivElement> {
        const initial: Partial<Dispatch> = this.props.initial || {};
        const changes: Partial<Dispatch> = this.props.changes || {};

        const current = { ...initial, ...changes };

        const { intl, onChange, classes, hasRights } = this.props;

        const dateOptions = {
            weekday: 'short',
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        };
        const date = current.Date ? this.props.intl.formatDate(new Date(current.Date), dateOptions) : '';

        const empty = Object.keys(changes).length === 0;

        const actionDelete = hasRights ? (
            <IconButton
                color="default"
                onClick={e => (e.preventDefault(), e.stopPropagation(), this.props.onRequestRemove())}
            >
                <Close className={classNames(classes.svgIcon, classes.svgIconRemove)} />
            </IconButton>) : null;

        const { open } = this.state;

        const previewLine = empty ?
            (

                <ItemPreview
                    onClick={this._open}
                >
                    <Thumb loading={true} />
                    <Lines>
                        <Line loading={true} />
                        <Line loading={true} />
                    </Lines>
                </ItemPreview>
            ) : (

                <ItemPreview
                    onClick={this._open}
                >
                    <Avatar>
                        {current.Status && this._getDispatchStatusIcon(current.Status)}
                    </Avatar>
                    <Lines>
                        <Line>
                            <span className={classes.title}>{current.Method}</span>
                            {date && <span className={classes.date}>{date}</span>}
                        </Line>
                        <Line />
                    </Lines>
                    <Lines actions={true}>
                        <Line />
                        <Line>
                            {actionDelete}
                        </Line>
                    </Lines>
                </ItemPreview>
            );

        return (
            <React.Fragment>
                {previewLine}
                <Dialog
                    {...{ open }}
                    onClose={this._close}
                >
                    <DialogTitle>Dispatch Information</DialogTitle>
                    <DialogContent>
                        <GridContainer spacing={16}>
                            <Grid item={true} xs={4}>
                                <FormControl fullWidth={true}>
                                    <InputLabel htmlFor="DispatchMethod">
                                        {intl.formatMessage(DispatchFieldsMessages.method)}
                                    </InputLabel>
                                    <Select
                                        fullWidth={true}
                                        value={current.Method || ''}
                                        disabled={!hasRights}
                                        onChange={(e) =>
                                            this.props.onChange({
                                                ...changes,
                                                Method: e.target.value as DispatchMethod
                                            })}
                                        inputProps={{
                                            name: 'DispatchMethod',
                                            id: 'DispatchMethod',
                                        }}
                                    >
                                        {[
                                            { preview: 'Electronic', value: 'Electronic' },
                                            { preview: 'Pickup', value: 'Pickup' },
                                            { preview: 'Courier', value: 'Courier' },
                                            { preview: 'Post', value: 'Post' }
                                        ].map(dispatchMethod => (
                                            <MenuItem key={dispatchMethod.value} value={dispatchMethod.value}>
                                                {dispatchMethod.preview}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item={true} xs={4}>
                                <FormControl fullWidth={true}>
                                    <InputLabel htmlFor="DispatchStatus">
                                        {intl.formatMessage(DispatchFieldsMessages.status)}
                                    </InputLabel>
                                    <Select
                                        fullWidth={true}
                                        value={current.Status || ''}
                                        disabled={!hasRights}
                                        onChange={(e) =>
                                            this.props.onChange({
                                                ...changes,
                                                Status: e.target.value as DispatchStatus
                                            })}
                                        inputProps={{
                                            name: 'DispatchStatus',
                                            id: 'DispatchStatus',
                                        }}
                                    >
                                        {[
                                            { preview: 'Init', value: 'Init' },
                                            { preview: 'Preparing', value: 'Preparing' },
                                            { preview: 'Ready for delivery', value: 'ReadyForDelivery' },
                                            { preview: 'En route', value: 'EnRoute' },
                                            { preview: 'Undeliverable', value: 'Undeliverable' },
                                            { preview: 'Delivered', value: 'Delivered' }
                                        ].map(dispatchStatus => (
                                            <MenuItem key={dispatchStatus.value} value={dispatchStatus.value}>
                                                {dispatchStatus.preview}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item={true} xs={4}>
                                <DateTimePicker
                                    fullWidth={true}
                                    keyboard={true}
                                    format="dd/MM/yyyy HH:mm"
                                    mask={(value: string) =>
                                        // tslint:disable-next-line:max-line-length
                                        (value ? [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, / /, /\d/, /\d/, /\:/, /\d/, /\d/] : [])}
                                    value={current.Date ? new Date(current.Date) : new Date()}
                                    onChange={(value: Date) =>
                                        this.props.onChange({
                                            ...changes,
                                            Date: value
                                        })}
                                    disableOpenOnEnter={true}
                                    animateYearScrolling={false}
                                    label="Date"
                                    disabled={!hasRights}
                                />
                            </Grid>
                            <Grid item={true} xs={12}>
                                <TextField
                                    onChange={(e) => onChange({ ...changes, Notes: e.target.value })}
                                    value={current.Notes || ''}
                                    multiline={true}
                                    fullWidth={true}
                                    label={intl.formatMessage(DispatchFieldsMessages.notes)}
                                    disabled={!hasRights}
                                />
                            </Grid>
                        </GridContainer>
                    </DialogContent>
                    <DialogActions>
                        {hasRights && <Button color="secondary" variant="contained" onClick={this._handleDelete}>
                            <Delete />
                            delete
                        </Button>}
                        <Button color="default" variant="contained" onClick={this._close}>close</Button>
                    </DialogActions>
                </Dialog>
            </React.Fragment>);
    }

    private _handleDelete() {
        this.props.onRequestRemove();
        this.setState(() => ({ open: false }));
    }

    private _open() {
        this.setState({ open: true });
    }

    private _close() {
        this.setState({ open: false });
    }

    private _getDispatchStatusIcon(dispatchStatus: DispatchStatus) {
        switch (dispatchStatus) {
            case 'Undeliverable':
                return <HighlightOff />;
            case 'Delivered':
                return <Check />;
            case 'Init':
                return <MoreHoriz />;
            case 'Pending':
                return <QueryBuilder />;
            case 'Preparing':
                return <HowToVote />;
            case 'ReadyForDelivery':
                return <LocalShipping />;
            case 'EnRoute':
                return <LocalShipping />;
            default:
                return;
        }
    }
}

export default withStyles((theme: OurTheme): StyleRules<injectedClasses> => {
    return {
        svgIcon: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
        },
        svgIconRemove: {
            fontSize: '1rem'
        },
        title: {
            marginRight: '.5rem',
            color: theme.palette.text.primary
        },
        date: {
            marginRight: '.5rem'
        }
    };
})(injectIntl(DispatchFields));