import { Select, TextField, MenuItem } from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import InputLabel from '@material-ui/core/InputLabel';
import Countries from 'i18n-iso-countries';
import * as React from 'react';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import { Person, Roles } from 'src/@types/our-orders';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import ClientFieldsMessages from './ClientFieldsMessages';
import { IsAdminOrInRole } from 'src/_helpers/roles';
import { InjectedAuthProps } from 'src/_context';

export type ClientFieldsProps = InjectedIntlProps & InjectedAuthProps & {
    initial?: Person;
    onChange: (changes: Partial<Person>) => void;
    changes?: Partial<Person>;
};

export class ClientFields extends React.Component<ClientFieldsProps> {
    _countries: { value: string; preview: string }[];
    constructor(props: ClientFieldsProps) {
        super(props);
        const countriesList = Countries.getNames(props.intl.locale);
        this._countries = Object.keys(countriesList).map(v => ({ value: v, preview: countriesList[v] }));
    }
    render() {
        const initial = this.props.initial as Partial<Person>;
        const changes = this.props.changes || {} as Partial<Person>;

        const preview = { ...initial, ...changes };

        const {
            FirstName,
            LastName,
            OrganizationName,
            Address,
            PostalCode,
            City,
            State,
            CellPhone,
            Phone,
            Email,
            CountryIso } = preview;

        const firstName = FirstName || '';
        const lastName = LastName || '';
        const organizationName = OrganizationName || '';
        const address = Address || '';
        const postalCode = PostalCode || '';
        const city = City || '';
        const state = State || '';
        const cellPhone = CellPhone || '';
        const phone = Phone || '';
        const email = Email || '';
        const country = CountryIso || '';

        const { intl: { formatMessage }, onChange, authCtx: { user } } = this.props;
        const hasRights = IsAdminOrInRole(user, Roles.CRUD_Clients);

        return (
            <GridContainer spacing={24}>
                <Grid item={true} xs={6}>
                    <TextField
                        fullWidth={true}
                        label={formatMessage(ClientFieldsMessages.firstName)}
                        value={firstName}
                        onChange={(e) => onChange({ ...changes, FirstName: e.target.value })}
                        disabled={!hasRights}
                    />
                </Grid>
                <Grid item={true} xs={6}>
                    <TextField
                        fullWidth={true}
                        label={formatMessage(ClientFieldsMessages.lastName)}
                        value={lastName}
                        onChange={(e) => onChange({ ...changes, LastName: e.target.value })}
                        disabled={!hasRights}
                    />
                </Grid>
                <Grid item={true} xs={12}>
                    <TextField
                        fullWidth={true}
                        label={formatMessage(ClientFieldsMessages.email)}
                        value={email}
                        onChange={(e) => onChange({ ...changes, Email: e.target.value })}
                        disabled={!hasRights}
                    />
                </Grid>
                <Grid item={true} xs={12}>
                    <TextField
                        fullWidth={true}
                        label={formatMessage(ClientFieldsMessages.organizationName)}
                        value={organizationName}
                        onChange={(e) => onChange({ ...changes, OrganizationName: e.target.value })}
                        disabled={!hasRights}
                    />
                </Grid>
                <Grid item={true} xs={12}>
                    <TextField
                        fullWidth={true}
                        multiline={true}
                        label={formatMessage(ClientFieldsMessages.address)}
                        value={address}
                        disabled={!hasRights}
                        onChange={(e) => onChange({ ...changes, Address: e.target.value })}
                    />
                </Grid>
                <Grid item={true} xs={6}>
                    <TextField
                        fullWidth={true}
                        label={formatMessage(ClientFieldsMessages.postalCode)}
                        value={postalCode}
                        onChange={(e) => onChange({ ...changes, PostalCode: e.target.value })}
                        disabled={!hasRights}
                    />
                </Grid>
                <Grid item={true} xs={6}>
                    <TextField
                        fullWidth={true}
                        label={formatMessage(ClientFieldsMessages.city)}
                        value={city}
                        onChange={(e) => onChange({ ...changes, City: e.target.value })}
                        disabled={!hasRights}
                    />
                </Grid>
                <Grid item={true} xs={6}>
                    <TextField
                        fullWidth={true}
                        label={formatMessage(ClientFieldsMessages.cellPhone)}
                        value={cellPhone}
                        onChange={(e) => onChange({ ...changes, CellPhone: e.target.value })}
                        disabled={!hasRights}
                    />
                </Grid>
                <Grid item={true} xs={6}>
                    <TextField
                        fullWidth={true}
                        label={formatMessage(ClientFieldsMessages.state)}
                        value={state}
                        onChange={(e) => onChange({ ...changes, State: e.target.value })}
                        disabled={!hasRights}
                    />
                </Grid>
                <Grid item={true} xs={6}>
                    <FormControl fullWidth={true}>
                        <InputLabel htmlFor="age-simple">
                            {formatMessage(ClientFieldsMessages.country)}
                        </InputLabel>
                        <Select
                            fullWidth={true}
                            onChange={(e) => onChange({ ...changes, CountryIso: e.target.value })}
                            value={country}
                            disabled={!hasRights}
                        >
                            {this._countries.map(c => <MenuItem key={c.value} value={c.value}>{c.preview}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item={true} xs={6}>
                    <TextField
                        fullWidth={true}
                        label={formatMessage(ClientFieldsMessages.phone)}
                        value={phone}
                        onChange={(e) => onChange({ ...changes, Phone: e.target.value })}
                        disabled={!hasRights}
                    />
                </Grid>
            </GridContainer>
        );
    }
}

export default ClientFields;

export const ClientFieldsStandalone = injectIntl(ClientFields);