import React from 'react';
import moment from 'moment';
import {get} from 'lodash';
import {inject, observer} from 'mobx-react';
import PropTypes from 'prop-types';

import {
    averageFormatter,
    COLUMNS,
    CRM_LEAD_SOURCE_COLUMNS,
    getDateRange,
    GROUP_BY,
    LABELS,
} from 'components/utils/users';
import {formatNumber} from 'components/utils/budget';
import {compose} from 'components/utils/utils';

import FiltersPanel from 'components/pages/users/Filters/FiltersPanel';
import SearchInput from 'components/controls/SearchInput';
import Toggle from 'components/controls/Toggle';
import AudienceTable from 'components/pages/journeys/AudienceTable';
import ColumnsPopup from 'components/pages/journeys/ColumnsPopup';
import StatsSquares from 'components/pages/journeys/StatsSquares';

import analyzeStyle from 'styles/analyze/analyze.css';
import styles from 'styles/users/users.css';

const classes = styles.locals;

const enhance = compose(
    inject(({
                attributionStore: {
                    data,
                    timeFrame
                },
                analyze: {
                    journeysStore: {
                        users,
                        statsLabel,
                        groupBy,
                        setGroupBy,
                        filtersData: {
                            filters,
                            setFilters,
                            filterConfigs,
                            searchQuery,
                            setSearchQuery
                        }
                    }
                }
            }) => {
        const { hubspotapi, salesforceapi } = data;
        const customFieldsNicknames = get(
            data,
            'CRMConfig.customFieldsNicknames',
            [],
        );
        const permissions = get(
            data,
            'userAccount.permissions',
            [],
        );

        return {
            customFieldsNicknames,
            filterConfigs,
            filters,
            groupBy,
            hubspotapi,
            salesforceapi,
            searchQuery,
            permissions,
            setFilters,
            setGroupBy,
            setSearchQuery,
            statsLabel,
            timeFrame,
            users,
        };
    }),
    observer
);

class Journeys extends React.Component {
    constructor(props) {
        super(props);

        const customColumns = this.getCustomColumnsFromCRM();
        const crmColumns = get(props, 'permissions.CRMLeadSource')
            ? CRM_LEAD_SOURCE_COLUMNS
            : [];
        const defaultColumns = COLUMNS.concat(crmColumns).concat(customColumns);

        this.state = {
            columns: defaultColumns,
        };
    }

    componentDidMount() {
        styles.use();
    }

    componentWillUnmount() {
        styles.unuse();
    }

    getCustomColumnsFromCRM = () => {
        const { customFieldsNicknames } = this.props;

        return customFieldsNicknames.map((nickname, index) => ({
            label: nickname,
            value: `uniqCustom${index + 1}`,
        }));
    };

    saveColumnsSettings = columns => {
        this.setState({
            columns,
        });
    };

    getDateRange = () => {
        const {
            timeFrame: { startDate, endDate, monthsExceptThisMonth },
        } = this.props;
        return getDateRange(startDate, endDate, monthsExceptThisMonth);
    };

    getStatsData(data) {
        const dateRange = this.getDateRange();
        const total = data.length;
        const defaultStats = {
            engaged: 0,
            totalChannels: 0,
            totalInteractions: 0,
        };

        const calcStats = data.reduce((accByUser, { sessions }) => {
            const userSessions = sessions.reduce(
                (accBySessions, session) => {
                    // Get Engaged Data Length
                    const timestamp = session.startTime || session.timestamp;

                    const isBetween = moment(timestamp).isBetween(
                        dateRange.start,
                        dateRange.end,
                    );

                    if (isBetween) {
                        accBySessions.engaged = true;
                    }

                    // Get channels
                    if (!accBySessions.channels.includes(session.channel)) {
                        accBySessions.channels.push(session.channel);
                    }

                    return accBySessions;
                },
                {
                    engaged: false,
                    channels: [],
                },
            );

            accByUser.engaged += Number(userSessions.engaged);
            accByUser.totalChannels += userSessions.channels.length;
            accByUser.totalInteractions += sessions.length;

            return accByUser;
        }, defaultStats);

        return {
            total,
            ...calcStats,
        };
    }

