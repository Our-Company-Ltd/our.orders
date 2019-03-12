import * as React from 'react';

import { Clients } from '../../../_services';
import { Client } from 'src/@types/our-orders';

import {
    withStyles,
    WithStyles,
    ListItem,
    TextField,
    Grid,
    MenuItem,
    Button,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    FormControlLabel,
    Switch,
} from '@material-ui/core';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import Dropzone from 'react-dropzone';
import { InjectedNotistackProps, withSnackbar } from 'notistack';
import { InjectedIntlProps } from 'react-intl';
import { CloudDownload } from '@material-ui/icons';
import ClientImportMessages from './ClientImportMessages';
import * as classNames from 'classnames';

export type injectedClasses =
    'dropZoneContainer' |
    'dropZoneContainerHide' |
    'dropZone' |
    'dropZoneLabel' |
    'dropZoneNoImage' |
    'container' |
    'tooltip' |
    'delimiter' |
    'listContent' |
    'headerRecord' |
    'row' |
    'rowLegend' |
    'rowInput';
export type ClientImportProps =
    InjectedIntlProps &
    InjectedNotistackProps &
    WithStyles<injectedClasses> &
    {
        close: () => void;
        refresh: () => void;
    };

type State = {
    headers?: { [property: string]: number };
    firstLine?: string[];
    file?: Blob;
    hasHeaderRecord: boolean;
    delimiter: string;
};
const ClientFields: Array<keyof Client> = [
    'Address',
    'CellPhone',
    'City',
    'CountryIso',
    'Creation',
    'Email',
    'FirstName',
    'Id',
    'LastMod',
    'LastName',
    'OrganizationName',
    'Phone',
    'PostalCode',
    'State',
    'VATNumber'
];
class ClientImport extends React.Component<ClientImportProps, State> {
    constructor(props: ClientImportProps) {
        super(props);
        this._onDrop = this._onDrop.bind(this);
        this._import = this._import.bind(this);
        this.state = {
            hasHeaderRecord: true,
            delimiter: ','
        };
    }

