import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import ReactCountryFlag from 'react-country-flag';
import { get, mapValues, merge } from 'lodash';

import countryCode from 'data/countryCode';
import {
    EXTERNAL_LEAD_SOURCE,
    EXTERNAL_LEAD_SOURCE_DATA1,
    EXTERNAL_LEAD_SOURCE_DATA2,
    HUBSPOT_LINK_PREFIX,
} from 'components/utils/users';

import ChannelList from 'components/common/ChannelList';
import CompanyLogo from 'components/pages/users/CompanyLogo';
import Table, { DEFAULT_PAGE_SIZE } from 'components/controls/Table';
import Tooltip from 'components/controls/Tooltip';
import UsersPopup from 'components/pages/users/UsersPopup';

import styles from 'styles/users/users.css';

const classes = styles.locals;

class AudienceTable extends React.Component {
    state = {
        selectedUser: null,
        channelsContainerWidth: 224,
        pageSize: DEFAULT_PAGE_SIZE,
    };

    componentDidMount() {
        if (this.channelContainer && this.channelContainer.clientWidth) {
            this.setState({
                channelsContainerWidth: this.channelContainer.clientWidth,
            });
        }
    }

    handleShowMoreClick = (showMoreStep, data) => {
        this.setState(prevState => {
            const isLastPage = data.length - prevState.pageSize < showMoreStep;
            return {
                pageSize: isLastPage
                    ? data.length
                    : prevState.pageSize + showMoreStep,
            };
        });
    };

    getTableColumns = () => {
        const { channelsContainerWidth } = this.state;
        const { columns, permissions } = this.props;

        let customColumns = columns.filter(({ value }) =>
            value.includes('uniqCustom'),
        );

        let regularColumns = [
            {
                id: 'User',
                header: 'User',
                cell: ({ emails, displayName, domainIcon }) => (
                    <React.Fragment>
                        <CompanyLogo
                            src={domainIcon}
                            className={classNames(classes.icon, classes.logo)}
                        />
                        <div className={classes.account}>
                            {displayName}
                            <div className={classes.email}>
                                {emails.length <= 1
                                    ? emails && emails[0]
                                    : 'multiple users'}
                            </div>
                        </div>
                    </React.Fragment>
                ),
                fixed: 'left',
                minWidth: 200,
            },
            {
                id: 'Channels',
                header: 'Channels',
                cell: ({ uniqChannels }) => (
                    <div
                        className={classes.channelContainer}
                        ref={el => (this.channelContainer = el)}
                    >
                        <ChannelList
                            channels={uniqChannels}
                            width={channelsContainerWidth}
                        />
                    </div>
                ),
                minWidth: 224,
                minResizeWidth: 192,
            },
            {
                id: 'Stage',
                header: 'Stage',
                cell: 'stageNickname',
                minWidth: 80,
            },
            {
                id: 'Sessions',
                header: '# of sessions',
                cell: 'sessions.length',
            },
            {
                id: 'Country',
                header: 'Country',
                cell: ({ countries }) =>
                    countries.map(item => (
                        <Tooltip
                            id={`country-${item}`}
                            key={item}
                            tip={countryCode[item] || item}
                            data-tip-disable={countries.length === 1}
                        >
                            <div className={classes.country}>
                                <ReactCountryFlag
                                    code={item}
                                    svg
                                    styleProps={{
                                        width: '24px',
                                        height: '18px',
                                        flexShrink: 0,
                                        marginRight: 8,
                                    }}
                                />
                                {countries.length === 1 && (
                                    <div>{countryCode[item] || item}</div>
                                )}
                            </div>
                        </Tooltip>
                    )),
                minWidth: 160,
            },
            {
                id: 'FirstTouch',
                header: 'First touch',
                cell: ({ timeSinceFirst }) => (
                    <div className={classes.light}>{timeSinceFirst}</div>
                ),
                sortable: true,
                sortMethod: (a, b) => a.firstTouchPoint - b.firstTouchPoint,
            },
            {
                id: 'LastTouch',
                header: 'Last touch',
                cell: ({ timeSinceLast }) => (
                    <div className={classes.light}>{timeSinceLast}</div>
                ),
                sortable: true,
                sortMethod: (a, b) => a.lastTouchPoint - b.lastTouchPoint,
            },
            {
                id: 'Device',
                header: 'Device',
                cell: ({ devices }) =>
                    devices.map(item => (
                        <Tooltip
                            key={item}
                            tip={item}
                            id={`device-${item}`}
                            data-tip-disable={devices.length === 1}
                        >
                            <div className={classes.device}>
                                <div
                                    className={classes.icon}
                                    data-icon={'device:' + item}
                                />
                                {devices.length === 1 && item}
                            </div>
                        </Tooltip>
                    )),
                minWidth: 150,
            },
            {
                id: 'Product',
                header: 'Product',
                cell: ({ product }) => (
                    <div className={classes.light}>{product}</div>
                ),
            },
            {
                id: 'Region',
                header: 'Region',
                cell: ({ region }) => (
                    <div className={classes.light}>{region}</div>
                ),
            },
        ];

        if (permissions.CRMLeadSource) {
            const crmLeadSourceColumns = [
                {
                    id: 'ExternalLeadSource',
                    header: EXTERNAL_LEAD_SOURCE,
                    cell: ({ externalLeadSource }) => (
                        <div className={classes.light}>
                            {externalLeadSource}
                        </div>
                    ),
                    minWidth: 200,
                },
                {
                    id: 'ExternalLeadSourceData1',
                    header: EXTERNAL_LEAD_SOURCE_DATA1,
                    cell: ({ externalLeadSourceData1 }) => (
                        <div className={classes.light}>
                            {externalLeadSourceData1}
                        </div>
                    ),
                    minWidth: 250,
                },
                {
                    id: 'ExternalLeadSourceData2',
                    header: EXTERNAL_LEAD_SOURCE_DATA2,
                    cell: ({ externalLeadSourceData2 }) => (
                        <div className={classes.light}>
                            {externalLeadSourceData2}
                        </div>
                    ),
                    minWidth: 250,
                },
            ];

            regularColumns = regularColumns.concat(crmLeadSourceColumns);
        }

        customColumns = customColumns.map(({ label, value }) => ({
            header: label,
            id: value,
            cell: item =>
                get(item, value, []).join(', '),
        }));

        regularColumns = regularColumns.concat(customColumns);

        return regularColumns.map((column, idx) => {
            if (get(columns, `${idx - 1}.hide`)) {
                column.show = false;
            }

            return column;
        });
    };

