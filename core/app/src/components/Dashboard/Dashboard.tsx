import * as React from 'react';

import { InjectedIntlProps, FormattedNumber, FormattedMessage, FormattedDate } from 'react-intl';
// import { Users } from '../../_services';
import {
    InjectedShopProps,
    InjectedAuthProps,
    InjectedUsersProps,
    InjectedWarehouseProps,
    InjectedSettingsProps
} from '../../_context';
import {
    WithStyles,
    List,
    withStyles,
    Tooltip,
    IconButton,
    Grid,
    ListItemText,
    Select,
    MenuItem,
    ListItemIcon,
    Button,
    Dialog,
    DialogContent,
    DialogActions,
    DialogTitle,
    Avatar
} from '@material-ui/core';

import ListItem from '@material-ui/core/ListItem';
import {
    TimeInterval, StatisticReport, StatisticsDimension, StatisticMetric, StatisticPeriodReport
} from 'src/@types/our-orders';
import {
    People, ShowChart, PieChart as PieChartIcon, Person, Store, AccessTime,
    Layers, Check, CheckBox, CheckBoxOutlineBlank
} from '@material-ui/icons';
import * as classNames from 'classnames';
import { GridContainer } from '../GridContainer/GridContainer';
import { OurTheme } from '../ThemeProvider/ThemeProvider';
import { StyleRules } from '@material-ui/core/styles';
import { Orders } from 'src/_services';
import { AutoSizer } from 'react-virtualized';
import { LineChart, Line, Tooltip as ChartTooltip, PieChart, Pie, TooltipProps } from 'recharts';
import * as moment from 'moment';
import { DashboardMessages } from './DashboardMessages';
import { InjectedProductProps } from 'src/_context/Product';
import ProductList from '../Products/ProductList/ProductList';
import { InjectedCategoryProps } from 'src/_context/Category';
import Fabs from '../Fabs/Fabs';
import DateTimeField from '../DateTimeField/DateTimeField';
import { formatedDateOptions } from 'src/_helpers/formatedDates';
export type periods =
    'today' |
    'yesterday' |
    'thisweek' |
    'lastweek' |
    'thismonth' |
    'lastmonth' |
    'thisyear' |
    'lastyear' |
    'last7days' |
    'last30days' |
    'last5years' |
    'custom';

type injectedClasses =
    'containerCls' |
    'menu' |
    'menuContainer' |
    'menuItemLast' |
    'main' |
    'mainInner' |
    'menuItem' |
    'menuItemActive' |
    'tooltip' |
    'submenu' |
    'submenuOpen' |
    'submenuClose' |
    'submenuContent' |
    'listItemText' |
    'periodSelectIcon' |
    'periodSelect' |
    'line' |
    'pie' |
    'chartTooltip' |
    'chartTooltipTitle' |
    'chartSideBar' |
    'listItemIcon' |
    'listItemIconCheckbox' |
    'listItemIconPerson' |
    'listItemIconChecked' |
    'listItemIconWrapper';

export type dashboardProps =
    InjectedAuthProps &
    InjectedProductProps &
    InjectedIntlProps &
    InjectedShopProps &
    InjectedCategoryProps &
    InjectedWarehouseProps &
    InjectedSettingsProps &
    InjectedUsersProps &
    WithStyles<injectedClasses> &
    {
    };

type TValue = { [key in StatisticMetric]: number; } & { label: string };
type ProcessedData = {
    global: { [key in StatisticMetric]: number };
    currency: string;
    values: TValue[];
};

type graphTypes = 'lines' | 'pie';
type State = {
    labels: string[];
    dimension: StatisticsDimension;
    metric: StatisticMetric;
    period: periods;

    customPeriodFrom: Date;
    customPeriodTo: Date;
    customPeriodOpened?: boolean;

    productListOpened?: boolean;
    submenuOpen?: boolean;
    timePickerOpened?: boolean;

    fetching?: boolean;
    report?: StatisticReport;
    data?: ProcessedData;

    graphType: graphTypes;
    selectMultiple?: boolean;
};

const LOCAL_STORAGE_KEY = 'our.orders.Dashboard';

class Dashboard extends React.Component<dashboardProps, State> {

