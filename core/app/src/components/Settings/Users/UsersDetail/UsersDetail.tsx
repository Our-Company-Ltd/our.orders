
import * as React from 'react';

import { InjectedIntlProps } from 'react-intl';
import UserFields from '../UsersFileds/UsersFields';
import { Users } from 'src/_services';
import { User } from 'src/@types/our-orders';
import {
    DialogContent,
    DialogActions, Button,
    ButtonBase, InputLabel, InputAdornment, IconButton, FormControl, Input
} from '@material-ui/core';
import { FileCopy, OpenInNew, Delete } from '@material-ui/icons';
import { withSnackbar, InjectedNotistackProps } from 'notistack';
import UsersDetailMessages from './UsersDetailMessages';

export type UsersDetailProps = InjectedNotistackProps & InjectedIntlProps & {
    initial: User;
    changed: (shop: User) => void;
    onDelete: () => void;
    cancel: () => void;
};

type State = {
    changes: Partial<User>;
    resetLink?: string;
};

class UsersDetail extends React.Component<UsersDetailProps, State> {
    private _RegisterLinkRef: React.RefObject<HTMLInputElement> = React.createRef<HTMLInputElement>();
    constructor(props: UsersDetailProps) {
        super(props);
        this.state = {
            changes: {}
        };
    }

    render() {
        return this._renderUser();
    }

    private _renderUser() {

        const { cancel, initial: { Id }, intl, initial, enqueueSnackbar , intl: {formatMessage}} = this.props;
        const { changes, resetLink } = this.state;

        return (
            <React.Fragment>
                <DialogContent>
                    <form
                        onSubmit={(e) => { e.preventDefault(); this._OnSave(this.state.changes); }}
                    >
                        <UserFields
                            intl={intl}
                            initial={initial}
                            onChange={(user) => {
                                this.setState(prev => {
                                    return ({ changes: { ...prev.changes, ...user } });
                                });
                            }}
                            changes={this.state.changes}
                        />

                        {Id &&

                            <ButtonBase
                                disableRipple={true}
                                onClick={!resetLink ?
                                    (e) => { this._Reset(Id); e.preventDefault(); e.stopPropagation(); } :
                                    undefined
                                }
                                style={{ width: '100%', cursor: 'pointer' }}
                            >
                                <FormControl fullWidth={true}>
                                    <InputLabel>{formatMessage(UsersDetailMessages.resetPassword)}</InputLabel>
                                    <Input
                                        inputRef={this._RegisterLinkRef}
                                        fullWidth={true}
                                        type={'text'}
                                        value={resetLink || ''}
                                        endAdornment={
                                            resetLink && (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        onClick={
                                                            (e) => {
                                                                try {
                                                                    const input = this._RegisterLinkRef.current;
                                                                    if (input && resetLink) {
                                                                        input.select();
                                                                        document.execCommand('copy');
                                                                        enqueueSnackbar('link copied');
                                                                    }
                                                                }
                                                                finally {
                                                                    // prevent crash
                                                                }

                                                            }}
                                                    >
                                                        <FileCopy />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={
                                                            (e) => {
                                                                try {
                                                                    window.open(resetLink, '_blank');
                                                                }
                                                                finally {
                                                                    // prevent crash
                                                                }

                                                            }}
                                                    >
                                                        <OpenInNew />
                                                    </IconButton>
                                                </InputAdornment>)
                                        }
                                    />
                                </FormControl>
                            </ButtonBase>}
                    </form>
                </DialogContent>
                <DialogActions>
                    {Id &&
                        <Button color="secondary" variant="contained" onClick={() => this._OnDelete(Id)}>
                            <Delete />
                            {formatMessage(UsersDetailMessages.delete)}
                        </Button>}
                    <Button color="default" variant="contained" onClick={cancel}>close</Button>
                    {(Object.keys(changes).length && Id) &&
                        <Button color="primary" variant="contained" onClick={() => { this._OnSave(changes); }}>
                        {formatMessage(UsersDetailMessages.save)}
                        </Button>
                    }
                    {!Id &&
                        <Button color="primary" variant="contained" onClick={() => { this._OnAdd(changes); }}>
                            {formatMessage(UsersDetailMessages.create)}
                        </Button>
                    }

                </DialogActions>
            </React.Fragment>);
    }

    private _OnDelete(id: string) {

        const { onDelete, intl: { formatMessage } } = this.props;

        const isTodelete = window.confirm(formatMessage(UsersDetailMessages.deleteConfirm));

        if (isTodelete) {
            Users
                .Delete(id)
                .then(() => {
                    onDelete();
                });
        }
    }
    private _Reset(id: string) {
        Users
            .Reset(id)
            .then((resp) => {
                const base = location.href.replace(location.hash, '');
                // tslint:disable-next-line:max-line-length
                const hash = `action=reset&id=${encodeURIComponent(resp.Id)}&code=${encodeURIComponent(resp.Code)}&username=${encodeURIComponent(resp.Username)}`;
                const resetLink = `${base}#${hash}`;
                this.setState(() => ({ resetLink }));
            });
    }

    private _OnSave(changes: Partial<User>) {
        return Users
            .Patch(this.props.initial.Id, changes)
            .then(model => {
                this.setState(() => ({
                    initial: model,
                    changes: {},
                }));
                this.props.changed(model);
            });
    }

    private _OnAdd(changes: Partial<User>) {
        return Users
            .Create(changes)
            .then(model => {
                this.setState(() => ({
                    initial: model,
                    changes: {},
                }));
                this.props.changed(model);
            });
    }
}

export default withSnackbar(UsersDetail);