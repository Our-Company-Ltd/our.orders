import * as React from 'react';
import { generate as shortid } from 'shortid';

import { arrayMove, SortEnd } from 'react-sortable-hoc';
import { Dispatch } from 'src/@types/our-orders';
import DispatchFields from './DispatchFields';
import { InjectedIntlProps, injectIntl, FormattedMessage } from 'react-intl';
import DispatchListMessages from './DispatchListMessages';

import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import { Button, Grid, WithStyles, withStyles } from '@material-ui/core';
import { SortableListItemsContainer, SortableListItem } from 'src/_helpers/SortableListItem/SortableListItem';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';

type injectedClasses = 'root' | 'button';

export type DispatchListProps =
    WithStyles<injectedClasses> &
    InjectedIntlProps & {
        list?: Dispatch[];
        preview: Dispatch[];
        onChange: (changes: Dispatch[]) => void;
        hasRights: boolean;
    };
interface State {
    activeUID?: string;
}

class DispatchList extends React.Component<DispatchListProps, State> {
    constructor(props: DispatchListProps) {
        super(props);
        this._handleMoveItem = this._handleMoveItem.bind(this);
        this._handleAddItem = this._handleAddItem.bind(this);
        this.state = {

        };
    }
    shouldComponentUpdate(nextProps: DispatchListProps, nextState: State) {
        if (nextProps.onChange !== this.props.onChange) { return true; }
        if (JSON.stringify(nextProps.list) !== JSON.stringify(this.props.list)) { return true; }
        if (JSON.stringify(nextProps.preview) !== JSON.stringify(this.props.preview)) { return true; }
        if (nextState.activeUID !== this.state.activeUID) { return true; }
        return false;
    }
    render(): JSX.Element {
        const items = this.props.list || [];
        const { preview, classes, hasRights } = this.props;

        return (
            <React.Fragment>
                <SortableListItemsContainer onSortEnd={this._handleMoveItem} pressDelay={200}>
                    {items.map((item, index) => {

                        const itemPreview = preview.find(i => i.Id === item.Id) || item;

                        return (
                            <SortableListItem key={item.Id} index={index}>
                                <DispatchFields
                                    initial={item}
                                    changes={item}
                                    preview={itemPreview}
                                    onChange={(i) => this._handleItemChange(item.Id, i)}
                                    onRequestRemove={() => this._handleRemoveItem(item.Id)}
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
                    {hasRights && <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={this._handleAddItem}
                    >
                        <FormattedMessage {...DispatchListMessages.addDispatch} />
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
        const items = this.props.list || [];
        const newItems = [...items, { Id: shortid(), Date: new Date().toISOString() } as Dispatch];

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
    private _handleItemChange(uid: string, value: Partial<Dispatch>) {
        const items = this.props.list || [];
        const newItems = [...items];
        const index = newItems.findIndex(i => i.Id === uid);

        if (index < 0) {
            newItems.push(value as Dispatch);
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
}))(injectIntl(DispatchList)));