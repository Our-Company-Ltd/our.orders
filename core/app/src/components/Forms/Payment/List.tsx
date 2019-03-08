import * as React from 'react';

import { arrayMove, SortEnd } from 'react-sortable-hoc';
import PaymentFields from './Fields';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import { Button, Grid, WithStyles, withStyles } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import PaymentListMessages from './PaymentListMessages';
import { generate as shortid } from 'shortid';
import { Payment } from 'src/@types/our-orders';
import { SortableListItemsContainer, SortableListItem } from 'src/_helpers/SortableListItem/SortableListItem';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import { InjectedSettingsProps } from 'src/_context';

type injectedClasses = 'root' | 'button';

export type PaymentListProps =
    InjectedSettingsProps &
    WithStyles<injectedClasses> &
    {
        Total: number;
        PaidAmount: number;
        Currency?: string
        list?: Payment[];
        preview: Payment[];
        onChange: (changes: Payment[]) => void;
        hasRights: boolean;
    };
type State = {
    activeUID?: string;
};
class PaymentList extends React.Component<PaymentListProps, State> {
    constructor(props: PaymentListProps) {
        super(props);
        this._handleMoveItem = this._handleMoveItem.bind(this);
        this._handleAddItem = this._handleAddItem.bind(this);
        this.state = {
        };
    }

    shouldComponentUpdate(nextProps: PaymentListProps, nextState: State) {
        if (nextProps.Total !== this.props.Total) { return true; }
        if (nextProps.PaidAmount !== this.props.PaidAmount) { return true; }
        if (nextProps.Currency !== this.props.Currency) { return true; }
        if (nextProps.onChange !== this.props.onChange) { return true; }
        if (JSON.stringify(nextProps.list) !== JSON.stringify(this.props.list)) { return true; }
        if (JSON.stringify(nextProps.preview) !== JSON.stringify(this.props.preview)) { return true; }
        if (nextState.activeUID !== this.state.activeUID) { return true; }
        return false;
    }

    render(): JSX.Element {
        const { list, classes, settingsCtx, PaidAmount, Total, hasRights } = this.props;

        return (
            <React.Fragment>
                <SortableListItemsContainer onSortEnd={this._handleMoveItem} pressDelay={200}>
                    {list && list.map((item, index) => {
                        const itemPreview = this.props.preview.find(i => i.Id === item.Id) || item;
                        return (
                            <SortableListItem key={item.Id} index={index}>
                                <PaymentFields
                                    settingsCtx={settingsCtx}
                                    initial={item}
                                    changes={item}
                                    preview={itemPreview}
                                    onChange={(i) => this._handleItemChange(item.Id, i)}
                                    onRequestRemove={() => this._handleRemoveItem(item.Id)}
                                    Total={Total}
                                    PaidAmount={PaidAmount}
                                    hasRights={hasRights}
                                />
                            </SortableListItem>
                        );
                    })}
                </SortableListItemsContainer>
                <Grid
                    container={true}
                    direction="row"
                    justify="center"
                    alignItems="center"
                    className={classes.button}
                >
                    {hasRights &&
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={this._handleAddItem}
                        >
                            <FormattedMessage {...PaymentListMessages.addPayment} />
                            <PlaylistAddIcon style={{ paddingLeft: '7px' }} />
                        </Button>}
                </Grid>
            </React.Fragment>);
    }

    private _handleMoveItem(sortEnd: SortEnd) {
        const items = this.props.list || [];
        const newItems = arrayMove(items, sortEnd.oldIndex, sortEnd.newIndex);
        this.props.onChange(newItems);
    }

    private _handleAddItem() {
        const { list, settingsCtx: { Settings }, Currency } = this.props;
        const items = list || [];
        const newItems = [...items, {
            Id: shortid(),
            Date: new Date().toISOString(),
            Currency: Currency || Settings.Currencies[0]
        } as Payment];

        this.props.onChange(newItems);
    }

    private _handleRemoveItem(uid: string) {
        const items = this.props.list || [];
        const newItems = [...items];
        const index = newItems.findIndex(i => i.Id === uid);

        if (index < 0) {
            return;
        } else {
            newItems.splice(index, 1);
        }

        this.props.onChange(newItems);
    }
    private _handleItemChange(uid: string, value: Partial<Payment>) {
        const items = this.props.list || [];
        const newItems = [...items];
        const index = newItems.findIndex(i => i.Id === uid);

        if (index < 0) {
            newItems.push(value as Payment);
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
    }
}))(PaymentList));