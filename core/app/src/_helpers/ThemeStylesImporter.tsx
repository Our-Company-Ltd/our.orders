import * as React from 'react';
import { withTheme } from '@material-ui/core';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';

export type Props = {
    theme: OurTheme;
};

class ThemeStylesImporter extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        const theme = this.props.theme;
        if (!theme) { return null; }
        
        return (
            <React.Fragment>
                {theme.stylesheets.map(src =>
                    <link key={src} rel="stylesheet" type="text/css" href={src} />
                )}
            </React.Fragment>
        );
    }
}

export default withTheme()(ThemeStylesImporter);