declare module '@trendmicro/react-dropdown' {
    import * as React from "react";

    export type DropdownProps = {
        style?: any;
        componentType?: any,

        // A custom element for this component.
        componentClass?: string | Function,

        // The menu will open above the dropdown button, instead of below it.
        dropup?: boolean,

        // Whether or not component is disabled.
        disabled?: boolean,

        // Whether or not the dropdown is visible.
        open?: boolean,

        // Whether to open the dropdown on mouse over.
        autoOpen?: boolean,

        // Align the menu to the right side of the dropdown toggle.
        pullRight?: boolean,

        // A callback fired when the dropdown closes.
        onClose?: () => void,

        // A callback fired when the dropdown wishes to change visibility. Called with the requested
        // `open` value.
        //
        // ```js
        // function(Boolean isOpen) {}
        // ```
        onToggle?: (isOpen: boolean) => void;

        // A callback fired when a menu item is selected.
        //
        // ```js
        // (eventKey: any, event: Object) => any
        // ```
        onSelect?: (eventKey: any, event: Object) => void;

        // If `'menuitem'`, causes the dropdown to behave like a menu item rather than a menu button.
        role?: 'menuitem' | undefined;

        // Which event when fired outside the component will cause it to be closed.
        rootCloseEvent?: 'click' | 'mousedown';

        onMouseEnter?: () => void;
        onMouseLeave?: () => void;
    };

    export class Dropdown extends React.Component<DropdownProps> { }

    export type BtnSize = 'lg' | 'md' | 'sm' | 'xs';

    export type BtnStyle = 'default' | 'primary' | 'emphasis' | 'flat' | 'link';

    export type DropdownButtonProps = DropdownProps & {

        // One of: 'lg', 'md', 'sm', 'xs'
        btnSize?: BtnSize,

        // One of: 'default', 'primary', 'emphasis', 'flat', 'link'
        btnStyle?: BtnStyle,

        // Title content.
        title: JSX.Element,

        // Whether to prevent a caret from being rendered next to the title.
        noCaret?: boolean
    };

    export class DropdownButton extends React.Component<DropdownButtonProps> { }

    export type DropdownToggleProps = DropdownProps & {
        style?: any;

        componentType?: any;

        // A custom element for this component.
        componentClass?: string | Function,

        // One of: 'lg', 'md', 'sm', 'xs'
        btnSize?: BtnSize,

        // One of: 'default', 'primary', 'emphasis', 'flat', 'link'
        btnStyle?: BtnStyle,

        // Whether to prevent a caret from being rendered next to the title.
        noCaret?: boolean,

        // Title content.
        title?: string,

        // Dropdown
        disabled?: boolean,

        open?: boolean
    };

    export class DropdownToggle extends React.Component<DropdownToggleProps> { }

    export type MenuItemProps = {
        componentType?: any;

        // A custom element for this component.
        componentClass?: string | Function;

        // Highlight the menu item as active.
        active?: boolean;

        // Disable the menu item, making it unselectable.
        disabled?: boolean;

        // Style the menu item as a horizontal rule, providing visual separation between groups of menu items.
        divider?: boolean;

        // Value passed to the `onSelect` handler, useful for identifying the selected menu item.
        eventKey?: any;

        // Style the menu item as a header label, useful for describing a group of menu items.
        header?: boolean;

        // Callback fired when the menu item is clicked, even if it is disabled.
        onClick?: () => void;

        // Dropdown
        open?: boolean;
        pullRight?: boolean;
        onClose?: () => void;
        onSelect?: () => void;
        rootCloseEvent?: 'click' | 'mousedown';
    };

    export class MenuItem extends React.Component<MenuItemProps> {

    }

    export type DropdownMenuProps = {
        style?: any;

        componentType?: any,

        // A custom element for this component.
        componentClass?: string | Function;

        // Dropdown
        open?: boolean;
        pullRight?: boolean;
        onClose?: () => void;
        onSelect?: () => void;
        rootCloseEvent?: 'click' | 'mousedown';
    };
    export class DropdownMenu extends React.Component<DropdownMenuProps> {

    }
    export default Dropdown;
    // DropdownToggle,
    // DropdownMenu,
    // DropdownMenuWrapper,
    // MenuItem,
    // DropdownButton

}