
import * as React from 'react';
import TextField, { TextFieldProps } from '@material-ui/core/TextField';

type NumberFieldProps = TextFieldProps & { step: string; onNumberChange: (value: number) => void };

class NumberField extends React.PureComponent<NumberFieldProps> {
    render() {
        const { step, onNumberChange, onChange, ...textFieldProps } = this.props;
        return (
            <TextField
                {...textFieldProps}
                inputProps={{ step }}
                type="number"
                onChange={(e) => {
                    const val = (e.target as HTMLInputElement).value;
                    const parsedVal = val === '' ? 0 : parseFloat(val);
                    onNumberChange(parsedVal);
                    if (onChange) { onChange(e); }
                }}
            />
        );
    }
}
export default NumberField;