    constructor(props: dashboardProps) {
        super(props);

        const now = moment().utc();
        this.state = {
            labels: [],
            customPeriodFrom: moment.utc(localStorage.getItem(`${LOCAL_STORAGE_KEY}.customPeriodFrom`)
                || now.clone().subtract(15, 'days')).toDate(),
            customPeriodTo: moment.utc(localStorage.getItem(`${LOCAL_STORAGE_KEY}.customPeriodTo`)
                || now.clone()).toDate(),
            metric: localStorage.getItem(`${LOCAL_STORAGE_KEY}.metric`) as StatisticMetric
                || 'Amount',
            period: localStorage.getItem(`${LOCAL_STORAGE_KEY}.period`) as periods
                || 'thismonth',
            dimension: localStorage.getItem(`${LOCAL_STORAGE_KEY}.dimension`) as StatisticsDimension
                || 'Shops',
            graphType: localStorage.getItem(`${LOCAL_STORAGE_KEY}.graphType`) as graphTypes
                || 'lines',
        };
    }

    componentDidMount() {
        this._fetch();
    }

    componentDidUpdate(prevProps: dashboardProps, prevState: State) {
        setTimeout(
            () => {
                const {
                    dimension: olddimension,
                    metric: oldmetric,
                    period: oldperiod,
                    customPeriodFrom: oldcustomPeriodFrom,
                    customPeriodTo: oldcustomPeriodTo,
                    graphType: oldgraphType
                } = prevState;
                const {
                    dimension,
                    metric,
                    period,
                    customPeriodFrom,
                    customPeriodTo,
                    graphType
                } = this.state;

                if (olddimension !== dimension) {
                    localStorage.setItem(`${LOCAL_STORAGE_KEY}.dimension`, dimension);
                }
                if (oldmetric !== metric) {
                    localStorage.setItem(`${LOCAL_STORAGE_KEY}.metric`, metric);
                }
                if (oldperiod !== period) {
                    localStorage.setItem(`${LOCAL_STORAGE_KEY}.period`, period);
                }
                if (oldcustomPeriodFrom.toString() !== customPeriodFrom.toString()) {
                    localStorage.setItem(`${LOCAL_STORAGE_KEY}.customPeriodFrom`, customPeriodFrom.toString());
                }
                if (oldcustomPeriodTo.toString() !== customPeriodTo.toString()) {
                    localStorage.setItem(`${LOCAL_STORAGE_KEY}.customPeriodTo`, customPeriodTo.toString());
                }
                if (oldgraphType.toString() !== graphType.toString()) {
                    localStorage.setItem(`${LOCAL_STORAGE_KEY}.graphType`, graphType.toString());
                }
            },
            0
        );

    }
    render() {
        const {
            classes,
            intl: { formatMessage },
            shopCtx: { Shops },
            usersCtx: { Users },
            categoryCtx,
            warehouseCtx,
            settingsCtx,
            productCtx,
            productCtx: { products },
            intl
        } = this.props;

        const {
            submenuOpen,
            productListOpened,
            labels, metric, period, dimension,
            data,
            graphType,
            customPeriodFrom,
            customPeriodTo,
            customPeriodOpened,
            selectMultiple
        } = this.state;

        const shopsActive = dimension === 'Shops';
        const usersActive = dimension === 'Users';
        const productsActive = dimension === 'Products';

        // const openPicker = () => this.setState(() => ({ timePickerOpened: true }));
        const changePeriod = (p: periods) => {
            this.setState(() => ({ period: p, customPeriodOpened: p === 'custom' }), () => this._fetch());
        };

        const toggleLabel = (label: string) => () => {
            this.setState(
                (prev) => {
                    const lbls = prev.labels.indexOf(label) >= 0 ?
                        prev.labels.filter(l => l !== label) : [label];
                    return ({
                        selectMultiple: lbls.length > 1 ? true : false,
                        labels: lbls,
                        productListOpened: false,
                        data: prev.report ? this._getData(prev.report, lbls, prev.period) : prev.data
                    });
                }
            );
        };

        const toggleLabels = (label: string) => () => {
            this.setState(
                (prev) => {
                    const lbls = prev.labels.indexOf(label) >= 0 ?
                        prev.labels.filter(l => l !== label) :
                        [...prev.labels, label];
                    return ({
                        selectMultiple: lbls.length < 1 ? false : true,
                        labels: lbls,
                        productListOpened: false,
                        data: prev.report ? this._getData(prev.report, lbls, prev.period) : prev.data
                    });
                }
            );
        };

        const confirmProducts = () => {
            this.setState(
                (prev) => {
                    return ({
                        productListOpened: false,
                        submenuOpen: true,
                        data: prev.report ? this._getData(prev.report, prev.labels, prev.period) : prev.data
                    });
                }
            );
        };

        const openProducts = () => {
            this.setState(
                () => {
                    return ({
                        productListOpened: true
                    });
                }
            );

        };

        const changeDimension = (d: StatisticsDimension) => {

            this.setState(
                (prev) =>
                    (
                        {
                            dimension: d,
                            labels: [],
                            submenuOpen: prev.dimension === d ? !prev.submenuOpen : true
                        }
                    ),
                () => this._fetch()
            );
        };

        const closeProductList = () => this.setState(() => ({ productListOpened: false }));

        const values = data && data.values;
        return (
            <GridContainer className={classes.containerCls} spacing={0}>
                <Grid
                    item={true}
                    className={classes.menuContainer}
                >
                    <List
                        className={classes.menu}
                    >
                        <ListItem
                            onClick={() => changeDimension('Shops')}
                            className={
                                classNames(
                                    classes.menuItem,
                                    shopsActive && classes.menuItemActive
                                )
                            }
                        >
                            <Tooltip
                                title={intl.formatMessage(DashboardMessages.shopsBtn)}
                                placement="right"
                                classes={{ tooltip: classes.tooltip }}
                            >
                                <IconButton>
                                    <Store />
                                </IconButton>
                            </Tooltip>
                        </ListItem>
                        <ListItem
                            onClick={() => changeDimension('Users')}
                            className={
                                classNames(
                                    classes.menuItem,
                                    usersActive && classes.menuItemActive
                                )
                            }
                        >
                            <Tooltip
                                title={intl.formatMessage(DashboardMessages.usersBtn)}
                                placement="right"
                                classes={{ tooltip: classes.tooltip }}
                            >
                                <IconButton>
                                    <People />
                                </IconButton>
                            </Tooltip>
                        </ListItem>
                        <ListItem
                            onClick={() => {
                                openProducts();
                                changeDimension('Products');
                            }}
                            className={
                                classNames(
                                    classes.menuItem,
                                    productsActive && classes.menuItemActive
                                )
                            }
                        >
                            <Tooltip
                                title={intl.formatMessage(DashboardMessages.productsBtn)}
                                placement="right"
                                classes={{ tooltip: classes.tooltip }}
                            >
                                <IconButton>
                                    <Layers />
                                </IconButton>
                            </Tooltip>
                        </ListItem>
                    </List>
                </Grid>
                <Grid
                    item={true}
                    className={classNames(classes.submenu, {
                        [classes.submenuOpen]: submenuOpen,
                        [classes.submenuClose]: !submenuOpen,
                    })}
                >
                    <List className={classes.submenuContent}>
                        {shopsActive &&
                            Shops.map((shop) => {
                                return (
                                    <ListItem
                                        key={`shop-${shop.Id}`}
                                        button={true}
                                        className={classNames(
                                            classes.menuItem,
                                            labels.indexOf(shop.Id) >= 0 && classes.menuItemActive
                                        )}
                                    >
                                        <div className={classes.listItemIconWrapper}>
                                            <ListItemIcon
                                                className={classNames(
                                                    classes.listItemIcon,
                                                    classes.listItemIconPerson)}
                                            >
                                                {selectMultiple ?
                                                    labels.indexOf(shop.Id) >= 0 ?
                                                        <CheckBox /> : <CheckBoxOutlineBlank /> : <Store />
                                                }
                                            </ListItemIcon>
                                            <ListItemIcon
                                                className={
                                                    classNames(
                                                        classes.listItemIcon,
                                                        classes.listItemIconCheckbox)}
                                                onClick={toggleLabels(shop.Id)}
                                            >
                                                {labels.indexOf(shop.Id) >= 0 ?
                                                    <CheckBox /> : <CheckBoxOutlineBlank />}
                                            </ListItemIcon>
                                        </div>
                                        <ListItemText
                                            className={classes.listItemText}
                                            onClick={toggleLabel(shop.Id)}
                                        >
                                            {shop.Name}
                                        </ListItemText>
                                    </ListItem>
                                );
                            })
                        }
                        {usersActive &&
                            Users.map((user) => {
                                return (
                                    <ListItem
                                        key={`user-${user.Id}`}
                                        button={true}
                                        className={classNames(
                                            classes.menuItem,
                                            labels.indexOf(user.Id) >= 0 && classes.menuItemActive
                                        )}
                                    >

                                        <div className={classes.listItemIconWrapper}>
                                            <ListItemIcon
                                                className={classNames(
                                                    classes.listItemIcon,
                                                    classes.listItemIconPerson)}
                                            >
                                                {selectMultiple ?
                                                    labels.indexOf(user.Id) >= 0 ?
                                                        <CheckBox /> : <CheckBoxOutlineBlank /> : <Person />
                                                }
                                            </ListItemIcon>
                                            <ListItemIcon
                                                className={
                                                    classNames(
                                                        classes.listItemIcon,
                                                        classes.listItemIconCheckbox)}
                                                onClick={toggleLabels(user.Id)}
                                            >
                                                {labels.indexOf(user.Id) >= 0 ?
                                                    <CheckBox /> : <CheckBoxOutlineBlank />}
                                            </ListItemIcon>
                                        </div>
                                        <ListItemText
                                            onClick={toggleLabel(user.Id)}
                                            className={classes.listItemText}
                                        >
                                            {user.FirstName} {user.LastName}
                                        </ListItemText>
                                    </ListItem>
                                );
                            })
                        }
                        {productsActive &&
                            <React.Fragment>
                                {labels.map(l => {
                                    const product = products.find(p => p.Id === l);
                                    return product ? (
                                        <ListItem
                                            key={`product-${product.Id}`}
                                            button={true}
                                            onClick={toggleLabel(product.Id)}
                                            className={classNames(
                                                classes.menuItem
                                            )}
                                        >
                                            {product.Src && <ListItemIcon >
                                                <Avatar src={product.Src} />
                                            </ListItemIcon>}
                                            <ListItemText className={classes.listItemText}>
                                                {product.Title}
                                            </ListItemText>
                                        </ListItem>) : null;
                                })}
                                <Dialog
                                    open={!!productListOpened}
                                    fullScreen={true}
                                    onClose={closeProductList}
                                >
                                    <ProductList
                                        productCtx={productCtx}
                                        categoryCtx={categoryCtx}
                                        warehouseCtx={warehouseCtx}
                                        intl={intl}
                                        settingsCtx={settingsCtx}
                                        selectedIds={labels}
                                        showFavorite={false}
                                        onClick={(p) => {
                                            this.setState(
                                                () => ({
                                                    labels: [p.Id],
                                                }),
                                                confirmProducts
                                            );

                                        }}
                                        onSelect={(selected) => {
                                            const remove = labels.indexOf(selected.Id) >= 0;
                                            this.setState((prev) => ({
                                                labels: remove ?
                                                    prev.labels.filter(p => p !== selected.Id) :
                                                    [...prev.labels, selected.Id]
                                            }));
                                        }}
                                    />
                                    <Fabs
                                        map={[
                                            labels.length ? {
                                                icon: <Check />,
                                                legend: 'confirm select',
                                                themeColor: 'green',
                                                onClick: confirmProducts
                                            } : undefined
                                        ]}
                                    />
                                </Dialog>
                            </React.Fragment>
                        }
                    </List>
                </Grid>
                {data &&
                    <div className={classes.main}>
                        <div className={classes.mainInner}>
                            <GridContainer style={{ height: '100%', flexWrap: 'nowrap' }}>
                                <List className={classes.chartSideBar}>
                                    <ListItem
                                        button={true}
                                        onClick={() => this.setState(() => ({ metric: 'Amount' }))}
                                        className={
                                            classNames(
                                                classes.menuItem,
                                                metric === 'Amount' && classes.menuItemActive
                                            )
                                        }
                                    >
                                        <ListItemText>
                                            <FormattedMessage {...DashboardMessages.amount} /> <br />
                                            <FormattedNumber
                                                value={data.global.Amount}
                                                style="currency"
                                                currency={data.currency}
                                            />
                                        </ListItemText>
                                    </ListItem>
                                    <ListItem
                                        button={true}
                                        onClick={() => this.setState(() => ({ metric: 'Sales' }))}
                                        className={
                                            classNames(
                                                classes.menuItem,
                                                metric === 'Sales' && classes.menuItemActive
                                            )
                                        }
                                    >
                                        <ListItemText>
                                            <FormattedMessage {...DashboardMessages.sales} /> <br />{data.global.Sales}
                                        </ListItemText>
                                    </ListItem>
                                    <ListItem
                                        button={true}
                                        onClick={() => this.setState(() => ({ metric: 'Units' }))}
                                        className={
                                            classNames(
                                                classes.menuItem,
                                                metric === 'Units' && classes.menuItemActive
                                            )
                                        }
                                    >
                                        <ListItemText>
                                            <FormattedMessage {...DashboardMessages.units} /> <br />{data.global.Units}
                                        </ListItemText>
                                    </ListItem>
                                    <ListItem
                                        button={true}
                                        className={
                                            classNames(
                                                classes.menuItem,
                                                classes.menuItemLast
                                            )
                                        }
                                    >
                                        <ListItemIcon><AccessTime /></ListItemIcon>
                                        <Select
                                            id="timepicker"
                                            fullWidth={true}
                                            value={period}
                                            onChange={(e) => {
                                                var v = e.target.value as periods;
                                                changePeriod(v);
                                            }}
                                            classes={{
                                                select: classes.periodSelect,
                                                icon: classes.periodSelectIcon
                                            }}
                                            disableUnderline={true}
                                        >
                                            {[
                                                'today',
                                                'yesterday',
                                                'thisweek',
                                                'lastweek',
                                                'thismonth',
                                                'lastmonth',
                                                'thisyear',
                                                'lastyear',
                                                'last7days',
                                                'last30days',
                                                'last5years'
                                            ].map(v => <MenuItem key={v} value={v}>
                                                {formatMessage(DashboardMessages[v])}
                                            </MenuItem>)}
                                            <MenuItem key="custom" value="custom">
                                                <FormattedDate value={customPeriodFrom} {...formatedDateOptions} /> 
                                                <FormattedDate value={customPeriodTo} {...formatedDateOptions} />
                                            </MenuItem>
                                        </Select>

                                    </ListItem>
                                    {period === 'custom' &&
                                        <React.Fragment>
                                            <Dialog
                                                open={!!customPeriodOpened}
                                                onClose={() =>
                                                    this.setState(() => ({ customPeriodOpened: undefined }))
                                                }
                                            >
                                                <DialogTitle>
                                                    {formatMessage(DashboardMessages.customTimePeriodTitle)}
                                                </DialogTitle>
                                                <DialogContent>
                                                    <DateTimeField
                                                        label={formatMessage(DashboardMessages.customTimePeriodFrom)}
                                                        fullWidth={true}
                                                        onDateChange={(value: Date) =>
                                                            this.setState(() => ({ customPeriodFrom: value }))
                                                        }
                                                        date={customPeriodFrom}
                                                        type="text"
                                                    />
                                                    <DateTimeField
                                                        label={formatMessage(DashboardMessages.customTimePeriodTo)}
                                                        fullWidth={true}
                                                        onDateChange={(value: Date) =>
                                                            this.setState(() => ({ customPeriodTo: value }))
                                                        }
                                                        date={customPeriodTo}
                                                        type="text"
                                                    />
                                                </DialogContent>
                                                <DialogActions>
                                                    <Button
                                                        onClick={() =>
                                                            this.setState(() => ({ customPeriodOpened: undefined }))
                                                        }
                                                    >
                                                        {formatMessage(DashboardMessages.customTimePeriodSubmit)}
                                                    </Button>
                                                </DialogActions>
                                            </Dialog>
                                        </React.Fragment>
                                    }
                                    <ListItem
                                        button={true}
                                        onClick={() => this.setState((prev) =>
                                            ({ graphType: prev.graphType === 'lines' ? 'pie' : 'lines' }))}
                                        className={
                                            classNames(
                                                classes.menuItem
                                            )
                                        }
                                    >
                                        <ListItemIcon>
                                            {graphType === 'pie' ? <PieChartIcon /> : <ShowChart />}
                                        </ListItemIcon>
                                        <ListItemText>
                                            {graphType === 'pie' ?
                                                <FormattedMessage {...DashboardMessages.pie} /> :
                                                <FormattedMessage {...DashboardMessages.chart} />
                                            }

                                        </ListItemText>
                                    </ListItem>
                                </List>

                                <Grid item={true} style={{ height: '100%', flex: '1 0 auto' }}>
                                    {graphType === 'lines' && (
                                        <AutoSizer>
                                            {({ width, height }) => (

                                                <LineChart width={width} height={height} data={[...values!]}>
                                                    <Line
                                                        type="monotone"
                                                        dataKey={metric}

                                                        className={classes.line}
                                                    />
                                                    <ChartTooltip
                                                        content={(p: TooltipProps) => {
                                                            if (!p.payload || !p.payload.length) { return null; }
                                                            const name = p.payload![0].name;

                                                            // tslint:disable-next-line:no-any
                                                            const payload = p.payload![0] as any;

                                                            const lbl =
                                                                payload &&
                                                                payload.payload &&
                                                                payload.payload.label || name;
                                                            const v = p.payload![0].value as number;
                                                            return (
                                                                <div className={classes.chartTooltip}>
                                                                    <div className={classes.chartTooltipTitle}>
                                                                        {lbl}
                                                                    </div>
                                                                    {metric === 'Amount' ?
                                                                        <FormattedNumber
                                                                            value={v}
                                                                            style="currency"
                                                                            currency={data.currency}
                                                                        /> :
                                                                        v}
                                                                </div>);
                                                        }}
                                                    />
                                                </LineChart>)}
                                        </AutoSizer>)}
                                    {graphType === 'pie' && (
                                        <AutoSizer>
                                            {({ width, height }) => (

                                                <PieChart width={width} height={height}>
                                                    <Pie data={[...values!]} dataKey={metric} className={classes.pie} />

                                                    <ChartTooltip
                                                        content={(p: TooltipProps) => {
                                                            if (!p.payload || !p.payload.length) { return null; }
                                                            const name = p.payload![0].name;
                                                            const lbl = values![name] && values![name].label || name;
                                                            const v = p.payload![0].value as number;
                                                            return (
                                                                <div className={classes.chartTooltip}>
                                                                    <div className={classes.chartTooltipTitle}>
                                                                        {lbl}
                                                                    </div>
                                                                    {metric === 'Amount' ?
                                                                        <FormattedNumber
                                                                            value={v}
                                                                            style="currency"
                                                                            currency={data.currency}
                                                                        /> :
                                                                        v}
                                                                </div>);
                                                        }}
                                                    />
                                                </PieChart>)}
                                        </AutoSizer>)}
                                </Grid>

                            </GridContainer>

                        </div>
                    </div>
                }
            </GridContainer>);
    }
    private _getData(report: StatisticReport, labels: string[], period: periods) {
        const t = this._getTime(period);
        const formatDate = (date: string) => {
            const d = moment.utc(date).local();
            switch (t.interval) {
                case 'Day':
                    return d.format('ddd ll');
                case 'Hour':
                    return d.format('LT');
                case 'Month':
                    return d.format('MMMM');
                case 'Week':
                    return d.format('ddd ll');
                case 'Year':
                    return d.format('YYYY');
                default:
                    return '' as never;
            }
        };

        const totalPeriod = (p: StatisticPeriodReport) => {
            const periodObj = p.Dimension;
            const allKeys = Object.keys(periodObj);
            const keys = labels.length ? labels : allKeys;

            return {
                Amount: keys.length ?
                    keys.map(k => (periodObj[k] && periodObj[k].Amount) || 0).reduce((a, b) => a + b) : 0,
                Sales: keys.length ?
                    keys.map(k => (periodObj[k] && periodObj[k].Sales) || 0).reduce((a, b) => a + b) : 0,
                Units: keys.length ?
                    keys.map(k => (periodObj[k] && periodObj[k].Units) || 0).reduce((a, b) => a + b) : 0,
                Expected: keys.length ?
                    keys.map(k => (periodObj[k] && periodObj[k].Expected) || 0).reduce((a, b) => a + b) : 0,
                label: formatDate(p.StartDate)
            };
        };

        const values = report.Report.map(totalPeriod);

        const data: ProcessedData = {
            currency: report.Currency,
            values,
            global: values.length ? values.reduce((totalPeriod1, totalPeriod2) => {
                return {
                    Amount: totalPeriod1.Amount + totalPeriod2.Amount,
                    Sales: totalPeriod1.Sales + totalPeriod2.Sales,
                    Units: totalPeriod1.Units + totalPeriod2.Units,
                    Expected: totalPeriod1.Expected + totalPeriod2.Expected,
                    label: totalPeriod1.label
                };
            }) : {
                    Amount: 0,
                    Sales: 0,
                    Units: 0,
                    Expected: 0,
                    label: ''
                }
        };

        return data;
    }

