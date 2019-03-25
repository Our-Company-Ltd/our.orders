
import * as React from 'react';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import { InjectedShopProps } from 'src/_context';
import { MenuItem } from '@material-ui/core';

type ShopsFieldProps = TextFieldProps & InjectedShopProps & { nullable?: boolean; };

const ShopsField: React.SFC<ShopsFieldProps> = (props) => {
    const { shopCtx, shopCtx: { Shops }, nullable, ...textFieldProps } = props;
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
        {nullable && 
            <MenuItem value={undefined}>
                none
            </MenuItem>}
            {Shops.map(c => (
                <MenuItem key={c.Id} value={c.Id}>
                    {c.Name}
                </MenuItem>
            ))}
        </TextField>
    );
};

export default ShopsField;