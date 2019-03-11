import * as React from 'react';

import { generate as shortid } from 'shortid';
import OrderItemFields from './OrderItemFields';
import { arrayMove, SortEnd } from 'react-sortable-hoc';
import { InjectedIntlProps, defineMessages, FormattedMessage } from 'react-intl';

import OrderProductSelector from './OrderProductSelector';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';

import { Button, WithStyles, withStyles } from '@material-ui/core';
import { OrderItem, ProductSelection } from 'src/@types/our-orders';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import { InjectedCategoryProps } from 'src/_context/Category';
import { InjectedProductProps } from 'src/_context/Product';
import { InjectedWarehouseProps, InjectedSettingsProps } from 'src/_context';
import { SortableListItem, SortableListItemsContainer } from 'src/_helpers/SortableListItem/SortableListItem';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import { OrderItems } from 'src/_services';

type injectedClasses = 'root' | 'button' | 'subItemsList';

export type OrderItemListProps =
    WithStyles<injectedClasses> &
    InjectedIntlProps &
    InjectedCategoryProps &
    InjectedProductProps &
    InjectedWarehouseProps &
    InjectedSettingsProps &
    {
        orderPaid: boolean;
        currency: string;
        list?: OrderItem[];
        preview: OrderItem[];
        onChange: (changes: OrderItem[]) => void;
        leaf?: boolean;
        hasRights: boolean;
    };
interface State {
    selectorOpened: boolean;
}

export const OrderItemListMessages = defineMessages({
    addItem: {
        id: 'src.components.forms.orderitem.list.addItem',
        defaultMessage: 'Add item',
        description: 'Legend for add item button'
    },
    newProduct: {
        id: 'src.components.forms.orderitem.list.newProduct',
        defaultMessage: 'Add product',
        description: 'Title for New product item in product list'
    }
});
class OrderItemList extends React.Component<OrderItemListProps, State> {

    constructor(props: OrderItemListProps) {
        super(props);
        this._addEmpty = this._addEmpty.bind(this);
        this._handleMoveItem = this._handleMoveItem.bind(this);
        this.state = { selectorOpened: false };
    }

    shouldComponentUpdate(nextProps: OrderItemListProps, nextState: State) {
        if (nextProps.orderPaid !== this.props.orderPaid) { return true; }
        if (nextProps.currency !== this.props.currency) { return true; }
        if (nextProps.leaf !== this.props.leaf) { return true; }
        if (nextProps.onChange !== this.props.onChange) { return true; }
        if (JSON.stringify(nextProps.list) !== JSON.stringify(this.props.list)) { return true; }
        if (JSON.stringify(nextProps.preview) !== JSON.stringify(this.props.preview)) { return true; }
        if (JSON.stringify(nextState) !== JSON.stringify(this.state)) { return true; }
        return false;
    }

    render(): JSX.Element {
        const { 
            warehouseCtx,
            settingsCtx,
            intl,
            productCtx,
            categoryCtx,
            orderPaid,
            currency,
            leaf,
            hasRights,
            classes } = this.props;

        const items = this.props.list || [];
        const preview = this.props.preview || [];

        return (
            <React.Fragment>
                <SortableListItemsContainer onSortEnd={this._handleMoveItem} pressDelay={200}>
                    {items.map((item, index) => {
                        const itemPreview = preview.find(i => i.UID === item.UID) || item;
                        return (
                            <SortableListItem key={item.UID} index={index}>
                                <OrderItemFields
                                    {...{ intl, warehouseCtx, settingsCtx, orderPaid, currency, categoryCtx }}
                                    initial={item}
                                    changes={item}
                                    preview={itemPreview}
                                    onChange={(i) => this._handleItemChange(item.UID, i)}
                                    onRequestRemove={() => this._handleRemoveItem(item.UID)}
                                    onRequestAddSubItem={() => this._handleAddSubItem(item.UID)}
                                    leaf={!!leaf}
                                    hasRights={hasRights}
                                />

                                {!this.props.leaf && item.Items && item.Items.length !== 0 &&
                                    <div className={classes.subItemsList}>
                                        <OrderItemList
                                            {...{
                                                intl, warehouseCtx, settingsCtx, hasRights,
                                                productCtx, categoryCtx, orderPaid, currency, classes
                                            }}
                                            key={`${item.UID}-subitems`}
                                            preview={itemPreview.Items}
                                            onChange={(i) => this._handleItemChange(item.UID, { Items: i })}
                                            list={item.Items}
                                            leaf={true}
                                        />
                                    </div>
                                }

                            </SortableListItem>
                        );
                    })}

                </SortableListItemsContainer>
                {hasRights && !leaf &&
                    this._renderProductList()
                }
            </React.Fragment>);
    }

