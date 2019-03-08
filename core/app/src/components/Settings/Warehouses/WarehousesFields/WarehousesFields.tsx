
import * as React from 'react';

import { Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import WarehousesDetailMessages from '../WarehousesDetail/WarehousesDetailMessages';
import { Warehouse } from 'src/@types/our-orders';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import Countries from 'i18n-iso-countries';

type TWarehouse = Warehouse;

type Props = InjectedIntlProps & {
    initial: TWarehouse;
    onChange: (shop: Partial<TWarehouse>) => void;
    changes: Partial<TWarehouse>;
};

class WarehousesFields extends React.Component<Props> {
    _countries: { value: string; preview: string }[];

    constructor(props: Props) {
        super(props);

        const countriesList = Countries.getNames(props.intl.locale);
        this._countries = Object.keys(countriesList).map(v => ({ value: v, preview: countriesList[v] }));
    }
    render() {
        return this._renderUser();
    }

    private _renderUser() {
        const initial = this.props.initial;
        const preview = { ...initial, ...this.props.changes } as TWarehouse;

        return (
            <GridContainer>
                <Grid item={true} xs={12} className="warehouses-detail__lightbox-field">
                    <TextField
                        fullWidth={true}
                        onChange={(e) => this.props.onChange({ Name: e.target.value })}
                        value={preview.Name || ''}
                        label={this.props.intl.formatMessage(WarehousesDetailMessages.firstName)}
                    />
                </Grid>
                <Grid item={true} xs={12} className="warehouses-detail__lightbox-field">
                    <TextField
                        fullWidth={true}
                        onChange={(value) => this.props.onChange({ Address: value.target.value })}
                        value={preview.Address || ''}
                        label={this.props.intl.formatMessage(WarehousesDetailMessages.address)}
                    />
                </Grid>
                <Grid item={true} xs={12} className="warehouses-detail__lightbox-field">
                    <TextField
                        fullWidth={true}
                        onChange={(value) => this.props.onChange({ City: value.target.value })}
                        value={preview.City || ''}
                        label={this.props.intl.formatMessage(WarehousesDetailMessages.city)}
                    />
                </Grid>
                <Grid item={true} xs={12} className="warehouses-detail__lightbox-field">
                    <FormControl fullWidth={true}>
                        <InputLabel htmlFor="age-simple">
                            {this.props.intl.formatMessage(WarehousesDetailMessages.countryIso)}
                        </InputLabel>
                        <Select
                            fullWidth={true}
                            onChange={(value) => this.props.onChange({ CountryIso: value.target.value })}
                            value={preview.CountryIso || ''}
                        >
                            {this._countries.map(c => <MenuItem key={c.value} value={c.value}>{c.preview}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item={true} xs={12} className="warehouses-detail__lightbox-field">
                    <TextField
                        fullWidth={true}
                        onChange={(value) => this.props.onChange({ Email: value.target.value })}
                        value={preview.Email || ''}
                        label={this.props.intl.formatMessage(WarehousesDetailMessages.email)}
                    />
                </Grid>
                <Grid item={true} xs={12} className="warehouses-detail__lightbox-field">
                    <TextField
                        fullWidth={true}
                        onChange={(value) => this.props.onChange({ Phone: value.target.value })}
                        value={preview.Phone || ''}
                        label={this.props.intl.formatMessage(WarehousesDetailMessages.phone)}
                    />
                </Grid>
                <Grid item={true} xs={12} className="warehouses-detail__lightbox-field">
                    <TextField
                        fullWidth={true}
                        onChange={(value) => this.props.onChange({ State: value.target.value })}
                        value={preview.State || ''}
                        label={this.props.intl.formatMessage(WarehousesDetailMessages.state)}
                    />
                </Grid>
                <Grid item={true} xs={12} className="warehouses-detail__lightbox-field">
                    <TextField
                        fullWidth={true}
                        onChange={(value) => this.props.onChange({ PostalCode: value.target.value })}
                        value={preview.PostalCode || ''}
                        label={this.props.intl.formatMessage(WarehousesDetailMessages.postalCode)}
                    />
                </Grid>
            </GridContainer>);
    }
}

export const WarehousesFieldsStandalone = injectIntl(WarehousesFields);
export default WarehousesFields;