    private _fetch() {
        const { period, dimension } = this.state;

        this.setState(() => ({
            fetching: true
        }));

        const p = this._getTime(period);
        const type = dimension === 'Products' ? 'Product' : 'Order';
        Orders
            .GetReport(type, dimension, p.start, p.count, p.interval)
            .then((report) => {
                this.setState((prev) => ({
                    report,
                    data: this._getData(report, prev.labels, prev.period)
                }));
            });
    }
    private _today() {
        const now = moment();
        const today = now.clone().startOf('day');
        const start = today;
        const interval: TimeInterval = 'Hour';
        const count = now.diff(start, 'hours') + 1;
        return { start: start.toDate(), count, interval };
    }
    private _yesterday() {
        const now = moment();
        const today = now.clone().startOf('day');
        const start = today.subtract(1, 'day');
        const end = start.clone().add(1, 'day');
        const interval: TimeInterval = 'Hour';
        const count = end.diff(start, 'hours') + 1;
        return { start: start.toDate(), count, interval };
    }
    private _thisweek() {
        const now = moment();
        const today = now.clone().startOf('day');
        const start = today.startOf('week');
        const interval: TimeInterval = 'Day';
        const count = now.diff(start, 'days') + 1;
        return { start: start.toDate(), count, interval };
    }
    private _lastweek() {
        const now = moment();
        const today = now.clone().startOf('day');
        const start = today.subtract(1, 'week').startOf('week');
        const end = start.clone().add(1, 'week');
        const interval: TimeInterval = 'Day';
        const count = end.diff(start, 'days') + 1;
        return { start: start.toDate(), count, interval };
    }