    private _renderProductList() {
        const { intl, settingsCtx, productCtx, categoryCtx, warehouseCtx, classes, currency } = this.props;
        const { selectorOpened } = this.state;
        const open = () => this.setState(() => ({ selectorOpened: true }));
        const close = () => this.setState(() => ({ selectorOpened: false }));
        // TODO: select from product List in localization
        return (

            <GridContainer
                direction="row"
                justify="center"
                alignItems="center"
            >

                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={open}
                    className={classes.button}
                >
                    <FormattedMessage {...OrderItemListMessages.addItem} />
                    <PlaylistAddIcon style={{ paddingLeft: '7px' }} />
                </Button>
                <OrderProductSelector
                    {...{ intl, settingsCtx, productCtx, categoryCtx, warehouseCtx, currency }}
                    onSelectEmpty={this._addEmpty}
                    open={selectorOpened}
                    onClose={close}
                    onConfirm={(selections) =>
                        this._handleProductsSelectChange(selections)}
                />
            </GridContainer>);
    }
    private _handleMoveItem(sortEnd: SortEnd) {
        const items = this.props.list || [];
        const newItems = arrayMove(items, sortEnd.oldIndex, sortEnd.newIndex);
        this.props.onChange(newItems);
    }
    private _addEmpty() {
        const { settingsCtx: { Settings: { TaxRateExcluded, TaxRateIncluded } } } = this.props;
        const items = this.props.list || [];
        const title = this.props.intl.formatMessage(OrderItemListMessages.newProduct);

        const partial = {
            Title: title,
            Price: {
                TaxRateExcluded: TaxRateExcluded === undefined ? 0 : TaxRateExcluded,
                TaxRateIncluded: TaxRateIncluded === undefined ? 0 : TaxRateIncluded,
            },
        } as Partial<OrderItem>;
        
        OrderItems.Empty(partial).then(empty => {
            this.props.onChange([...items, empty]);
        });
    }
    private _handleProductsSelectChange(selections: ProductSelection[]) {

        const items = this.props.list || [];

        // selection : quantity and options of each menu item :

        OrderItems.FromProducts(selections, this.props.currency).then((orderitems) => {
            if (!orderitems || !orderitems.length) { return; }
            const newItems = [...items, ...orderitems];
            this.setState(() => ({ selectorOpened: false }));

            this.props.onChange(newItems);
        });
    }
    private _handleAddSubItem(uid: string) {
        const items = this.props.list || [];
        const item = items.find(i => i.UID === uid);

        if (!item) { return; }

        const newUID = shortid();
        const old = item.Items ? [...item.Items] : [];

        const newItems = [...old, { UID: newUID } as OrderItem];

        this._handleItemChange(uid, { Items: newItems });
    }

    private _handleRemoveItem(uid: string) {
        const items = this.props.list || [];
        const newItems = [...items];
        const index = newItems.findIndex(i => i.UID === uid);

        if (index < 0) {
            return;
        } else {
            newItems.splice(index, 1);
        }

        this.props.onChange(newItems);
    }
    private _handleItemChange(uid: string, value: Partial<OrderItem>) {
        const items = this.props.list || [];
        const newItems = [...items];
        const index = newItems.findIndex(i => i.UID === uid);

        if (index < 0) {
            newItems.push(value as OrderItem);
        } else {
            newItems[index] = { ...newItems[index], ...value };
        }

        this.props.onChange(newItems);
    }
}

export default React.memo(withStyles((theme: OurTheme): StyleRules<injectedClasses> => ({
    root: {
    },
    button: {
        marginTop: theme.spacing.unit
    },
    subItemsList: {
        paddingLeft: '1.8rem'
    }
}))(OrderItemList));