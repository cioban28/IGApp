import React from 'react';
import PropTypes from 'prop-types';
import withFixedColumns from 'react-table-hoc-fixed-columns';
import ReactTable from 'react-table';
import {
    getChannelsWithProps,
    getChannelIcon,
} from 'components/utils/channels';
import union from 'lodash/union';
import orderBy from 'lodash/orderBy';
import sumBy from 'lodash/sumBy';
import classNames from 'classnames';
import Button from 'components/controls/Button';
import DeleteChannelPopup from 'components/pages/plan/DeleteChannelPopup';
import Popup from 'components/Popup';
import TableCell from 'components/pages/plan/TableCell-2';
import { classes } from 'components/pages/plan/BudgetTable';
import { formatBudget } from 'components/utils/budget';

const ReactTableFixedColumns = withFixedColumns(ReactTable);

const COLLAPSE = {
    ALL: "ALL",
    CATEGORY: "CATEGORY",
    NONE: "NONE"
};

class Table extends React.PureComponent {
    static EXPANDED_LIMIT = 25;

    state = {
        expanded: {},
        deletePopup: '',
        collapseStatus: COLLAPSE.NONE,
        pageSize: undefined
    };

    static getDerivedStateFromProps(nextProps, prevState) {
        const { collapseStatus, expanded } = prevState;
        const tableLength = nextProps.data.length;

        if (
            tableLength !== 0 &&
            collapseStatus !== COLLAPSE.CATEGORY &&
            Object.keys(expanded).length === 0
        ) {
            return Table.setDefaultExpandedState(Table.EXPANDED_LIMIT);
        }

        return null;
    }

    static setDefaultExpandedState(length) {
        const expanded = {};

        for (let i = 0; i < length; i++) {
            expanded[i] = {};
        }

        return {
            expanded,
        };
    }

    closeDeletePopup = () => {
        this.setState({
            deletePopup: '',
        });
    };

    collapseTable = () => {
        const { collapseStatus } = this.state;
        switch (collapseStatus) {
            case COLLAPSE.NONE:
                this.setState({
                    collapseStatus: COLLAPSE.ALL,
                    pageSize: 0
                });
                break;
            case COLLAPSE.ALL:
                this.setState({
                    collapseStatus: COLLAPSE.CATEGORY,
                    pageSize: undefined,
                    expanded: {}
                });
                break;
            case COLLAPSE.CATEGORY:
                this.setState({
                    collapseStatus: COLLAPSE.NONE,
                    pageSize: undefined
                });
            default:
                break;
        }
    };

    getTableData = () => {
        const { data } = this.props;
        const channelsProps = getChannelsWithProps();
        const channels = union(
            ...data.map(month => Object.keys(month.channels)),
        );

        const notSorted = channels.map(channel => {
            const row = data.reduce((rowData, month = {}, index) => {
                const { channels, isQuarter, isAnnual, realIndex } = month;
                rowData[index] = {
                    primaryBudget: 0,
                    secondaryBudget: 0,
                    isConstraint: false,
                };
                rowData[index].isQuarter = isQuarter;
                rowData[index].isAnnual = isAnnual;
                rowData[index].updateIndex = realIndex;
                rowData[index].channel = channel;

                if (channels[channel]) {
                    rowData[index] = {
                        ...rowData[index],
                        ...channels[channel],
                        isConstraint: channels[channel].isConstraint
                            ? channels[channel].isConstraint
                            : false,
                        primaryBudget: channels[channel].primaryBudget
                            ? channels[channel].primaryBudget
                            : 0,
                    };
                }

                return rowData;
            }, {});

            row.nickname = channelsProps[channel].nickname;
            row.category = channelsProps[channel].category;
            row.channel = channel;

            return row;
        });

        return orderBy(notSorted, [
            row => row.category.toLowerCase(),
            'nickname',
        ]);
    };

