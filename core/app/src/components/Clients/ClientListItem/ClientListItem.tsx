import * as React from 'react';
import { InjectedIntlProps } from 'react-intl';
import * as md5 from 'md5';

import ItemPreview, { Line, Lines, Thumb } from '../../ItemPreview/ItemPreview';
import { Client } from 'src/@types/our-orders';
import { WithStyles, withStyles, Avatar } from '@material-ui/core';
import { OurTheme } from 'src/components/ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import PersonPreview from 'src/components/PersonPreview';

type injectedClasses = 'container' | 'bold' | 'spacing';
export type ClientListItemProps = InjectedIntlProps & WithStyles<injectedClasses> & {
    classNames?: string[];
    client?: Client;
    onClick?: () => void;
};

export const ClientListItem: React.SFC<ClientListItemProps> = (props) => {
    const { onClick, client, classes } = props;

    if (!client) {
        return (
            <div className={classes.container}>
                <ItemPreview>
                    <Thumb />
                    <Lines>
                        <Line loading={true} />
                        <Line loading={true} />
                    </Lines>
                </ItemPreview>
            </div>
        );
    }

    const md5Hash = client.Email ? md5(client.Email) : '';

    return (
        <div
            onClick={onClick}
            className={classes.container}
        >
            <ItemPreview>
                <Avatar src={`https://www.gravatar.com/avatar/${md5Hash}?d=mm`} />
                <div className="clients-list-item__lines">
                    <Lines>
                        <Line>
                            {client && <PersonPreview person={client} />}
                        </Line>
                        <Line>
                            {client.Address &&
                                <span className={classes.spacing}>
                                    {client.Address}
                                </span>
                            }
                            {client.PostalCode &&
                                <span  className={classes.spacing}>
                                    {client.PostalCode}
                                </span>
                            }
                            {client.City &&
                                <span className={classes.spacing}>
                                    {client.City}
                                </span>
                            }
                            {client.CountryIso &&
                                <span>
                                    {client.CountryIso}
                                </span>
                            }
                        </Line>
                        <Line>
                            {client.Email &&
                                <a 
                                    className={classes.spacing}
                                    href={`mailto:${client.Email}`}
                                >
                                    {client.Email}
                                </a>
                            }
                            {client.CellPhone &&
                                <span className={classes.spacing}>
                                    {client.CellPhone}
                                </span>
                            }
                            {!client.CellPhone && client.Phone &&
                                <span>
                                    {client.Phone}
                                </span>
                            }
                        </Line>
                    </Lines>
                </div>
            </ItemPreview>
        </div>
    );
};

export default withStyles((theme: OurTheme): StyleRules<injectedClasses> => {
    return {
        container: {
            paddingLeft: theme.spacing.unit * 2,
            paddingRight: theme.spacing.unit * 2
        },
        bold: {
            fontWeight: 'bold',
            color: 'black'
        },
        spacing: {
            marginRight: theme.spacing.unit
        }
    };
})(ClientListItem);