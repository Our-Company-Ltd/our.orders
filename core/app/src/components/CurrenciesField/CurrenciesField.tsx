
import * as React from 'react';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import { InjectedSettingsProps } from 'src/_context';
import { MenuItem } from '@material-ui/core';

type CurrenciesFieldProps = TextFieldProps & InjectedSettingsProps;

const CurrenciesField: React.SFC<CurrenciesFieldProps> = (props) => {
    const { settingsCtx: { Settings: { Currencies } }, ...textFieldProps } = props;
    if (Currencies.length <= 1) {
        return (
            <TextField
                {...textFieldProps}
                disabled={true}
            />);
    }
    return (
        <TextField
            {...textFieldProps}
            select={true}
        >
            {Currencies.map(c => (
                <MenuItem key={c.Code} value={c.Code}>
                    {c.Name}
                </MenuItem>
            ))}
        </TextField>
    );
};
export default CurrenciesField;