    private _thisyear() {
        const now = moment();
        const today = now.clone().startOf('day');
        const start = today.clone().dayOfYear(1);
        const interval: TimeInterval = 'Month';
        const count = today.clone().diff(start, 'months') + 1;
        return { start: start.toDate(), count, interval };
    }
    private _lastyear() {
        const now = moment();
        const today = now.clone().startOf('day');
        const start = today.dayOfYear(1).subtract(1, 'years');
        const end = start.clone().add(1, 'year');
        const interval: TimeInterval = 'Month';
        const count = end.diff(start, 'months');
        return { start: start.toDate(), count, interval };
    }
    private _lastmonth() {
        const now = moment();
        const today = now.clone().startOf('day');
        const start = today.date(1).subtract(1, 'month');
        const end = start.clone().add(1, 'month');
        const interval: TimeInterval = 'Day';
        const count = end.diff(start, 'days') + 1;
        return { start: start.toDate(), count, interval };
    }

    private _thismonth() {
        const now = moment();
        const today = now.clone().startOf('day');
        const start = today.clone().date(1);
        const interval: TimeInterval = 'Day';
        const count = today.clone().diff(start, 'days') + 1;
        return { start: start.toDate(), count, interval };
    }

    private _custom() {
        const { customPeriodFrom, customPeriodTo } = this.state;
        const start = moment.utc(customPeriodFrom);
        const end = moment.utc(customPeriodTo);
        const duration = moment.duration(end.diff(start.clone()));
        let interval: TimeInterval = 'Day';
        if (duration.asYears() > 2) {
            interval = 'Year';
        } else if (duration.asMonths() > 6) {
            interval = 'Month';
        } else if (duration.asWeeks() > 2) {
            interval = 'Week';
        } else if (duration.asDays() > 2) {
            interval = 'Day';
        } else {
            interval = 'Hour';
        }
        const count = end.diff(start, interval.toLowerCase() as moment.unitOfTime.Diff) + 1;
        return { start: customPeriodFrom, count, interval };
    }

