import * as React from 'react';

import { SortableElement, SortableContainer, SortableContainerProps } from 'react-sortable-hoc';
import { withStyles, WithStyles, Grid } from '@material-ui/core';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import { GridContainer } from 'src/components/GridContainer/GridContainer';

class MoveItem extends React.Component<React.HTMLAttributes<HTMLDivElement>> {
    render() {
        return (
            <Grid item={true} {...this.props}>
                {this.props.children}
            </Grid>
        );
    }
}

export const SortableListItem = SortableElement(MoveItem);

type moveContainerInjectedClasses = 'root';
class MoveContainer extends React.Component<React.HTMLAttributes<HTMLDivElement>> {

    render() {
        return (
            <GridContainer direction="column" {...this.props}>
                {this.props.children}
            </GridContainer>
        );
    }
}
const SortableList = SortableContainer(MoveContainer);

const SortableListItemsContainerWithStyles:
    React.FunctionComponent<SortableContainerProps & WithStyles<moveContainerInjectedClasses>> =
    ({ classes, ...props }) => <SortableList helperClass={classes.root} {...props} />;
export const SortableListItemsContainer = withStyles((theme: OurTheme): StyleRules<moveContainerInjectedClasses> => ({
    root: {
        zIndex: theme.zIndex.tooltip,
        position: 'relative',
        '&:after' : {
            content: '""',
            zIndex: -1,
            position: 'absolute',
            left: -theme.spacing.unit,
            right: -theme.spacing.unit,
            top: 0,
            bottom: 0,
            boxShadow: theme.shadows[2],
            background: 'white'
        }

    }
}))(SortableListItemsContainerWithStyles);