    render() {
        const {
            headers,
            file,
            firstLine,
            hasHeaderRecord,
            delimiter,
        } = this.state;
        const {
            classes,
            intl
        } = this.props;

        return (
            <React.Fragment>
                <DialogTitle id="draggable-dialog-title">Subscribe</DialogTitle>
                <DialogContent>
                    <GridContainer className={classes.container} spacing={0}>
                        <Grid
                            item={true}
                            className={classNames(
                                classes.dropZoneContainer, 
                                firstLine && headers && classes.dropZoneContainerHide)}
                        >
                            <Dropzone
                                className={classes.dropZone}
                                onDrop={this._onDrop}
                            >
                                <Button className={classes.dropZoneLabel}>
                                    <CloudDownload />
                                </Button>
                            </Dropzone>
                        </Grid>
                        {firstLine && headers &&
                            <Grid
                                item={true}
                                className={classes.headerRecord}
                            >
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={hasHeaderRecord}
                                            onChange={(e) => {
                                                const v = e.target.checked;
                                                this.setState(() => ({ hasHeaderRecord: v }));
                                            }}
                                            color="primary"
                                        />}
                                    label="first record is headers values"
                                />
                            </Grid>
                        }
                        {firstLine && headers &&
                            <Grid
                                item={true}
                                className={classes.delimiter}
                            >
                                <TextField
                                    select={true}
                                    label="CSV delimiter"
                                    fullWidth={true}
                                    value={delimiter}
                                    onChange={(value) => {
                                        const v = value.target.value;
                                        this.setState(
                                            () => ({ delimiter: v }),
                                            () => this._RefreshHeaders()
                                        );
                                    }}
                                >
                                    <MenuItem key="," value=",">
                                        comma (,)
                                </MenuItem>
                                    <MenuItem key=";" value=";">
                                        semicolon (;)
                                </MenuItem>
                                </TextField>
                            </Grid>
                        }
                        {firstLine && headers && (
                            <Grid
                                item={true}
                                className={classes.listContent}
                            >
                                <List>
                                    {ClientFields.map((prop, i) => (
                                        <ListItem
                                            key={`${prop}-${i}`}
                                            className={classes.row}
                                        >
                                            <div className={classes.rowLegend}>{prop}:</div>
                                            <div className={classes.rowInput}>
                                                <TextField
                                                    select={true}
                                                    label="CSV Header"
                                                    fullWidth={true}
                                                    value={headers[prop] === undefined ? -1 : headers[prop]}
                                                    onChange={(value) => {
                                                        const v = parseInt(value.target.value, 10);
                                                        const { [prop]: old, ...newHeaders } = headers;
                                                        if (v >= 0) {
                                                            newHeaders[prop] = v;
                                                        }
                                                        this.setState(
                                                            () => ({
                                                                headers: newHeaders
                                                            })
                                                        );
                                                    }}
                                                >
                                                    {firstLine.map((h, j) => (
                                                        <MenuItem key={h} value={j}>
                                                            column {j} ({h})
                                                    </MenuItem>))}
                                                    <MenuItem key="--none--" value={-1}>
                                                        Do not import
                                                </MenuItem>
                                                </TextField>
                                            </div>
                                        </ListItem>
                                    ))}
                                </List>
                            </Grid>)
                        }
                    </GridContainer>
                </DialogContent>
                <DialogActions>
                    {firstLine && headers &&
                        <Dropzone
                            onDrop={this._onDrop}
                        >
                            <Button
                                color="primary"
                            >
                                {intl.formatMessage(ClientImportMessages.loadMore)}
                            </Button>
                        </Dropzone>}
                    <Button
                        onClick={this.props.close}
                        color="primary"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={this._import}
                        color="primary"
                        disabled={!headers || !file}
                    >
                        Import
                    </Button>
                </DialogActions>
            </React.Fragment >
        );
    }
    private _GetHeaders(file: Blob): Promise<string[]> {
        const { delimiter } = this.state;
        return new Promise((resolve, reject) => {

            // Instantiate a new FileReader
            var reader = new FileReader();

            // Read our file to an ArrayBuffer
            reader.readAsArrayBuffer(file);

            reader.onloadend = () => {
                if (reader.result) {
                    // Get the Array Buffer
                    var data = reader.result as ArrayBuffer;

                    // Grab our byte length
                    var byteLength = data.byteLength;

                    // Convert to conventional array, so we can iterate though it
                    var ui8a = new Uint8Array(data, 0);

                    // Used to store each character that makes up CSV header
                    var headerString = '';

                    // Iterate through each character in our Array
                    for (var i = 0; i < byteLength; i++) {
                        // Get the character for the current iteration
                        var char = String.fromCharCode(ui8a[i]);

                        // Check if the char is a new line
                        if (char.match(/[^\r\n]+/g) !== null) {

                            // Not a new line so lets append it to our header string and keep processing
                            headerString += char;
                        } else {
                            // We found a new line character, stop processing
                            break;
                        }
                    }

                    // find out serparator :

                    return resolve(headerString.split(delimiter));
                }
            };

            reader.onerror = () => {
                return reject('impossible to read the file');
            };
        });
    }
    private _import() {
        const { file, headers, hasHeaderRecord, delimiter } = this.state;
        if (!file || !headers) { return; }

        var data = new FormData();

        data.set(`csv`, file);
        data.set(`headers`, JSON.stringify(headers));
        data.set(`hasHeaderRecord`, JSON.stringify(hasHeaderRecord));
        data.set(`delimiter`, JSON.stringify(delimiter));

        Clients.ImportCsv(data).then(clients => {
            this.props.enqueueSnackbar(`${clients.length} clients imported`);
            this.props.refresh();
            this.props.close();
        });

    }
    private _onDrop(acceptedFiles: Blob[]) {

        if (!acceptedFiles || acceptedFiles.length === 0) { return; }
        // process the file  :
        var file = acceptedFiles[0];
        this.setState(
            () => ({ file }),
            () => this._RefreshHeaders()
        );
    }

    private _RefreshHeaders() {
        const { file } = this.state;
        if (!file) { return; }
        const headers: { [property: string]: number } = {};
        const firstLine: string[] = [];

        this._GetHeaders(file)
            .then(csvheaders => {
                csvheaders.forEach((h, i) => {
                    firstLine.push(h);
                    var prop = ClientFields.find(f => f.toLowerCase() === h.toLowerCase());
                    if (prop) {
                        headers[prop] = i;
                    }
                });

                this.setState(
                    () => ({
                        file,
                        headers,
                        firstLine
                    })
                );
            });
    }
}

export default withStyles((theme: OurTheme): StyleRules<injectedClasses> => {

    return {
        dropZoneContainer: {
            width: '100%',
            height: '100%'
        },
        dropZoneContainerHide: {
            display: 'none'
        },
        dropZone: {
            width: '100%',
            height: '100%'
        },
        dropZoneNoImage: {
        },
        dropZoneLabel: {
            width: '100%',
            height: '100%'
        },
        container: {
            height: '100%',
            position: 'relative'
        },
        tooltip: {
            background: theme.palette.common.white,
            color: theme.palette.text.primary,
            boxShadow: theme.shadows[1],
            fontSize: 11,
        },
        delimiter: {
            width: '50%;'
        },
        headerRecord: {
            width: '50%;'
        },
        listContent: {
            width: '100%;'
        },
        row: {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 0,
            paddingRight: 0,
        },
        rowLegend: {
            width: '40%'
        },
        rowInput: {
            width: '60%'
        }
    };
})(withSnackbar(ClientImport));