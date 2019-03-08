
import * as React from 'react';

import { Async as AsyncSelect } from 'react-select';
import { withStyles, StyleRules, WithStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import NoSsr from '@material-ui/core/NoSsr';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';

import { Clients } from 'src/_services';
import { Filter } from 'src/_helpers/Filter';
import { ControlProps } from 'react-select/lib/components/Control';
import { PlaceholderProps } from 'react-select/lib/components/Placeholder';
import { SingleValueProps } from 'react-select/lib/components/SingleValue';
import { ValueContainerProps } from 'react-select/lib/components/containers';
import { MenuProps, NoticeProps } from 'react-select/lib/components/Menu';
import { OptionProps } from 'react-select/lib/components/Option';
import { AsyncProps } from 'react-select/lib/Async';
import { Client } from 'src/@types/our-orders';

type TOption = { label: string; value: string; client: Client };
type injectedClasses =
    'root' | 'input' | 'valueContainer' | 'noOptionsMessage' | 'singleValue' | 'placeholder' | 'paper' | 'divider';

type ClientSelectProps = {
    value: string;
    onChange: (client?: Client) => void;
} & WithStyles<injectedClasses> & { theme: OurTheme };

const styles = (theme: OurTheme): StyleRules<injectedClasses> => ({
    root: {
        flexGrow: 1,
    },
    input: {
        display: 'flex',
        padding: 0,
    },
    valueContainer: {
        display: 'flex',
        flexWrap: 'wrap',
        flex: 1,
        alignItems: 'center',
        overflow: 'hidden',
    },
    noOptionsMessage: {
        padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
    },
    singleValue: {
        fontSize: 16,
    },
    placeholder: {
        position: 'absolute',
        left: 2,
        fontSize: 16,
    },
    paper: {
        position: 'absolute',
        zIndex: 1,
        marginTop: theme.spacing.unit,
        left: 0,
        right: 0,
    },
    divider: {
        height: theme.spacing.unit * 2,
    }
});

const NoOptionsMessage: React.FunctionComponent<NoticeProps<TOption>> = (props) => {
    return (
        <Typography
            color="textSecondary"
            className={props.selectProps.classes.noOptionsMessage}
            {...props.innerProps}
        >
            {props.children}
        </Typography>
    );
};
const inputComponent: React.FunctionComponent<
    React.HTMLAttributes<HTMLDivElement> & {
        inputRef: React.RefObject<HTMLDivElement>
    }
> = (props) => {
    const { inputRef, ...rest } = props;
    return <div ref={inputRef} {...rest} />;
};

const Control: React.FunctionComponent<ControlProps<TOption>> = (props) => {
    return (
        <TextField
            fullWidth={true}
            InputProps={{
                inputComponent,
                inputProps: {
                    className: props.selectProps.classes.input,
                    inputRef: props.innerRef,
                    children: props.children,
                    ...props.innerProps,
                },
            }}
            {...props.selectProps.textFieldProps}
        />
    );
};

const Option: React.FunctionComponent<OptionProps<TOption>> = (props) => {
    return (
        <MenuItem
            buttonRef={props.innerRef}
            selected={props.isFocused}
            disabled={props.isDisabled}
            component="div"
            style={{
                fontWeight: props.isSelected ? 500 : 400,
            }}
            {...props.innerProps}
        >
            {props.children}
        </MenuItem>
    );
};

const Placeholder: React.FunctionComponent<PlaceholderProps<TOption>> = (props) => {
    return (
        <Typography
            color="textSecondary"
            className={props.selectProps.classes.placeholder}
            {...props.innerProps}
        >
            {props.children}
        </Typography>
    );
};

const SingleValue: React.FunctionComponent<SingleValueProps<TOption>> = (props) => {
    return (
        <Typography className={props.selectProps.classes.singleValue} {...props.innerProps}>
            {props.children}
        </Typography>
    );
};

const ValueContainer: React.FunctionComponent<ValueContainerProps<TOption>> = (props) => {
    return <div className={props.selectProps.classes.valueContainer}>{props.children}</div>;
};

const Menu: React.FunctionComponent<MenuProps<TOption>> = (props) => {
    return (
        <Paper square={true} className={props.selectProps.classes.paper} {...props.innerProps}>
            {props.children}
        </Paper>
    );
};

const components = {
    Control,
    Menu,
    NoOptionsMessage,
    Option,
    Placeholder,
    SingleValue,
    ValueContainer,
};

type State = {

    current?: TOption;
};

class ClientSelect extends React.Component<ClientSelectProps, State> {

    constructor(props: ClientSelectProps) {
        super(props);
        this.state = {};
    }
    componentDidMount() {
        const { value } = this.props;
        if (value) {
            Clients.Get(value)
                .then((client) => {
                    if (!this.state.current) {
                        if (client === undefined) { return; }
                        this.setState(() => ({
                            current: {
                                value: client.Id,
                                label: `${client.FirstName} ${client.LastName}`,
                                client
                            }
                        }));
                    }
                });
        }
    }
    componentDidUpdate(prevProps: ClientSelectProps, prevState: State) {
        if (!prevState.current || prevState.current.value !== prevProps.value) {
            this._update();
        }
    }
    render() {
        const { classes, theme, onChange } = this.props;
        const { current } = this.state;
        const selectStyles = {
            input: (base: React.CSSProperties) => ({
                ...base,
                color: theme.palette.text.primary,
                '& input': {
                    font: 'inherit',
                }
            }),
        };

        const loadOptions = (inputValue: string) => {
            return Clients.Find(
                {
                    filters: [
                        Filter.Like('FirstName', inputValue),
                        Filter.Like('LastName', inputValue),
                        Filter.Like('Phone', inputValue),
                        Filter.Like('Email', inputValue)
                    ],
                    operator: 'or',
                },
                0,
                1000)
                .then((result) => {
                    return result.Values.map(client => ({
                        value: client.Id,
                        label: `${client.FirstName} ${client.LastName}`,
                        client
                    }));
                });

        };

        const AsyncSelectWCl =
            // tslint:disable-next-line:no-any
            AsyncSelect as any as React.ComponentClass<AsyncProps<TOption> & { [key: string]: any }>;

        const change = (opt: TOption) => {
            this.setState(() => ({ current: opt }));
            onChange(opt && opt.client);
        };

        return (
            <div className={classes.root}>
                <NoSsr>
                    <AsyncSelectWCl
                        isClearable={true}
                        isSearchable={true}
                        name="color"
                        classes={classes}
                        noOptionsMessage={() => null}
                        styles={selectStyles}
                        components={components}
                        loadOptions={loadOptions}
                        value={current} // || value && { label: `loading client...`, value }
                        onChange={change}
                        placeholder="Client..."
                    />
                </NoSsr>
            </div>
        );
    }
    private _update() {
        const { value } = this.props;
        if (value) {
            Clients.Get(value)
                .then((client) => {
                    if (!this.state.current) {
                        if (client === undefined) { return; }
                        this.setState(() => ({
                            current: {
                                value: client.Id,
                                label: `${client.FirstName} ${client.LastName}`,
                                client
                            }
                        }));
                    }
                });
        }
    }
}

export default withStyles(styles, { withTheme: true })(ClientSelect);