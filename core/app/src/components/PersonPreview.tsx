import * as React from 'react';
import { Person } from 'src/@types/our-orders';

export const PersonPreview: React.SFC<Person> = (person) => {
    const firstname = person.FirstName || '';
    const lastname = person.LastName || '';
    const organizationname = person.OrganizationName || '';

    return (
        <React.Fragment>
            {firstname &&
                <span className="person-preview__firstname">
                    {firstname}
                </span>}
            {lastname &&
                <span className="person-preview__lastname">
                    {lastname}
                </span>}
            {organizationname &&
                <span className="person-preview__organization-name">
                    {organizationname}
                </span>}
        </React.Fragment>);
};

export default PersonPreview;