    getTableColumns() {
        const {
            dates,
            numberOfPastDates,
            editCommittedBudget,
            changeBudgetConstraint,
            isEditMode,
            isConstraintsEnabled,
            deleteChannel,
        } = this.props;
        const { deletePopup } = this.state;

        const columnsData = dates.map(
            ({ value, isAnnual, isQuarter, ...restData }, index) => {
                const isHistory = index < numberOfPastDates;
                const isCurrentMonth = index === numberOfPastDates;

                return {
                    Header: value,
                    accessor: String(index),
                    aggregate: values => {
                        return {
                            isQuarter: values.some(value => value.isQuarter),
                            sum: sumBy(values, 'primaryBudget'),
                        };
                    },
                    Aggregated: row => formatBudget(row.value.sum),
                    Cell: ({ value = {} }) => {
                        const {
                            channel,
                            isConstraint,
                            isSoft,
                            primaryBudget,
                            secondaryBudget,
                            updateIndex,
                            region,
                        } = value;

                        if (isAnnual || isQuarter || isHistory) {
                            return formatBudget(primaryBudget);
                        }

                        return (
                            <TableCell
                                format={formatBudget}
                                value={primaryBudget}
                                secondaryValue={secondaryBudget}
                                isConstraint={isConstraint}
                                isConstraintsEnabled={isConstraintsEnabled}
                                isSoft={isSoft}
                                constraintChange={changeBudgetConstraint}
                                onEdit={editCommittedBudget}
                                isEditMode={isEditMode}
                                updateIndex={updateIndex}
                                channel={channel}
                                region={region}
                            />
                        );
                    },
                    width: 140,
                    Footer: row =>
                        formatBudget(
                            sumBy(row.data, v => v[row.column.id].sum),
                        ),
                    getProps: (_, row = {}) => {
                        const { aggregated } = row;

                        return {
                            className: classNames({
                                [classes.cellCategory]: aggregated,
                                [classes.cellAnnual]: isAnnual,
                                [classes.cellQuarter]: isQuarter,
                                [classes.cellHistory]: isHistory,
                                [classes.cellNotEditable]:
                                    isAnnual || isQuarter || isHistory,
                            }),
                        };
                    },
                    getHeaderProps: () => ({
                        className: classNames(
                            {
                                [classes.cellAnnual]: isAnnual,
                                [classes.cellQuarter]: isQuarter,
                                [classes.cellHistory]: isHistory,
                                [classes.cellActive]: isCurrentMonth,
                            },
                            classes.cellHeader,
                        ),
                    }),
                    isAnnual,
                    ...restData,
                };
            },
        );

        columnsData.unshift({
            Header: () => {
                const { collapseStatus } = this.state;
                const isCollapsed = collapseStatus === COLLAPSE.ALL || collapseStatus === COLLAPSE.CATEGORY;

                return (
                    <React.Fragment>
                        <button
                            className={classNames(
                                classes.buttonUp,
                                classes.buttonUpAction,
                            )}
                            onClick={this.collapseTable}
                        >
                            <i
                                className={classNames(
                                    classes.icon,
                                    classes.iconUp,
                                    {
                                        [classes.iconDown]: !isCollapsed,
                                    },
                                )}
                                data-icon="plan:monthNavigationWhite"
                            />
                        </button>
                        Marketing Channel
                    </React.Fragment>
                );
            },
            fixed: 'left',
            width: 335,
            accessor: 'category',
            Cell: cellData => {
                const { original } = cellData;

                if (original) {
                    cellData.pivoted = false;

                    return (
                        <div
                            className={classes.channel}
                            data-channel={original.channel}
                        >
                            <i
                                className={classNames(
                                    classes.icon,
                                    classes.iconLarge,
                                )}
                                data-icon={getChannelIcon(original.channel)}
                            />
                            <div>{cellData.original.nickname}</div>
                            {isEditMode && (
                                <React.Fragment>
                                    <button
                                        onClick={() =>
                                            this.setState({
                                                deletePopup: original.channel,
                                            })
                                        }
                                        className={classes.buttonIcon}
                                    >
                                        <i
                                            className={classes.icon}
                                            data-icon={'plan:removeChannel'}
                                        />
                                    </button>
                                    <Popup
                                        hidden={
                                            original.channel !== deletePopup
                                        }
                                        style={{
                                            top: '0',
                                            left: '130px',
                                            cursor: 'initial',
                                        }}
                                    >
                                        <DeleteChannelPopup
                                            onNext={() => {
                                                deleteChannel(original.channel);
                                                this.closeDeletePopup();
                                            }}
                                            onBack={this.closeDeletePopup}
                                        />
                                    </Popup>
                                </React.Fragment>
                            )}
                        </div>
                    );
                } else {
                    return cellData.value;
                }
            },
            Pivot: ({ isExpanded, value, row }) => (
                <div className={classes.cellCategory}>
                    <button className={classes.buttonUp}>
                        <i
                            className={classNames(
                                classes.icon,
                                classes.iconUp,
                                {
                                    [classes.iconDown]: isExpanded,
                                },
                            )}
                            data-icon="plan:monthNavigation"
                        />
                    </button>
                    <div className={classes.channel}>{value}</div>
                    {isEditMode && (
                        <Button
                            icon="plan:addChannel"
                            type="primary"
                            onClick={this.openAddChannelPopup(row.category)}
                            className={classes.buttonAdd}
                        >
                            Add
                        </Button>
                    )}
                </div>
            ),
            Footer: 'Total',
            getProps: (_, row = {}) => {
                const { groupedByPivot, original = {} } = row;
                const { channel } = original;

                return {
                    className: classNames(classes.cellDefault, {
                        [classes.cellCategoryWrapper]: groupedByPivot,
                        [classes.cellCategoryEditable]: isEditMode,
                    }),
                    style: {
                        zIndex: channel === deletePopup && 2,
                    },
                };
            },
            getHeaderProps: () => ({
                className: classNames(
                    classes.cellDefault,
                    classes.cellHeader,
                    classes.cellTitleOffset,
                ),
            }),
            getFooterProps: () => ({
                className: classes.cellTitleOffset,
            }),
        });

        return columnsData;
    }

