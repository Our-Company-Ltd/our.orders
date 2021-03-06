import * as React from 'react';
import SvgIcon, { SvgIconProps } from '@material-ui/core/SvgIcon';

/* tslint:disable:max-line-length */
export const CashIcon: React.SFC<SvgIconProps> = (props) => {
    return (
        <SvgIcon {...{viewBox: '0 0 100 100', ...props}}>
            <path 
                d="M27.7,46.5c0,4.8-3.9,8.7-8.7,8.7s-8.7-3.9-8.7-8.7s3.9-8.7,8.7-8.7S27.7,41.7,27.7,46.5 M41.2,63.7 
                c0-6-4.9-10.9-10.9-10.9s-10.9,4.9-10.9,10.9s4.9,10.9,10.9,10.9S41.2,69.7,41.2,63.7 M61.5,47.4c1.7,0.4,2.5,1.4,2.5,2.5
                c0,1.2-0.8,2.2-2.5,2.5V47.4 M59.5,44.4c-1.8-0.3-2.4-1.3-2.4-2.4c0-1.3,0.9-2.3,2.4-2.6V44.4 M61.5,57.4v-2.7c3.3-0.4,5-2.6,5-4.9
                c0-2.3-1.7-4.3-4.6-4.8l-0.4-0.1v-5.3c1.6,0.4,2.4,1.8,2.5,2.8l2.3-0.9c-0.4-1.7-1.7-3.8-4.9-4.2v-2.7h-2v2.7c-2.9,0.4-5,2.5-5,4.9
                c0,2.5,1.7,4.2,4.3,4.7l0.6,0.1v5.4c-2-0.4-3-2-3.2-3.6l-2.5,0.8c0.3,2.3,2,4.8,5.7,5.1v2.7H61.5z M60.7,60.5
                c8,0,14.5-6.5,14.5-14.5c0-8-6.5-14.5-14.5-14.5c-8,0-14.5,6.5-14.5,14.5C46.2,54,52.7,60.5,60.7,60.5 M89.8,65.8l-45.1,0
                C45.7,56,38.2,49.1,31,50c0,0,0-23.8,0-23.8h58.8V65.8z"
            />
        </SvgIcon>);
};

export default CashIcon;