
import * as React from 'react';

import { Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import { InjectedIntlProps, injectIntl } from 'react-intl';
import ShopsDetailMessages from '../ShopsDetail/ShopsDetailMessages';
import { Shop } from 'src/@types/our-orders';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import Countries from 'i18n-iso-countries';

type TShop = Shop;

type Props = InjectedIntlProps & {
    initial: TShop;
    onChange: (shop: Partial<TShop>) => void;
    changes: Partial<TShop>;
};

class ShopsFields extends React.Component<Props> {
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
        const preview = { ...initial, ...this.props.changes } as TShop;

        return (
            <GridContainer>
                <Grid item={true} xs={12} className="shops-detail__lightbox-field">
                    <TextField
                        fullWidth={true}
                        onChange={(e) => this.props.onChange({ Name: e.target.value })}
                        value={preview.Name || ''}
                        label={this.props.intl.formatMessage(ShopsDetailMessages.firstName)}
                    />
                </Grid>
                <Grid item={true} xs={12} className="shops-detail__lightbox-field">
                    <TextField
                        fullWidth={true}
                        onChange={(value) => this.props.onChange({ Address: value.target.value })}
                        value={preview.Address || ''}
                        label={this.props.intl.formatMessage(ShopsDetailMessages.address)}
                    />
                </Grid>
                <Grid item={true} xs={12} className="shops-detail__lightbox-field">
                    <TextField
                        fullWidth={true}
                        onChange={(value) => this.props.onChange({ City: value.target.value })}
                        value={preview.City || ''}
                        label={this.props.intl.formatMessage(ShopsDetailMessages.city)}
                    />
                </Grid>
                <Grid item={true} xs={12} className="shops-detail__lightbox-field">
                    <FormControl fullWidth={true}>
                        <InputLabel htmlFor="age-simple">
                            {this.props.intl.formatMessage(ShopsDetailMessages.countryIso)}
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
                <Grid item={true} xs={12} className="shops-detail__lightbox-field">
                    <TextField
                        fullWidth={true}
                        onChange={(value) => this.props.onChange({ Email: value.target.value })}
                        value={preview.Email || ''}
                        label={this.props.intl.formatMessage(ShopsDetailMessages.email)}
                    />
                </Grid>
                <Grid item={true} xs={12} className="shops-detail__lightbox-field">
                    <TextField
                        fullWidth={true}
                        onChange={
                            (value) => this.props.onChange({ OrganizationName: value.target.value })}
                        value={preview.OrganizationName || ''}
                        label={this.props.intl.formatMessage(ShopsDetailMessages.organizationName)}
                    />
                </Grid>
                <Grid item={true} xs={12} className="shops-detail__lightbox-field">
                    <TextField
                        fullWidth={true}
                        onChange={(value) => this.props.onChange({ Phone: value.target.value })}
                        value={preview.Phone || ''}
                        label={this.props.intl.formatMessage(ShopsDetailMessages.phone)}
                    />
                </Grid>
                <Grid item={true} xs={12} className="shops-detail__lightbox-field">
                    <TextField
                        fullWidth={true}
                        onChange={(value) => this.props.onChange({ State: value.target.value })}
                        value={preview.State || ''}
                        label={this.props.intl.formatMessage(ShopsDetailMessages.state)}
                    />
                </Grid>
                <Grid item={true} xs={12} className="shops-detail__lightbox-field">
                    <TextField
                        fullWidth={true}
                        onChange={(value) => this.props.onChange({ PostalCode: value.target.value })}
                        value={preview.PostalCode || ''}
                        label={this.props.intl.formatMessage(ShopsDetailMessages.postalCode)}
                    />
                </Grid>
                <Grid item={true} xs={12} className="shops-detail__lightbox-field">
                    <TextField
                        fullWidth={true}
                        onChange={(value) => this.props.onChange({ VATNumber: value.target.value })}
                        value={preview.VATNumber || ''}
                        label={this.props.intl.formatMessage(ShopsDetailMessages.vatNumber)}
                    />
                </Grid>
            </GridContainer>);
    }
}

export const ShopsFieldsStandalone = injectIntl(ShopsFields);
export default ShopsFields;