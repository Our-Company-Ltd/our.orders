import * as React from 'react';

import TextField, { TextFieldProps } from '@material-ui/core/TextField';
import MaskedInput from 'react-text-mask';

import * as moment from 'moment';

import { InputBaseComponentProps } from '@material-ui/core/InputBase';

const DateTimeLocalTextFieldMask: React.FunctionComponent<InputBaseComponentProps> = (props) => {
    const { inputRef, value, defaultValue, ...other } = props;
    return (
        <MaskedInput
            {...other}

            ref={ref => {
                (inputRef as ((instance: HTMLElement | null) => void))(ref ? ref.inputElement : null);
            }}
            value={value as string}
            defaultValue={defaultValue as string}
            // tslint:disable-next-line: max-line-length
            mask={[/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, ' ', /\d/, /\d/, ':', /\d/, /\d/]}
            placeholder=""
            showMask={!!value}
        />
    );
};
type State = {
    value: string;
    valid: boolean;
};

type DateTimeFieldProps = TextFieldProps & {
    onDateChange: (d: Date | undefined) => void;
    date: string | Date | undefined;
};
class DateTimeField extends React.Component<DateTimeFieldProps, State> {
    constructor(props: DateTimeFieldProps) {
        super(props);
        const d = this.props.date && moment.utc(this.props.date);
        const valid = d && d.isValid() || false;
        this.state = {
            value: valid && d && this._formatDate(d) || '',
            valid: valid
        };
    }
    componentDidUpdate(prevProps: DateTimeFieldProps) {
        if (prevProps.date !== this.props.date) {
            const d = this.props.date && moment.utc(this.props.date);
            const valid = d && d.isValid() || false;
            this.setState(() => ({
                value: valid && d && this._formatDate(d) || '',
                valid: valid
            }));
        }
    }
    render() {
        const { onDateChange, date, onChange, InputProps, ...props } = this.props;
        const { value, valid } = this.state;
        return (
            <TextField
                {...props}
                onChange={(e) => {
                    const v = e.target.value;
                    const d = moment(v, 'DD/MM/YYYY HH:mm', true);
                    const inputValid = d.isValid();
                    this.setState(
                        () => ({ value: v, valid: inputValid }),
                        () => {
                            if (!v) {
                                onDateChange(undefined);
                                return;
                            }

                            if (!inputValid) {
                                return;
                            }
                            onDateChange(d.utc().toDate());
                        });
                }
                }
                onBlur={() => {
                    if (!this.state.valid) {
                        this.setState(
                            () => ({ value: '', valid: true })
                        );
                    }
                }}
                value={value}
                InputProps={{
                    inputComponent: DateTimeLocalTextFieldMask,
                }}
                error={!valid}
            />
        );

    }
    private _formatDate(d: moment.Moment) {
        return d.local().format('DD/MM/YYYY HH:mm');
    }
}
export default DateTimeField;