import * as React from 'react';
import * as md5 from 'md5';

import ItemPreview, { Thumb, Line, Lines } from '../../ItemPreview/ItemPreview';
import { InjectedIntlProps, defineMessages, FormattedMessage } from 'react-intl';
import { Person, Client } from 'src/@types/our-orders';
import { DialogContent, Button, DialogActions, CircularProgress, WithStyles, withStyles } from '@material-ui/core';
import PersonFields from 'src/components/Person/PersonFields';
import { Clients } from 'src/_services';
import SideDialog from 'src/components/SideDialog/SideDialog';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import { withSnackbar, InjectedNotistackProps } from 'notistack';
import { InjectedAuthProps } from 'src/_context';
import { IsAdminOrInRole } from 'src/_helpers/roles';

type injectedClasses = 'firstName' | 'lastName';

export type OrderClientFieldsProps =
    InjectedIntlProps &
    InjectedAuthProps &
    InjectedNotistackProps &
    WithStyles<injectedClasses> &
    {
        current: { ClientId?: string; Client?: Person };
        onChange: (changes: Partial<{ ClientId: string; Client: Person }>) => void;
        preventEditClient?: boolean;
    };

export const OrderClientFieldsMessages = defineMessages({
    searchPlaceholder: {
        id: 'src.components.forms.client.searchPlaceholder',
        defaultMessage: 'Choose existing client',
        description: 'Placeholder for search bar client'
    },
    closeDetail: {
        id: 'src.components.forms.client.closeDetail',
        defaultMessage: 'Close',
        description: 'Close btn'
    },
    updateClient: {
        id: 'src.components.forms.client.updateClient',
        defaultMessage: 'Update Client infos',
        description: 'update btn'
    },
    createClient: {
        id: 'src.components.forms.client.createClient',
        defaultMessage: 'Create Client',
        description: 'create btn'
    }
});
type State = {
    open: boolean;
    updating?: boolean;
    updated?: boolean;
    creating?: boolean;
    created?: boolean;
};

class OrderClientFields extends React.Component<OrderClientFieldsProps, State> {
    constructor(props: OrderClientFieldsProps) {
        super(props);
        this._handleClientChange = this._handleClientChange.bind(this);
        this.state = { open: false };
    }

    shouldComponentUpdate(nextProps: OrderClientFieldsProps, nextState: State) {
        if (nextProps.preventEditClient !== this.props.preventEditClient) { return true; }
        if (nextProps.onChange !== this.props.onChange) { return true; }
        if (JSON.stringify(nextProps.current) !== JSON.stringify(this.props.current)) { return true; }
        if (JSON.stringify(nextState) !== JSON.stringify(this.state)) { return true; }
        return false;
    }

