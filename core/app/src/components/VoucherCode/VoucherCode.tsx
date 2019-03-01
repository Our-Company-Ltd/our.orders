import * as React from 'react';

import { Grid } from '@material-ui/core';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { withStyles, WithStyles } from '@material-ui/core/styles';
import { GridContainer } from 'src/components/GridContainer/GridContainer';
import * as classNames from 'classnames';
import { InjectedAuthProps } from 'src/_context';
import { IsAdminOrInRole } from 'src/_helpers/roles';
import { Roles } from 'src/@types/our-orders';

type injectedClasses = 'input' | 'inputWrong' | 'inputGood';
export type VoucherCodeProps =
    WithStyles<injectedClasses> &
    InjectedAuthProps & {
        code: string[];
        onChange: (code: string[]) => void;
        valid?: boolean;
    };

type State = {
};

export const CODE_LENGTH = 6;

class VoucherCode extends React.Component<VoucherCodeProps, State> {
    private _inputs: React.RefObject<HTMLInputElement>[] =
        Array.from({ length: CODE_LENGTH }, () => React.createRef<HTMLInputElement>());
    constructor(props: VoucherCodeProps) {
        super(props);
        this.state = {};
    }
    render() {
        const { classes, onChange, valid, code, authCtx: { user} } = this.props;

        const canEdit = IsAdminOrInRole(user, Roles.CRUD_Vouchers);

        const change = (index: number) =>
            (e: React.ChangeEvent<HTMLInputElement>) => {
                const value = e.target.value[0] || '';
                const next = this._inputs[index + 1];
                if (value && next && next.current) {
                    next.current.focus();
                }
                const newCode = Array.from({ length: CODE_LENGTH }, (v, i) => i === index ? value : (code[i] || ''));
                onChange(newCode);
            };
        return (
            <GridContainer>
                {this._inputs.map((x, i) =>
                    <Grid key={i} item={true} xs={2}>
                        <input
                            ref={x}
                            className={classNames(
                                classes.input,
                                valid === false && classes.inputWrong,
                                valid === true && classes.inputGood
                            )}
                            value={code[i] || ''}
                            onChange={change(i)}
                            disabled={!canEdit}
                        />
                    </Grid>
                )}
            </GridContainer>);
    }

}

export default withStyles((theme: OurTheme) =>
    ({
        input: {
            display: 'flex',
            height: 150,
            borderRadius: theme.shape.borderRadius,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: `inset 2px 1px 15px -7px rgba(0, 0, 0, 0.2)`,
            fontSize: 80,
            width: '100%',
            justifyContent: 'center',
            // tslint:disable-next-line:no-any
            textAlign: 'center' as any,
            fontFamily: 'monospace'
        },
        inputWrong: {
            borderColor: theme.palette.error.main,
            boxShadow: `inset 2px 1px 15px -7px ${theme.palette.error.light}`,
            color: theme.palette.error.main
        },
        inputGood: {
            borderColor: theme.Colors.green.primary.main,
            boxShadow: `inset 2px 1px 15px -7px ${theme.Colors.green.primary.light}`,
            color: theme.Colors.green.primary.main
        }
    }))(VoucherCode);
