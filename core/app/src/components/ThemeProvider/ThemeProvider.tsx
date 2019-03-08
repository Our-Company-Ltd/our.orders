import * as React from 'react';

import { MuiThemeProvider, createMuiTheme, Theme } from '@material-ui/core/styles';
import { ThemeOptions } from '@material-ui/core/styles/createMuiTheme';
import createPalette, { PaletteOptions, Palette } from '@material-ui/core/styles/createPalette';

export type ThemeProviderProps = {
    path: string;
};
export type OurColors = 'blue' | 'green' | 'gray' | 'orange' | 'white' | 'red';

export type OurThemeOptions = ThemeOptions & {
    Colors: { [key in OurColors]: PaletteOptions };
    stylesheets: string[];
    ActiveMenuBorderWidth: number;
};

export type OurTheme = Theme & {
    Colors: { [key in OurColors]: Palette };
    stylesheets: string[];
    ActiveMenuBorderWidth: number;
};

const defaultThemeOptions: OurThemeOptions = {
    Colors: {
        blue: {
            primary: {
                main: '#64b4ff',
                contrastText: '#fff'
            }
        },
        green: {
            primary: {
                main: '#64c864',
                contrastText: '#fff'
            }
        },
        gray: {
            primary: {
                main: '#ddd',
                contrastText: '#fff'
            }
        },
        orange: {
            primary: {
                main: '#ffc864',
                contrastText: '#fff'
            }
        },
        white: {
            primary: {
                main: '#fff',
                contrastText: '#ddd'
            }
        },
        red: {
            primary: {
                main: '#f00',
                contrastText: '#fff'
            }
        }
    },
    stylesheets: [],
    palette: {
        primary: {
            // light: will be calculated from palette.primary.main,
            main: '#64b4ff',
            // dark: will be calculated from palette.primary.main,
            // contrastText: will be calculated to contrast with palette.primary.main,
            contrastText: '#fff'
        },
        secondary: {
            main: '#ff6464',
            contrastText: '#fff'
        },
        error: {
            main: '#ff0000'
        }
    },
    typography: {
        useNextVariants: true
    },
    ActiveMenuBorderWidth: 3
};
type State = {
    loading?: boolean;
    error?: boolean;
    theme: OurTheme;
};

export class ThemeProvider extends React.Component<ThemeProviderProps, State> {
    constructor(props: ThemeProviderProps) {
        super(props);
        this.state = {
            theme: this._GetTheme(defaultThemeOptions),
            loading: true
        };
    }
    componentDidMount() {
        const { path } = this.props;
        // load the theme...
        fetch(`${path}`)
            .then(response => {
                if (response.ok) { 
                    return response.json(); 
                } else { 
                    throw new Error('Network response was not ok.'); 
                }
            })
            .then((options: OurThemeOptions) => {

                this.setState(() => ({
                    loading: false,
                    error: false,
                    path,
                    theme: this._GetTheme(options)
                }));
            })
            .catch(reason => {
                // tslint:disable-next-line:no-console
                console.log(`no custom theme loaded: (${reason})`);
                this.setState(() => ({
                    loading: false,
                    error: true
                }));
            });
    }

    render() {
        const { theme } = this.state;
        return (
            <MuiThemeProvider theme={theme}>
                {this.props.children}
            </MuiThemeProvider>
        );
    }
    private _GetTheme(options: OurThemeOptions) {
        const { Colors, ...rest } = options;
        const opts = {
            ...defaultThemeOptions,
            ...rest,
            Colors: {}
        } as OurThemeOptions;

        const theme = createMuiTheme(opts) as OurTheme;
        if (Colors) {
            for (const k of Object.keys(Colors)) {
                theme.Colors[k] = { ...theme.palette, ...createPalette(Colors[k]) };
            }
        }

        return theme;
    }
}

export default ThemeProvider;