    render() {
        const { open, updating, updated, creating, created } = this.state;
        const {
            current: { Client: current, ClientId },
            intl,
            onChange,
            classes,
            enqueueSnackbar,
            authCtx: { user },
        } = this.props;

        const client = (current || {}) as Person;

        const firstname = client.FirstName || '';
        const lastname = client.LastName || '';
        const organizationname = client.OrganizationName || '';
        const phone = client.Phone || '';
        const cellphone = client.CellPhone || '';
        const email = client.Email || '';
        const city = client.City || '';

        const hasRights = IsAdminOrInRole(user, 'CRUD_CLIENTS');

        const empty = !(firstname || lastname || organizationname);
        const preview = empty ?
            (
                <ItemPreview
                    onClick={() => this.setState((prev) => ({ open: !prev.open }))}
                >
                    <Thumb loading={true} />
                    <Lines>
                        <Line loading={true} />
                        <Line loading={true} />
                    </Lines>
                </ItemPreview>
            ) :
            (
                <ItemPreview
                    onClick={() => this.setState((prev) => ({ open: !prev.open }))}
                >
                    <Thumb src={`https://www.gravatar.com/avatar/${md5(email)}?d=mm`} />
                    <Lines>
                        <Line>
                            {firstname &&
                                <span className={classes.firstName}>
                                    {firstname}
                                </span>}
                            {lastname &&
                                <span className={classes.lastName}>
                                    {lastname}
                                </span>}
                        </Line>
                        <Line>
                            {city &&
                                <span>
                                    {city}
                                </span>}

                        </Line>
                        <Line>
                            {email &&
                                <a href={`mailto:${email}`}>
                                    {email}
                                </a>}

                            {cellphone &&
                                <span>
                                    {cellphone}
                                </span>}

                            {!cellphone && phone &&
                                <span>
                                    {phone}
                                </span>}
                        </Line>
                    </Lines>
                </ItemPreview>);

        if (this.props.preventEditClient) {
            return preview;
        }
        const close = () => this.setState(() => ({ open: false }));
        const updateClient = () => {
            this.setState(
                () => ({ updating: true, updated: false }),
                () => Clients.Patch(ClientId!, client)
                    .then(() => {
                        enqueueSnackbar(
                            `Successfully updated Client ${client.FirstName || ''} ${client.LastName || ''}`,
                            { variant: 'success' }
                        );
                        this.setState(() => ({ updating: false, updated: true }));
                    })
                    .catch((reason) => {
                        enqueueSnackbar(
                            `Impossible to update Client (${reason})`,
                            { variant: 'error' }
                        );
                    })
            );

        };
        const newClient = () => {
            this.setState(
                () => ({ creating: true, created: false }),
                () => Clients.Create(client)
                    .then((c) => {
                        enqueueSnackbar(
                            `Successfully created Client ${c.FirstName || ''} ${c.LastName || ''}`,
                            { variant: 'success' }
                        );
                        this.setState(() => ({ creating: false, created: true }), () => onChange(({ ClientId: c.Id })));
                    })
                    .catch((reason) => {
                        enqueueSnackbar(
                            `Impossible to create Client (${reason})`,
                            { variant: 'error' }
                        );
                    })
            );

        };
        return (
            <React.Fragment>
                {preview}
                <SideDialog
                    open={open}
                    onClose={close}
                >
                    <DialogContent>
                        <PersonFields
                            current={current}
                            onChange={this._handleClientChange}
                            intl={intl}
                            hasRights={!!hasRights}
                        />
                    </DialogContent>
                    <DialogActions>
                        {hasRights && !ClientId &&
                            <Button
                                size="small"
                                color={creating ? 'secondary' : 'primary'}
                                disabled={creating || created}
                                variant="contained"
                                onClick={newClient}
                            >
                                {creating && <CircularProgress size={24} />}
                                <FormattedMessage {...OrderClientFieldsMessages.createClient} />
                            </Button>
                        }
                        {hasRights && ClientId &&
                            <Button
                                size="small"
                                color={updated ? 'secondary' : 'primary'}
                                disabled={updating || updated}
                                variant="contained"
                                onClick={updateClient}
                            >
                                {updating && <CircularProgress size={24} />}
                                <FormattedMessage {...OrderClientFieldsMessages.updateClient} />
                            </Button>
                        }
                        <Button
                            size="small"
                            color="default"
                            variant="contained"
                            onClick={close}
                        >
                            <FormattedMessage {...OrderClientFieldsMessages.closeDetail} />
                        </Button>
                    </DialogActions>
                </SideDialog>
            </React.Fragment >);
    }

    // private _handleClientSelectChange(options: SelectOption<string>) {
    //     const id = options.value;
    //     const { current, onChange } = this.props;
    //     if (id) {
    //         this._fetchClient(id).then((client) => {
    //             if (current.ClientID !== client.Id) { return; }
    //             onChange({ ClientID: id, Client: client });
    //         });
    //     } else {
    //         this.props.onChange({ ClientID: undefined });
    //     }
    // }

    // private _fetchOptions(input: string) {
    //     return Clients.List(input, 0, 100)
    //         .then((json) => {
    //             const options = json.Values.map(v => ({ value: v.Id, label: v.Title }));
    //             return {
    //                 options: options
    //             };
    //         });
    // }
    // private _fetchClient(id: string) {
    //     return Clients.Get(id);
    // }

    private _handleClientChange(changes: Partial<Person>) {
        const { current, onChange } = this.props;
        onChange({
            Client: {
                ...current.Client, ...changes
            } as Client
        });
    }
}

export default React.memo(withStyles((theme: OurTheme): StyleRules<injectedClasses> => ({
    firstName: {
        marginRight: theme.spacing.unit,
        fontWeight: 'bold',
        color: 'black'
    },
    lastName: {
        fontWeight: 'bold',
        color: 'black'
    }
}))(withSnackbar(OrderClientFields)));