    private _last7days() {
        const now = moment();
        const today = now.clone().startOf('day');
        const start = today.subtract(6, 'day');
        const interval: TimeInterval = 'Day';
        const count = 7;
        return { start: start.toDate(), count, interval };
    }

    private _last30days() {
        const now = moment();
        const today = now.clone().startOf('day');
        const start = today.subtract(29, 'day');
        const interval: TimeInterval = 'Day';
        const count = 30;
        return { start: start.toDate(), count, interval };
    }

    private _last5years() {
        const now = moment();
        const today = now.clone().startOf('year');
        const start = today.subtract(4, 'year');
        const interval: TimeInterval = 'Year';
        const count = 5;
        return { start: start.toDate(), count, interval };
    }
    private _getTime(period: periods): { start: Date; count: number; interval: TimeInterval } {
        switch (period) {
            case 'today':
                return this._today();
            case 'yesterday':
                return this._yesterday();
            case 'thisweek':
                return this._thisweek();
            case 'lastweek':
                return this._lastweek();
            case 'thisyear':
                return this._thisyear();
            case 'lastyear':
                return this._lastyear();
            case 'lastmonth':
                return this._lastmonth();
            case 'thismonth':
                return this._thismonth();
            case 'custom':
                return this._custom();
            case 'last7days':
                return this._last7days();
            case 'last30days':
                return this._last30days();
            case 'last5years':
                return this._last5years();
            default:
                return void 0 as never;
        }
    }
}

