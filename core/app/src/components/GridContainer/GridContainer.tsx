import * as React from 'react';
import Grid, { GridProps } from '@material-ui/core/Grid';

export const GridContainer: React.SFC<GridProps> = (props) => {
    return <Grid {...{ container: true, spacing: 8, ...props }}>{props.children}</Grid>;
};