    getTrProps = (_, rowInfo = {}) => {
        return {
            className: classNames({
                [classes.rowCategory]: rowInfo.aggregated,
            }),
        };
    };

    getTdProps = (_, rowInfo = {}, column = {}) => {
        return {
            className: classNames({
                [classes.cellAnnualCategory]:
                    rowInfo.aggregated && column.isAnnual,
            }),
        };
    };

    handleExpand = expanded => this.setState({ expanded });

    openAddChannelPopup = channel => event => {
        event.stopPropagation();

        const { openAddChannelPopup } = this.props;

        return openAddChannelPopup(channel);
    };

    render() {
        const { expanded, pageSize, collapseStatus } = this.state;
        const data = this.getTableData();
        const currentPageSize = typeof pageSize !== "undefined"
            ? pageSize
            : new Set(data.map(row => row.category)).size;

        return (
            <ReactTableFixedColumns
                className={
                    classNames(
                        classes.table,
                        collapseStatus === COLLAPSE.ALL && classes.collapseAll
                    )
                }
                columns={this.getTableColumns()}
                data={this.getTableData()}
                pageSize={currentPageSize}
                expanded={expanded}
                getTdProps={this.getTdProps}
                getTrProps={this.getTrProps}
                onExpandedChange={this.handleExpand}
                pivotBy={['category']}
                resizable={false}
                showPageSizeOptions={false}
                showPagination={false}
                sortable={false}
                showFooterTop={collapseStatus === COLLAPSE.ALL ? false : true}
            />
        );
    }
}

Table.defaultProps = {
    editCommittedBudget: () => {},
    deleteChannel: () => {},
    changeBudgetConstraint: () => {},
};

Table.propTypes = {
    cellWidth: PropTypes.number,
    changeBudgetConstraint: PropTypes.func,
    data: PropTypes.array,
    deleteChannel: PropTypes.func,
    editCommittedBudget: PropTypes.func,
    isConstraintsEnabled: PropTypes.bool,
    isEditMode: PropTypes.bool,
    isShowSecondaryEnabled: PropTypes.bool,
    scrollPosition: PropTypes.number,
};

export default Table;
