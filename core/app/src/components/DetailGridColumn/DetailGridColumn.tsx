
import * as React from 'react';
import Grid, { GridProps } from '@material-ui/core/Grid';
import { withStyles, WithStyles } from '@material-ui/core';
import { StyleRules } from '@material-ui/core/styles';
import * as classNames from 'classnames';

const DetailGridColumn: React.SFC<GridProps & WithStyles<'detailGridColumn' | 'cell'>> = (props) => {
    const { detailGridColumn, cell, ...classes  } = props.classes;
    const { classes: propsClasses, className, ...gridProps } = props;
    return (
        <Grid
            className={classNames(propsClasses.detailGridColumn, className)}
            {...{ item: true, xs: true, classes, ...gridProps }}
        >
            <div className={props.classes.cell}>
                {props.children}
            </div>
        </Grid>
    );
};

export default withStyles((theme): StyleRules =>
    ({
        detailGridColumn: {
            height: '100%',
            overflow: 'auto',
            paddingTop: theme.spacing.unit * 3,
            paddingBottom: theme.spacing.unit * 3,
            boxSizing: 'border-box',
            flex: '1 1 50%'
        },
        cell: {
            paddingLeft: theme.spacing.unit * 2,
            paddingRight: theme.spacing.unit * 2,
            paddingTop: theme.spacing.unit * 2,
            paddingBottom: theme.spacing.unit * 2,
            overflow: 'hidden'
        },
    }))(DetailGridColumn);