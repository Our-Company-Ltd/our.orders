
import * as React from 'react';

import { Grid, TextField, WithStyles, withStyles, InputLabel, FormControl, Select, MenuItem } from '@material-ui/core';
import { InjectedIntlProps } from 'react-intl';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import Dropzone from 'react-dropzone';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import { CheckCircle } from '@material-ui/icons';
import { PaymentNotificationTemplate } from 'src/@types/our-orders/PaymentNotificationTemplate';
import NotificationsMessages from '../NotificationsDetail/NotificationsMessages';
import { InjectedSettingsProps, withSettings } from 'src/_context';
import { PaymentStatus, PaymentMethod } from 'src/@types/our-orders';

type injectedClasses = 'drop' | 'dropAccepted' | 'dropRejected' | 'dropActive' | 'icon' | 'legend' | 'iconImage';
type TCategory = PaymentNotificationTemplate;

export type NotificationsFieldsProps = InjectedIntlProps & InjectedSettingsProps & WithStyles<injectedClasses> & {
    initial: TCategory;
    onChange: (notification: Partial<TCategory>) => void;
    changes: Partial<TCategory>;
};

class NotificationsFields extends React.Component<NotificationsFieldsProps> {
    constructor(props: NotificationsFieldsProps) {
        super(props);

    }
    render() {
        return this._renderUser();
    }

    private _renderUser() {
        const {
            initial,
            changes,
            classes,
            intl,
            onChange,
            settingsCtx: { Settings: { PaymentProviders } } } = this.props;
        const preview = { ...initial, ...changes } as TCategory;
        return (
            <GridContainer>
                <Grid item={true} xs={12}>
                    <TextField
                        fullWidth={true}
                        onChange={(e) => onChange({ Title: e.target.value })}
                        value={preview.Title || ''}
                        label={intl.formatMessage(NotificationsMessages.title)}
                    />
                </Grid>
                <Grid item={true} xs={12}>
                    <TextField
                        fullWidth={true}
                        multiline={true}
                        onChange={(e) => onChange({ Description: e.target.value })}
                        value={preview.Description || ''}
                        label={intl.formatMessage(NotificationsMessages.description)}
                    />
                </Grid>
                <Grid item={true} xs={12}>
                    <Dropzone
                        accept="text/html"
                        style={{}}
                        className={classes.drop}
                        acceptClassName={classes.dropAccepted}
                        activeClassName={classes.dropActive}
                        rejectClassName={classes.dropRejected}
                        onDrop={(acceptedFiles) => this._onDrop('Body', acceptedFiles)}
                    >
                        <div className={classes.icon}>
                            {preview.Body && <CheckCircle className={classes.iconImage} />}
                        </div>
                        <div className={classes.legend}>
                            {intl.formatMessage(NotificationsMessages.body)}
                        </div>
                    </Dropzone>
                </Grid>
                <Grid item={true} xs={12}>
                    <TextField
                        fullWidth={true}
                        onChange={(e) => onChange({ Subject: e.target.value })}
                        value={preview.Subject || ''}
                        label={intl.formatMessage(NotificationsMessages.subject)}
                    />
                </Grid>
                <Grid item={true} xs={12}>
                    <FormControl fullWidth={true}>
                        <InputLabel>
                            {intl.formatMessage(NotificationsMessages.provider)}
                        </InputLabel>
                        <Select
                            fullWidth={true}
                            onChange={(e) => onChange({ Provider: e.target.value })}
                            value={preview.Provider || ''}
                        >
                            <MenuItem key="all" value={undefined}>
                                {intl.formatMessage(NotificationsMessages.allPaymentProviders)}
                            </MenuItem>
                            {PaymentProviders.map(p =>
                                <MenuItem key={p} value={p}>
                                    {p.toLowerCase()}
                                </MenuItem>
                            )}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item={true} xs={12}>
                    <FormControl fullWidth={true}>
                        <InputLabel>
                            {intl.formatMessage(NotificationsMessages.status)}
                        </InputLabel>
                        <Select
                            fullWidth={true}
                            onChange={(e) => onChange({ Status: e.target.value as PaymentStatus })}
                            value={preview.Status || ''}
                        >
                            {
                                ['Pending', 'Canceled', 'Failed', 'Paid'].map(c =>
                                    <MenuItem key={c} value={c}>
                                        {intl.formatMessage(NotificationsMessages[c.toLowerCase()])}
                                    </MenuItem>
                                )
                            }
                        </Select>
                    </FormControl>
                </Grid>

                <Grid item={true} xs={12}>
                    <FormControl fullWidth={true}>
                        <InputLabel>
                            {intl.formatMessage(NotificationsMessages.method)}
                        </InputLabel>
                        <Select
                            fullWidth={true}
                            onChange={(e) => onChange({
                                Method: e.target.value === '' ? undefined : e.target.value as PaymentMethod
                            })}
                            value={preview.Method || ''}
                        >
                            <MenuItem key="all" value="">
                                {intl.formatMessage(NotificationsMessages.allPaymentMethods)}
                            </MenuItem>
                            {['Electronic', 'Cash', 'Voucher'].map(c =>
                                <MenuItem key={c} value={c}>
                                    {intl.formatMessage(NotificationsMessages[c.toLowerCase()])}
                                </MenuItem>
                            )}
                        </Select>
                    </FormControl>
                </Grid>
            </GridContainer>);
    }

    private _onDrop(field: keyof PaymentNotificationTemplate, acceptedFiles: Blob[]) {
        const first = acceptedFiles[0];
        if (!first) { return; }
        const reader = new FileReader();
        reader.onload = () => {
            if (reader.result) {
                this.props.onChange({ [field]: reader.result as string });
            }
        };
        // tslint:disable-next-line:no-console
        reader.onabort = () => console.log('file reading was aborted');
        // tslint:disable-next-line:no-console
        reader.onerror = () => console.log('file reading has failed');

        reader.readAsText(first, 'utf-8');
    }
}

export default withStyles((theme: OurTheme): StyleRules<injectedClasses> => ({
    drop: {
        display: 'inline-flex',
        position: 'relative',
        width: '100%',
        marginTop: 16,
        color: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',

        '&:before': {
            content: '""',
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            borderBottom: '1px solid rgba(0, 0, 0, 0.5)',
        },

        '&:hover:before': {
            borderBottomWidth: 2,
            borderBottom: '1px solid rgba(0, 0, 0, 0.87)',
        }
    },
    dropActive: {
        color: theme.Colors.green.primary.contrastText
    },
    dropAccepted: {
        color: theme.Colors.green.primary.main,
        '&:hover:before': {
            borderBottomWidth: 2,
            borderColor: theme.Colors.green.primary.main,
        }
    },
    dropRejected: {
        color: theme.Colors.red.primary.main,
        '&:hover:before': {
            borderBottomWidth: 2,
            borderColor: theme.Colors.red.primary.main,
        }
    },
    icon: {
        height: '0.01em',
        display: 'flex',
        maxHeight: '2em',
        alignItems: 'center',
        color: 'inherit'
    },
    legend: {
        padding: '6px 0 7px',
        color: 'inherit'
    },
    iconImage: {
        marginRight: theme.spacing.unit
    }
}))(withSettings(NotificationsFields));