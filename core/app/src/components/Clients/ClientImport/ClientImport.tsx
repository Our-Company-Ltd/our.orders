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
    List
} from '@material-ui/core';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import ClientImportMessages from './ClientImportMessages';
import Dropzone from 'react-dropzone';
import { InjectedNotistackProps, withSnackbar } from 'notistack';
import { InjectedIntlProps } from 'react-intl';

export type injectedClasses =
    'dropZone' |
    'dropZoneLabel' |
    'dropZoneNoImage' |
    'container' |
    'tooltip';
export type ClientImportProps =
    InjectedIntlProps &
    InjectedNotistackProps &
    WithStyles<injectedClasses> &
    {
        close: () => void;
        refresh: () => void;
    };

type State = {
    headers?: { [key: string]: keyof Client | undefined };
    file?: Blob;
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
        };
    }

    render() {
        const {
            headers,
            file
        } = this.state;
        const {
            intl,
            classes
        } = this.props;

        return (
            <React.Fragment>
                <DialogTitle id="draggable-dialog-title">Subscribe</DialogTitle>
                <DialogContent>
                    <GridContainer className={classes.container} spacing={0}>
                        <Grid item={true}>
                            <Dropzone
                                className={classes.dropZone}
                                onDrop={this._onDrop}
                            >
                                <Button className={classes.dropZoneLabel}>
                                    {intl.formatMessage(ClientImportMessages.header)}
                                </Button>
                            </Dropzone>
                        </Grid>

                        {headers && (
                            <Grid item={true}>
                                <List>
                                    {Object.keys(headers).map((h) => (
                                        <ListItem
                                            key={`${h}`}
                                        >
                                            <TextField
                                                select={true}
                                                label={h}
                                                fullWidth={true}
                                                value={headers[h] || ''}
                                                onChange={(value) => {
                                                    const v = value.target.value as keyof Client;
                                                    this.setState(
                                                        (prev) => ({ headers: { ...prev.headers, [h]: v } })
                                                    );
                                                }}
                                            >
                                                {ClientFields.map(k => (
                                                    <MenuItem key={k} value={k}>
                                                        {k}
                                                    </MenuItem>))}
                                                <MenuItem key="--none--" value={undefined}>
                                                    Do not import
                                                </MenuItem>
                                            </TextField>
                                        </ListItem>
                                    ))}
                                </List>
                            </Grid>)
                        }
                    </GridContainer>
                </DialogContent>
                <DialogActions>
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
                    const splitOnComas = headerString.split(',');
                    const splitOnSemiColons = headerString.split(';');
                    return resolve(splitOnComas.length > splitOnSemiColons.length ? splitOnComas : splitOnSemiColons);
                }
            };

            reader.onerror = () => {
                return reject('impossible to read the file');
            };
        });
    }
    private _import() {
        const { file, headers } = this.state;
        if (!file || !headers) { return; }

        var data = new FormData();

        data.set(`csv`, file);
        data.set(`headers`, JSON.stringify(headers));

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
        this._GetHeaders(file).then(csvheaders => {
            const headers = {};
            csvheaders.forEach(h => {
                var prop = ClientFields.find(f => f.toLowerCase() === h.toLowerCase());
                headers[h] = prop;
            });
            this.setState(
                () => ({
                    file,
                    headers
                })
            );
        }
        );
    }
}

export default withStyles((theme: OurTheme): StyleRules<injectedClasses> => {

    return {
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
        }
    };
})(withSnackbar(ClientImport));