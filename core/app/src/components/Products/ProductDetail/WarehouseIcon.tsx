import * as React from 'react';
import SvgIcon, { SvgIconProps } from '@material-ui/core/SvgIcon';

/* tslint:disable:max-line-length */
export const WarehouseIcon: React.SFC<SvgIconProps> = (props) => {
    return (
        <SvgIcon {...{ viewBox: '0 0 640 512', ...props }}>
            <path d="M504,352H136.4c-4.4,0-8,3.6-8,8l-0.1,48c0,4.4,3.6,8,8,8H504c4.4,0,8-3.6,8-8v-48C512,355.6,508.4,352,504,352z" />
            <path d="M504,448H136.1c-4.4,0-8,3.6-8,8l-0.1,48c0,4.4,3.6,8,8,8h368c4.4,0,8-3.6,8-8v-48C512,451.6,508.4,448,504,448z" />
            <path d="M504,256H136.6c-4.4,0-8,3.6-8,8l-0.1,48c0,4.4,3.6,8,8,8H504c4.4,0,8-3.6,8-8v-48C512,259.6,508.4,256,504,256z" />
            <path d="M610.5,117L338.4,3.7c-11.8-4.9-25.1-4.9-36.9,0L29.5,117C11.7,124.5,0,141.9,0,161.3V504c0,4.4,3.6,8,8,8h80c4.4,0,8-3.6,8-8V256c0-17.6,14.6-32,32.6-32h382.8c18,0,32.6,14.4,32.6,32v248c0,4.4,3.6,8,8,8h80c4.4,0,8-3.6,8-8V161.3C640,141.9,628.3,124.5,610.5,117z" />
        </SvgIcon>);
};

export default WarehouseIcon;