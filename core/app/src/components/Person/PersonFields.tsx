import * as React from 'react';

import { defineMessages, InjectedIntlProps } from 'react-intl';
import { Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import Countries from 'i18n-iso-countries';
import { Person } from 'src/@types/our-orders';
import { GridContainer } from 'src/components/GridContainer/GridContainer';

export type PersonFieldsProps = InjectedIntlProps & {
    current?: Person;
    hasRights: boolean;

    onChange: (changes: Partial<Person>) => void;
};

export const PersonFieldsMessages = defineMessages({
    firstName: {
        id: 'src.components.forms.person.firstName',
        defaultMessage: 'First Name',
        description: 'Legend for First Name form field'
    },
    lastName: {
        id: 'src.components.forms.person.lastName',
        defaultMessage: 'Last Name',
        description: 'Legend for Last Name form field'
    },
    organizationName: {
        id: 'src.components.forms.person.organizationName',
        defaultMessage: 'Organization Name',
        description: 'Legend for Organization Name form field'
    },
    address: {
        id: 'src.components.forms.person.address',
        defaultMessage: 'Address',
        description: 'Legend for Address form field'
    },
    postalCode: {
        id: 'src.components.forms.person.postalCode',
        defaultMessage: 'Postal Code',
        description: 'Legend for Postal Code form field'
    },
    city: {
        id: 'src.components.forms.person.city',
        defaultMessage: 'City',
        description: 'Legend for City form field'
    },
    state: {
        id: 'src.components.forms.person.state',
        defaultMessage: 'State',
        description: 'Legend for State form field'
    },
    country: {
        id: 'src.components.forms.person.country',
        defaultMessage: 'Country',
        description: 'Legend for Country form field'
    },
    cellPhone: {
        id: 'src.components.forms.person.cellPhone',
        defaultMessage: 'Cell Phone',
        description: 'Legend for Cell Phone form field'
    },
    phone: {
        id: 'src.components.forms.person.phone',
        defaultMessage: 'Phone',
        description: 'Legend for Phone form field'
    },
    email: {
        id: 'src.components.forms.person.email',
        defaultMessage: 'Email',
        description: 'Legend for Email form field'
    }
});

class PersonFields extends React.Component<PersonFieldsProps> {
    render() {
        let { current, onChange, intl: { formatMessage }, hasRights} = this.props;
        current = current || {} as Person;

        const countries = Countries.getNames('en');

        const chg = (key: keyof Person) =>
            (val: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
                onChange({ [key]: val.target.value });

        const v = (key: keyof Person) => (current && current[key] || '');

        return (
            <GridContainer>
                <Grid item={true} xs={12}>
                    <TextField
                        fullWidth={true}
                        onChange={chg('FirstName')}
                        value={v('FirstName')}
                        label={formatMessage(PersonFieldsMessages.firstName)}
                        disabled={!hasRights}
                    />
                </Grid>
                <Grid item={true} xs={12}>
                    <TextField
                        fullWidth={true}
                        onChange={chg('LastName')}
                        value={v('LastName')}
                        label={formatMessage(PersonFieldsMessages.lastName)}
                        disabled={!hasRights}
                    />

                </Grid>
                <Grid item={true} xs={12}>
                    <TextField
                        fullWidth={true}
                        onChange={chg('Email')}
                        value={v('Email')}
                        label={formatMessage(PersonFieldsMessages.email)}
                        disabled={!hasRights}
                    />
                </Grid>
                <Grid item={true} xs={12}>
                    <TextField
                        fullWidth={true}
                        onChange={chg('OrganizationName')}
                        value={v('OrganizationName')}
                        label={formatMessage(PersonFieldsMessages.organizationName)}
                        disabled={!hasRights}
                    />
                </Grid>
                <Grid item={true} xs={12}>
                    <TextField
                        fullWidth={true}
                        onChange={chg('Address')}
                        value={v('Address')}
                        multiline={true}
                        label={formatMessage(PersonFieldsMessages.address)}
                        disabled={!hasRights}
                    />

                </Grid>
                <Grid item={true} xs={6}>
                    <TextField
                        fullWidth={true}
                        onChange={chg('PostalCode')}
                        value={v('PostalCode')}
                        label={formatMessage(PersonFieldsMessages.postalCode)}
                        disabled={!hasRights}
                    />

                </Grid>
                <Grid item={true} xs={6}>
                    <TextField
                        fullWidth={true}
                        onChange={chg('City')}
                        value={v('City')}
                        label={formatMessage(PersonFieldsMessages.city)}
                        disabled={!hasRights}
                    />
                </Grid>
                <Grid item={true} xs={6}>
                    <TextField
                        fullWidth={true}
                        onChange={chg('State')}
                        value={v('State')}
                        label={formatMessage(PersonFieldsMessages.state)}
                        disabled={!hasRights}
                    />

                </Grid>
                <Grid item={true} xs={6}>
                    <TextField
                        fullWidth={true}
                        onChange={chg('CellPhone')}
                        value={v('CellPhone')}
                        label={formatMessage(PersonFieldsMessages.cellPhone)}
                        disabled={!hasRights}
                    />
                </Grid>
                <Grid item={true} xs={6}>
                    <FormControl fullWidth={true}>
                        <InputLabel htmlFor="PersonCountry">
                            {formatMessage(PersonFieldsMessages.country)}
                        </InputLabel>
                        <Select
                            fullWidth={true}
                            onChange={chg('CountryIso')}
                            value={v('CountryIso')}
                            inputProps={{
                                name: 'PersonCountry',
                                id: 'PersonCountry',
                            }}
                            disabled={!hasRights}
                        >
                            {Object.keys(countries).map(c => (
                                <MenuItem key={c} value={c}>
                                    {countries[c]}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item={true} xs={6}>
                    <TextField
                        fullWidth={true}
                        onChange={chg('Phone')}
                        value={v('Phone')}
                        label={formatMessage(PersonFieldsMessages.phone)}
                        disabled={!hasRights}
                    />
                </Grid>
            </GridContainer>);
    }
}

export default PersonFields;