    showPopup = user => {
        this.setState({
            selectedUser: user,
        });
    };

    closePopup = () => {
        this.setState({
            selectedUser: null,
        });
    };

    onResizedChange = newResized => {
        const resizedChannel = newResized.find(item => item.id === 'Channels');

        if (resizedChannel) {
            // set new channels column width - padding size
            this.setState({
                channelsContainerWidth: resizedChannel.value - 48,
            });
        }
    };

    getCRMLinks = () => {
        const { salesforceapi, hubspotapi } = this.props;
        const { selectedUser } = this.state;
        const { sessions } = selectedUser;
        const instanceUrl = get(salesforceapi, 'tokens.instance_url');
        const portalId = get(hubspotapi, 'portalId');

        const emailToLinkProps = merge(
            {},
            ...sessions.map(({ email, external_id, is_opp, crm_platform }) => ({
                [email]: {
                    externalId: external_id,
                    email,
                    isOpp: is_opp,
                    platform: crm_platform,
                },
            })),
        );

        return mapValues(emailToLinkProps, item => {
            const { platform, externalId, email } = item;
            let link = '';

            if (platform === 'salesforce') {
                link = `${instanceUrl}/${externalId}`;
            } else if (platform === 'hubspot') {
                if (email) {
                    link = `${HUBSPOT_LINK_PREFIX}${portalId}/contact/${externalId}`;
                }
                // company
                else {
                    link = `${HUBSPOT_LINK_PREFIX}${portalId}/company/${externalId}`;
                }
            }
            return link;
        });
    };

    render() {
        const { customFieldsNicknames, data, dateRange } = this.props;
        const { selectedUser, pageSize } = this.state;

        return (
            <React.Fragment>
                <div className={classes.inner}>
                    <Table
                        cellClassName={classes.cell}
                        className={classes.usersTable}
                        columns={this.getTableColumns()}
                        data={data}
                        defaultSorted={[{ id: 'LastTouch', desc: true }]}
                        handleShowMoreClick={this.handleShowMoreClick}
                        headerClassName={classes.header}
                        headRowClassName={classes.headRow}
                        minRows={0}
                        onResizedChange={this.onResizedChange}
                        onRowClick={this.showPopup}
                        pageSize={pageSize}
                        rowClassName={classes.row}
                        showPagination
                        tableClassName={classes.table}
                    />
                </div>
                {selectedUser && (
                    <UsersPopup
                        user={selectedUser}
                        startOfPeriod={dateRange.start}
                        customNicknames={customFieldsNicknames}
                        crmLinks={this.getCRMLinks()}
                        close={this.closePopup}
                    />
                )}
            </React.Fragment>
        );
    }
}

AudienceTable.defaultProps = {
    dateRange: {},
};

AudienceTable.propTypes = {
    customFieldsNicknames: PropTypes.arrayOf(PropTypes.string),
    data: PropTypes.arrayOf(PropTypes.shape({})),
    dateRange: PropTypes.shape({}),
    hubspotapi: PropTypes.shape({
        portalId: PropTypes.string,
    }),
    permissions: PropTypes.shape({
        CRMLeadSource: PropTypes.bool,
    }),
    salesforceapi: PropTypes.shape({
        tokens: PropTypes.shape({
            instance_url: PropTypes.string,
        }),
    }),
};

export default AudienceTable;
