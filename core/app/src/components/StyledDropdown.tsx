import * as React from 'react';
import Dropdown, {
    DropdownProps,
    DropdownToggle,
    DropdownToggleProps,
    DropdownMenuProps,
    DropdownMenu
} from '@trendmicro/react-dropdown';

export const StyledDropdown: React.SFC<DropdownProps> = (props) => {
    return (
        <Dropdown
            style={{ border: 0, lineHeight: 'inherit', width: '100%' }}
            {...props}
        />);

};

export const DropdownMenuWithStyle =
    (props?: DropdownMenuProps, children?: React.ReactNode): React.ReactElement<DropdownMenu> => {
        return (
            <DropdownMenu
                {...props}
                style={{
                    overflow: 'auto',
                    maxHeight: '10rem'
                }}
            >
                {children}
            </DropdownMenu>);
    };

export const DropdownToggleWithStyle =
    (props?: DropdownToggleProps, children?: React.ReactNode): React.ReactElement<DropdownToggle> => {
        return (
            <DropdownToggle
                btnStyle="link"
                style={{
                    padding: '0',
                    border: 0,
                    lineHeight: 'inherit',
                    fontSize: 'inherit',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    minHeight: '2rem'
                }}
                {...props}
            >
                {children}
            </DropdownToggle>);
    };

export default StyledDropdown;