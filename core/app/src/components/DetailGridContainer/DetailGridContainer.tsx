
import * as React from 'react';
import Grid, { GridProps } from '@material-ui/core/Grid';
import { withStyles, WithStyles } from '@material-ui/core';

const DetailGridContainer: React.SFC<GridProps & WithStyles<'detailGridContainer' | 'childrenWrapper'>> = (props) => {
    const { detailGridContainer, childrenWrapper, ...classes } = props.classes;
    const { classes: propsClasses, ...gridProps } = props;
    return (
        <div
            className={props.classes.detailGridContainer}
        >
            <Grid
                style={{ height: '100%', position: 'relative', flexWrap: 'nowrap' }}
                {...{ container: true, spacing: 0, direction: 'row', classes, ...gridProps }}
            >
                <Grid item={true} className={props.classes.childrenWrapper} />
                {props.children}
                <Grid item={true} className={props.classes.childrenWrapper} />
            </Grid>
        </div>
    );
};

export default withStyles((theme) =>
    ({
        detailGridContainer: {

            height: '100%',
            position: 'relative',
            boxSizing: 'border-box',

        },
        childrenWrapper: {
            width: 50,
            flex: '0 0 50px'
        }
    }))(DetailGridContainer);