    getStatsItems(data) {
        const { statsLabel } = this.props;
        const {
            total,
            engaged,
            totalChannels,
            totalInteractions,
        } = this.getStatsData(data);

        return [
            {
                title: `Total ${statsLabel.plural}`,
                stat: formatNumber(total),
            },
            {
                title: `Engaged ${statsLabel.plural}`,
                stat: formatNumber(engaged),
            },
            {
                title: `Average number of interactions per ${
                    statsLabel.singular
                    }`,
                stat: averageFormatter(totalInteractions, total),
            },
            {
                title: `Average number of channels per ${statsLabel.singular}`,
                stat: averageFormatter(totalChannels, total),
            },
        ];
    }

    render() {
        const {
            customFieldsNicknames,
            filterConfigs,
            filters,
            groupBy,
            hubspotapi,
            permissions,
            salesforceapi,
            searchQuery,
            setFilters,
            setGroupBy,
            setSearchQuery,
            users,
        } = this.props;
        const {columns} = this.state;

        const dateRange = this.getDateRange();
        const statsItems = this.getStatsItems(users);

        return (
            <React.Fragment>
                <div className={classes.filtersPanel}>
                    <div className={analyzeStyle.locals.toggle}>
                        <Toggle
                            options={[
                                {
                                    text: LABELS.USERS,
                                    value: GROUP_BY.USERS
                                },
                                {
                                    text: LABELS.ACCOUNTS,
                                    value: GROUP_BY.ACCOUNT
                                }
                            ]}
                            selectedValue={groupBy}
                            onClick={setGroupBy}
                        />
                    </div>
                    <SearchInput
                        defaultValue={searchQuery}
                        onSearch={setSearchQuery}
                    />
                    <FiltersPanel
                        filters={filters}
                        onFiltersChange={setFilters}
                        filterConfigs={filterConfigs}
                    />
                </div>
                <StatsSquares items={statsItems} />
                <div style={{position: 'relative'}}>
                    <AudienceTable
                        data={users}
                        dataRange={dateRange}
                        columns={columns}
                        getCRMLinks={this.getCRMLinks}
                        customFieldsNicknames={customFieldsNicknames}
                        
                        hubspotapi={hubspotapi}
                        salesforceapi={salesforceapi}
                        permissions={permissions}
                    />
                    <ColumnsPopup
                        onSave={this.saveColumnsSettings}
                        columns={columns}
                    />
                </div>
            </React.Fragment>
        );
    }
}

Journeys.propTypes = {
    customFieldsNicknames: PropTypes.arrayOf(PropTypes.string),
    filterConfigs: PropTypes.arrayOf(PropTypes.shape({})),
    filters: PropTypes.arrayOf(PropTypes.shape({})),
    groupBy: PropTypes.number,
    hubspotapi: PropTypes.shape({
        portalId: PropTypes.string,
    }),
    salesforceapi: PropTypes.shape({
        tokens: PropTypes.shape({
            instance_url: PropTypes.string,
        }),
    }),
    searchQuery: PropTypes.string,
    setFilters: PropTypes.func,
    setGroupBy: PropTypes.func,
    setSearchQuery: PropTypes.func,
    statsLabel: PropTypes.shape({
        plural: PropTypes.string,
        singular: PropTypes.string,
    }),
    timeFrame: PropTypes.shape({
        startDate: PropTypes.string,
        endDate: PropTypes.string,
        monthsExceptThisMonth: PropTypes.number,
    }),
    users: PropTypes.arrayOf(
        PropTypes.shape({
            sessions: PropTypes.arrayOf(PropTypes.shape({})),
        }),
    ),
};

export default enhance(Journeys);
