
import * as React from 'react';

import { Grid, TextField, WithStyles, withStyles, InputLabel, FormControl, Select, MenuItem } from '@material-ui/core';
import { InjectedIntlProps } from 'react-intl';
import DocumentTemplateDetailMessages from '../DocumentTemplateDetail/DocumentTemplateDetailMessages';
import { DocumentTemplate } from 'src/@types/our-orders';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import Dropzone from 'react-dropzone';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import { CheckCircle } from '@material-ui/icons';

type injectedClasses = 'drop' | 'dropAccepted' | 'dropRejected' | 'dropActive' | 'icon' | 'legend' | 'iconImage';
type TCategory = DocumentTemplate;

export type DocumentTemplateFieldsProps = InjectedIntlProps & WithStyles<injectedClasses> & {
    initial: TCategory;
    onChange: (shop: Partial<TCategory>) => void;
    changes: Partial<TCategory>;
};

class DocumentTemplateFields extends React.Component<DocumentTemplateFieldsProps> {
    constructor(props: DocumentTemplateFieldsProps) {
        super(props);

    }
    render() {
        return this._renderUser();
    }

    private _renderUser() {
        const { initial, changes, classes, intl, onChange } = this.props;
        const preview = { ...initial, ...changes } as TCategory;
        return (
            <GridContainer>
                <Grid item={true} xs={12}>
                    <TextField
                        fullWidth={true}
                        onChange={(e) => onChange({ Title: e.target.value })}
                        value={preview.Title || ''}
                        label={intl.formatMessage(DocumentTemplateDetailMessages.title)}
                    />
                </Grid>
                <Grid item={true} xs={12}>
                    <TextField
                        fullWidth={true}
                        multiline={true}
                        onChange={(e) => onChange({ Description: e.target.value })}
                        value={preview.Description || ''}
                        label={intl.formatMessage(DocumentTemplateDetailMessages.description)}
                    />
                </Grid>
                <Grid item={true} xs={6}>
                    <Dropzone
                        accept="text/html"
                        style={{}}
                        className={classes.drop}
                        acceptClassName={classes.dropAccepted}
                        activeClassName={classes.dropActive}
                        rejectClassName={classes.dropRejected}
                        onDrop={(acceptedFiles) => this._onDrop('Template', acceptedFiles)}
                    >
                        <div className={classes.icon}>
                            {preview.Template && <CheckCircle className={classes.iconImage} />}
                        </div>
                        <div className={classes.legend}>
                            {intl.formatMessage(DocumentTemplateDetailMessages.template)}
                        </div>
                    </Dropzone>
                </Grid>
                <Grid item={true} xs={6}>
                    <Dropzone
                        accept="text/css"
                        style={{}}
                        className={classes.drop}
                        acceptClassName={classes.dropAccepted}
                        activeClassName={classes.dropActive}
                        rejectClassName={classes.dropRejected}
                        onDrop={(acceptedFiles) => this._onDrop('Styles', acceptedFiles)}
                    >
                        <div className={classes.icon}>
                            {preview.Styles && <CheckCircle className={classes.iconImage} />}
                        </div>
                        <div className={classes.legend}>
                            {intl.formatMessage(DocumentTemplateDetailMessages.styles)}
                        </div>
                    </Dropzone>
                </Grid>
                <Grid item={true} xs={12}>
                    <FormControl fullWidth={true}>
                        <InputLabel>
                            {intl.formatMessage(DocumentTemplateDetailMessages.applyTo)}
                        </InputLabel>
                        <Select
                            fullWidth={true}
                            onChange={(e) => onChange({ ApplyTo: e.target.value })}
                            value={preview.ApplyTo || ''}
                        >
                            {['Order', 'Client', 'Payment'].map(c =>
                                <MenuItem key={c} value={c.toLowerCase()}>
                                    {intl.formatMessage(DocumentTemplateDetailMessages[c.toLowerCase()])}
                                </MenuItem>
                            )}
                            <MenuItem key="OrdersProducts" value="OrdersProducts">
                                {intl.formatMessage(DocumentTemplateDetailMessages.ordersProducts)}
                            </MenuItem>

                            {  // <MenuItem key="Orders" value="Orders">
                                //     {intl.formatMessage(DocumentTemplateDetailMessages.orders)}
                                // </MenuItem>
                            }
                        </Select>
                    </FormControl>
                </Grid>
            </GridContainer>);
    }

    private _onDrop(field: keyof DocumentTemplate, acceptedFiles: Blob[]) {
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
}))(DocumentTemplateFields);