const drawerWidth = '16rem';
const drawerSidesPadding = '11px';
export default withStyles((theme: OurTheme): StyleRules<injectedClasses> => {

    return {
        containerCls: {
            height: `calc(100% + ${theme.spacing.unit}px)`,
            position: 'relative',
            // flexWrap: 'nowrap'
        },
        menu: {
            height: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column'
        },
        menuItem: {
            paddingLeft: theme.spacing.unit,
            paddingRight: theme.spacing.unit,
            borderLeftWidth: theme.ActiveMenuBorderWidth,
            borderLeftColor: 'transparent',
            borderLeftStyle: 'solid',
            opacity: 0.5,
            flex: '0 0 auto',
            transition: theme.transitions.create('opacity', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.short,
            }),
        },
        menuItemLast: {
            marginTop: 'auto'
        },
        menuItemActive: {
            borderLeftColor: theme.palette.primary.main,
            opacity: 1
        },
        main: {
            height: '100%',
            position: 'relative',
            flex: '1 1 auto',
            background: theme.Colors.gray.primary.light
        },
        menuContainer: {
            borderRight: `1px solid ${theme.palette.divider}`,
            height: '100%',
            position: 'relative',
            flex: '0 0 auto',
            overflow: 'auto'
        },
        mainInner: {
            padding: '40px',
            height: '100%',
            boxSizing: 'border-box'
        },
        tooltip: {
            background: theme.palette.common.white,
            color: theme.palette.text.primary,
            boxShadow: theme.shadows[1],
            fontSize: 11
        },
        submenu: {
            flexShrink: 0,
            whiteSpace: 'nowrap',
            height: '100%',
            position: 'relative',
            boxSizing: 'border-box',
            borderRight: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden'
        },
        submenuContent: {
            paddingRight: drawerSidesPadding,
            paddingLeft: drawerSidesPadding,
            width: drawerWidth,
            position: 'absolute',
            height: '100%',
            left: 0,
            right: 0,
            overflow: 'auto',
            boxSizing: 'border-box'
        },
        submenuOpen: {
            width: drawerWidth,
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
            }),
        },
        submenuClose: {
            transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            }),
            overflowX: 'hidden',
            width: 0,
            marginLeft: -1
        },
        listItemIconWrapper: {
            display: 'inline-flex',

            '&:hover $listItemIcon:first-child': {
                display: 'none'
            },
            '&:hover $listItemIcon:last-child': {
                display: 'inline-flex'
            }
        },
        listItemIcon: {
            color: 'rgba(0, 0, 0, 0.54)',
            display: 'inline-flex',
            flexShrink: 0,
            marginRight: 16,
            position: 'relative'
        },
        listItemIconChecked: {},
        listItemIconPerson: {
        },
        listItemIconCheckbox: {
            display: 'none'
        },
        listItemText: {
            whiteSpace: 'normal'
        },
        periodSelectIcon: {
            display: 'none'
        },
        periodSelect: {
            paddingTop: 5,
            paddingBottom: 4,
            '&:focus': {
                background: 'transparent'
            }
        },
        line: {
            '& .recharts-line-curve':
            {
                stroke: theme.palette.primary.main
            }
        },
        pie: {
            '& .recharts-sector': {
                fill: theme.palette.primary.main
            }
        },
        chartTooltip: {
            background: theme.palette.common.white,
            color: theme.palette.text.primary,
            boxShadow: theme.shadows[1],
            padding: `${theme.spacing.unit}px `,
            border: 'none',
            borderRadius: 4
        },
        chartTooltipTitle: {
            color: theme.palette.primary.main,
            marginBottom: 4,
            fontWeight: 'bold'
        },
        chartSideBar: {
            height: '100%',
            flex: '0 0 auto',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto'
        }
    };
})(Dashboard);