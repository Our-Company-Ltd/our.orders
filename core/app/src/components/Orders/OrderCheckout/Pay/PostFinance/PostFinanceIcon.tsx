import * as React from 'react';
import SvgIcon, { SvgIconProps } from '@material-ui/core/SvgIcon';

/* tslint:disable:max-line-length */
export const PostFinanceIcon: React.SFC<SvgIconProps> = (props) => {
    return (
        <SvgIcon {...{viewBox: '0 0 60 60', ...props}}>
            <path 
                d="M12.2,33.5h2.2c7.1,0,11.1-3.5,11.1-9.4c0-4.4-3.1-7.2-8.4-7.2h-6.6l-5,23.8h5.1L12.2,33.5z M14.8,21.3h2.1
                c2.3,0,3.5,1,3.5,3.2c0,2.9-1.8,4.6-5.1,4.6h-2.1L14.8,21.3z"
            />
            <polygon points="3.8,48.5 24.1,48.5 24.9,44.6 4.6,44.6 	"/>
            <path 
                d="M45.5,23.1c0,0,2.5-11.4,2.5-11.5H32.2c0,0.1-3.3,15.1-3.3,15.2h4c0,0,2.5-11.4,2.5-11.4h7.7
                c0,0-2.4,11.4-2.5,11.5h11.7l-1.5,7H39.2c0,0.1-2.3,10.7-2.3,10.7h-8.8c0,0-0.8,3.8-0.8,3.9h12.9c0,0,2.3-10.7,2.3-10.7h11.6
                c0,0,3.1-14.6,3.1-14.7H45.5z"
            />
        </SvgIcon>);
};

export default PostFinanceIcon;