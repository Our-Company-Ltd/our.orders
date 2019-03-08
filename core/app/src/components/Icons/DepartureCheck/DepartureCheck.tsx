import * as React from 'react';
import { SvgIcon } from '@material-ui/core';
import { SvgIconProps } from '@material-ui/core/SvgIcon';

/* tslint:disable:max-line-length */
export const DepartureCheck: React.SFC<SvgIconProps> = (props) => {
    return (
        <SvgIcon {...props}>
            <path 
                d="M16,1c-2.4,0-4.5,1.2-5.8,3.1c0,0,0,0,0,0C9.8,4,9.4,4,9,4C4.6,4,1,4.5,1,8v10c0,0.9,0.4,1.7,1,2.2V22c0,0.5,0.5,1,1,1h1
                c0.6,0,1-0.5,1-1v-1h8v1c0,0.5,0.4,1,1,1h1c0.6,0,1-0.5,1-1v-1.8c0.6-0.5,1-1.3,1-2.2v-3.1c3.4-0.5,6-3.4,6-6.9C23,4.1,19.9,1,16,1z
                M4.5,19C3.7,19,3,18.3,3,17.5S3.7,16,4.5,16S6,16.7,6,17.5S5.3,19,4.5,19z M3,13V8h6c0,2,0.8,3.7,2.1,5H3z M13.5,19
                c-0.8,0-1.5-0.7-1.5-1.5s0.7-1.5,1.5-1.5s1.5,0.7,1.5,1.5S14.3,19,13.5,19z M16,13c-2.8,0-5-2.2-5-5s2.2-5,5-5s5,2.2,5,5
                S18.8,13,16,13z M18.9,5.2l-4.1,4.1l-2.2-2.2L11.7,8l3.1,3.1l5-5L18.9,5.2z"
            />
        </SvgIcon>);
};

export default DepartureCheck;