import * as React from 'react';
import NumberFormat from 'react-number-format';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import Grid, { GridProps } from '@material-ui/core/Grid';

import PricesFieldMessages from './PricesFieldMessages';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import { Price, Currency } from 'src/@types/our-orders';

// tslint:disable-next-line:no-any
const NumberFormatCustom: React.SFC<any> = (props) => {
    const { inputRef, onChange, title, ...other } = props;

    return (
        <NumberFormat
            {...other}
            getInputRef={inputRef}
            onValueChange={values => {
                onChange({
                    target: {
                        value: values.value,
                    },
                });
            }}
            thousandSeparator={true}
            prefix={`${title} `}
        />
    );
};

export type PricesFieldProps = InjectedIntlProps & {
    label?: string;
    gridProps?: GridProps;
    fieldProps?: TextFieldProps;
    value: Price[];
    currencies: Currency[];
    onChange?: (value: Price[]) => void;
};

export type PriceFieldProps = InjectedIntlProps & {
    label?: string;
    fieldProps?: TextFieldProps;
    currency: Currency;
    value: Price | null;
    onChange?: (value: Price | null) => void;
};
export const PriceField: React.SFC<PriceFieldProps> = (props) => {
    const { value, currency, fieldProps, label } = props;
    return (
        <TextField
            value={value === null ? '' : value.Value}
            fullWidth={true}
            label={label}
            title={currency.Name}
            onChange={props.onChange ? (e) => {
                var val = (e.target as HTMLInputElement).value;
                if (val === '') {
                    props.onChange!(null);
                }
                props.onChange!({ Value: parseFloat(val), Currency: currency.Code });

            } : undefined}
            inputProps={{
                title: currency.Name,
                placeholder: props.intl.formatMessage(
                    PricesFieldMessages.pricePlaceholder, {
                        currency: currency.Code
                    })
            }}
            InputProps={{
                inputComponent: NumberFormatCustom,
            }}
            {...fieldProps}
        />);
};

export const PricesField: React.SFC<PricesFieldProps> = (props) => {
    const { currencies, gridProps, fieldProps, intl, label } = props;

    return (
        <React.Fragment>
            {currencies.map(currency => {
                const price = props.value.find(p => p.Currency === currency.Code);

                return (
                    <Grid key={currency.Code} item={true} xs={true} {...gridProps}>
                        <PriceField
                            label={label}
                            intl={intl}
                            onChange={props.onChange ? (e) => {

                                const newprices = [...props.value].filter(p => p.Currency !== currency.Code);

                                if (e !== null) {
                                    newprices.push(e);
                                }
                                props.onChange!(newprices);

                            } : undefined}

                            value={price || null}
                            currency={currency}
                            fieldProps={fieldProps}
                        />

                    </Grid>);
            })}
        </React.Fragment>
    );
};

export default PricesField;

export const StandalonePriceField = injectIntl(PricesField);