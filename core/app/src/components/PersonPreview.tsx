import * as React from 'react';
import { Person } from 'src/@types/our-orders';
import { OurTheme } from './ThemeProvider/ThemeProvider';
import { StyleRules, withStyles } from '@material-ui/core/styles';
import { WithStyles } from '@material-ui/core';
export type injectedClasses =
    'firstName' |
    'lastname' |
    'organizationName' |
    'city';

export const PersonPreviewStyles = (theme: OurTheme): StyleRules<injectedClasses> => ({
    firstName: {
        display: 'inline-block',
        marginRight: 5
    },
    lastname: {
        display: 'inline-block',
        // marginRight: 5
    },
    organizationName: {
        display: 'inline-block',
        // marginRight: 5
    },
    city: {}
});

export type PersonProps = {
    person: Person;
} &
    WithStyles<injectedClasses>;
export const PersonPreview: React.SFC<PersonProps> = (props) => {
    const { person, classes } = props;
    const firstname = person.FirstName || undefined;
    const lastname = person.LastName || undefined;
    const organizationname = person.OrganizationName || undefined;

    return (
        <React.Fragment>
            {firstname &&
                <span className={classes.firstName}>
                    {firstname}
                </span>}
            {lastname &&
                <span className={classes.lastname}>
                    {lastname}
                </span>}
            {organizationname &&
                <span className={classes.organizationName}>
                    , {organizationname}
                </span>}
        </React.Fragment>);
};

export default withStyles(PersonPreviewStyles)(PersonPreview);