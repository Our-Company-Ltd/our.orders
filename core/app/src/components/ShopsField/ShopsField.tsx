
import * as React from 'react';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import {  InjectedShopProps } from 'src/_context';
import { MenuItem } from '@material-ui/core';

type ShopsFieldProps = TextFieldProps & InjectedShopProps;

const ShopsField: React.SFC<ShopsFieldProps> = (props) => {
    const { shopCtx: { Shops }, ...textFieldProps } = props;
    if (Shops.length <= 1) {
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
            {Shops.map(c => (
                <MenuItem key={c.Id} value={c.Id}>
                    {c.Name}
                </MenuItem>
            ))}
        </TextField>
    );
};

export default ShopsField;