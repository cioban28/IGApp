import React from 'react';
import classnames from 'classnames';
import memoize from 'memoize-one';
import moment from 'moment';
import ReactCountryFlag from 'react-country-flag';
import {uniq, get, isEmpty, mapValues} from 'lodash';
import {inject, observer} from 'mobx-react';

import {
  EXTERNAL_LEAD_SOURCE,
  EXTERNAL_LEAD_SOURCE_DATA1,
  EXTERNAL_LEAD_SOURCE_DATA2,
  GROUP_BY,
  LABELS
} from 'components/utils/users';
import {formatNumber, formatNumberWithDecimalPoint} from 'components/utils/budget';
import {compose} from 'components/utils/utils';
import countryCode from 'data/countryCode';

import ChannelList from 'components/common/ChannelList';
import CompanyLogo from 'components/pages/users/CompanyLogo';
import Component from 'components/Component';
import CustomCheckbox from 'components/controls/CustomCheckbox';
import Toggle from 'components/controls/Toggle';
import FiltersPanel from 'components/pages/users/Filters/FiltersPanel';
import Popup, {TextContent} from 'components/pages/plan/Popup';
import StatSquare from 'components/common/StatSquare';
import Table, {DEFAULT_PAGE_SIZE} from 'components/controls/Table';
import Tooltip from 'components/controls/Tooltip';
import SearchInput from 'components/controls/SearchInput';
import UsersPopup from 'components/pages/users/UsersPopup';

import analyzeStyle from 'styles/analyze/analyze.css';
import style from 'styles/users/users.css';

const HUBSPOT_LINK_PREFIX = 'https://app.hubspot.com/contacts/';

const COLUMNS = [
  {
    label: 'Channels',
    value: 'Channels'
  },
  {
    label: 'Stage',
    value: 'Stage'
  },
  {
    label: '# of sessions',
    value: 'Sessions'
  },
  {
    label: 'Country',
    value: 'Country'
  },
  {
    label: 'First Touch',
    value: 'FirstTouch'
  },
  {
    label: 'Last Touch',
    value: 'LastTouch'
  },
  {
    label: 'Device',
    value: 'Device'
  },
  {
    label: 'Product',
    value: 'Product'
  },
  {
    label: 'Region',
    value: 'Region'
  },
  {
    label: EXTERNAL_LEAD_SOURCE,
    value: 'ExternalLeadSource'
  },
  {
    label: EXTERNAL_LEAD_SOURCE_DATA1,
    value: 'ExternalLeadSourceData1'
  },
  {
    label: EXTERNAL_LEAD_SOURCE_DATA2,
    value: 'ExternalLeadSourceData2'
  }
];

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
          }) => ({
    data,
    timeFrame,
    users,
    statsLabel,
    filters,
    setFilters,
    filterConfigs,
    searchQuery,
    setSearchQuery,
    groupBy,
    setGroupBy
  })),
  observer
);


class Users extends Component {
  style = style;
  styles = [analyzeStyle];

  constructor(props) {
    super(props);
    const customNicknames = this.getCustomNicknames().map((s, index) => `uniqCustom${index + 1}`);
    const initialColumns = COLUMNS.map(({value}) => value).concat(customNicknames);

    this.state = {
      showPopup: false,
      channelsContainerWidth: 224,
      activeColumns: initialColumns,
      selectedColumns: initialColumns,
      pageSize: DEFAULT_PAGE_SIZE
    };
  }

  componentDidMount() {
    if (this.channelContainer && this.channelContainer.clientWidth) {
      this.setState({channelsContainerWidth: this.channelContainer.clientWidth});
    }
  }

  showPopup = user => {
    this.setState({
      showPopup: true,
      selectedUser: user
    });
  };

  getCustomNicknames = () => get(this.props, 'data.CRMConfig.customFieldsNicknames', []);

  getCRMLinks = () => {
    const {data: {salesforceapi, hubspotapi}} = this.props;
    const {selectedUser} = this.state;

    if (!isEmpty(selectedUser)) {
      let link = '';
      const {emailToLinkProps} = selectedUser;
      return mapValues(emailToLinkProps, item => {
        const {platform, externalId, email} = item;
        if (platform === 'salesforce') {
          link = `${salesforceapi.tokens.instance_url}/${externalId}`;
        }
        else if (platform === 'hubspot') {
          if (email) {
            link = `${HUBSPOT_LINK_PREFIX}${hubspotapi.portalId}/contact/${externalId}`;
          }
          // company
          else {
            link = `${HUBSPOT_LINK_PREFIX}${hubspotapi.portalId}/company/${externalId}`;
          }
        }
        return link;
      });
    }
  };

  getDateRange = memoize((startDate, endDate, monthsExceptThisMonth) => {
    const start = startDate
      ? new Date(startDate)
      : moment().subtract(monthsExceptThisMonth, 'months').startOf('month').toDate();
    const end = endDate ? new Date(endDate) : moment().endOf('month').toDate();

    return {start, end};
  });

  getEngagedDataLength = data => {
    const {
      timeFrame: {
        startDate, endDate, monthsExceptThisMonth
      }
    } = this.props;
    const dateRange = this.getDateRange(startDate, endDate, monthsExceptThisMonth);

    const engagedData = data.filter(item => {
      // engaged user/account contain at least 1 session
      // within the selected date range
      const sessionWithinRange = item.sessions.find(session => {
        const timestamp = session.startTime || session.timestamp;
        return timestamp ? moment(timestamp).isBetween(dateRange.start, dateRange.end) : false;
      });
      if (sessionWithinRange) {
        return true;
      }
      else {
        return false;
      }
    });
    return engagedData.length;
  };

  getTotalInteractions = (data) => {
    return data.reduce((result, {sessions}) => {
      return result + sessions.length;
    }, 0);
  };

  getTotalChannels = data => {
    return data.reduce((result, {sessions}) => {
      return result + uniq(sessions.map(session => session.channel)).length;
    }, 0);
  };

  averageFormatter = (func, data) => data.length ? formatNumberWithDecimalPoint(func(data) / data.length) : 0;

  getColumnsOptions = () => {
    const {selectedColumns} = this.state;

    const customNicknames = this.getCustomNicknames().map((customNickname, index) => ({
      label: customNickname,
      value: `uniqCustom${index + 1}`
    }));

    return COLUMNS.concat(customNicknames).map(column => (
      <CustomCheckbox
        key={column.value}
        checked={selectedColumns.includes(column.value)}
        onChange={() => this.changeColumns(column.value)}
        className={this.classes.checkboxContainer}
        checkboxClassName={this.classes.checkbox}
        checkMarkClassName={this.classes.checkboxMark}
        childrenClassName={this.classes.checkboxLabel}
      >
        {column.label}
      </CustomCheckbox>
    ));
  };

  saveSettings = () => {
    this.setState(prevState => ({
      activeColumns: prevState.selectedColumns
    }));
  };

  cancelSettings = () => {
    this.setState(prevState => ({
      selectedColumns: prevState.activeColumns
    }));
  };

  openPopup = () => {
    this.popup.open();
  };

  closePopup = (saveSettings) => {
    if (saveSettings) {
      this.saveSettings();
    }
    this.popup.close();
  };

  changeColumns = (column) => {
    const selectedColumns = this.state.selectedColumns.slice();
    const index = selectedColumns.findIndex(item => item === column);
    if (index !== -1) {
      selectedColumns.splice(index, 1);
    }
    else {
      const order = COLUMNS.reduce((result, column, index) => {
        result[column.value] = index;
        return result;
      }, {});
      selectedColumns.push(column);
      selectedColumns.sort((a, b) => order[a] - order[b]);
    }
    this.setState({selectedColumns});
  };

  getTableColumns = () => {
    const {activeColumns, channelsContainerWidth} = this.state;

    const columns = [
      {
        id: 'User',
        header: 'User',
        cell: ({emails, displayName, domainIcon}) => (
          <React.Fragment>
            <CompanyLogo src={domainIcon} className={classnames(this.classes.icon, this.classes.logo)}/>
            <div className={this.classes.account}>
              {displayName}
              <div className={this.classes.email}>
                {emails.length <= 1 ? emails && emails[0] : 'multiple users'}
              </div>
            </div>
          </React.Fragment>
        ),
        fixed: 'left',
        minWidth: 200
      },
      {
        id: 'Channels',
        header: 'Channels',
        cell: ({uniqChannels}) => (
          <div
            className={this.classes.channelContainer}
            ref={el => this.channelContainer = el}
          >
            <ChannelList
              channels={uniqChannels}
              width={channelsContainerWidth}
            />
          </div>
        ),
        minWidth: 224,
        minResizeWidth: 192
      },
      {
        id: 'Stage',
        header: 'Stage',
        cell: 'stageNickname',
        minWidth: 80
      },
      {
        id: 'Sessions',
        header: '# of sessions',
        cell: 'sessions.length'
      },
      {
        id: 'Country',
        header: 'Country',
        cell: ({countries}) => countries && countries.length > 0 && countries.map((item) => (
          <Tooltip
            id={`country-${item}`}
            key={item}
            tip={countryCode[item] || item}
            data-tip-disable={countries.length === 1}
          >
            <div className={this.classes.country}>
              <ReactCountryFlag code={item} svg styleProps={{
                width: '24px',
                height: '18px',
                flexShrink: 0,
                marginRight: 8
              }}/>
              {countries.length === 1 && <div>{countryCode[item] || item}</div>}
            </div>
          </Tooltip>
        )),
        minWidth: 160
      },
      {
        id: 'FirstTouch',
        header: 'First touch',
        cell: ({timeSinceFirst}) => <div className={this.classes.light}>{timeSinceFirst}</div>,
        sortable: true,
        sortMethod: (a, b) => a.firstTouchPoint - b.firstTouchPoint
      },
      {
        id: 'LastTouch',
        header: 'Last touch',
        cell: ({timeSinceLast}) => <div className={this.classes.light}>{timeSinceLast}</div>,
        sortable: true,
        sortMethod: (a, b) => a.lastTouchPoint - b.lastTouchPoint
      },
      {
        id: 'Device',
        header: 'Device',
        cell: ({devices}) => devices && devices.length > 0 && devices.map((item) => (
          <Tooltip key={item} tip={item} id={`device-${item}`} data-tip-disable={devices.length === 1}>
            <div className={this.classes.device}>
              <div className={this.classes.icon} data-icon={'device:' + item}/>
              {devices.length === 1 && item}
            </div>
          </Tooltip>
        )),
        minWidth: 150
      },
      {
        id: 'Product',
        header: 'Product',
        cell: ({product}) => <div className={this.classes.light}>{product}</div>
      },
      {
        id: 'Region',
        header: 'Region',
        cell: ({region}) => <div className={this.classes.light}>{region}</div>
      },
      {
        id: 'ExternalLeadSource',
        header: EXTERNAL_LEAD_SOURCE,
        cell: ({externalLeadSource}) => <div className={this.classes.light}>{externalLeadSource}</div>,
        minWidth: 200
      },
      {
        id: 'ExternalLeadSourceData1',
        header: EXTERNAL_LEAD_SOURCE_DATA1,
        cell: ({externalLeadSourceData1}) => <div className={this.classes.light}>{externalLeadSourceData1}</div>,
        minWidth: 250
      },
      {
        id: 'ExternalLeadSourceData2',
        header: EXTERNAL_LEAD_SOURCE_DATA2,
        cell: ({externalLeadSourceData2}) => <div className={this.classes.light}>{externalLeadSourceData2}</div>,
        minWidth: 250
      }
    ];
    const customNicknames = this.getCustomNicknames();
    if (customNicknames.length) {
      customNicknames.forEach((customNickname, index) => {
        columns.push({
          id: `uniqCustom${index + 1}`,
          header: customNickname,
          cell: (item) => isEmpty(item[`uniqCustom${index + 1}`])
            ? 'null'
            : item[`uniqCustom${index + 1}`].join(', ')
        });
      });
    }

    return columns.filter(column => activeColumns.includes(column.id) || column.id === 'User');
  };

  handleShowMoreClick = (showMoreStep, data) => {
    this.setState(prevState => {
      const isLastPage = (data.length - prevState.pageSize) < showMoreStep;
      return {
        pageSize: isLastPage ? data.length : (prevState.pageSize + showMoreStep)
      };
    });

  };

  render() {
    const {
      data,
      timeFrame,
      users,
      statsLabel,
      filters,
      setFilters,
      filterConfigs,
      searchQuery,
      setSearchQuery,
      groupBy,
      setGroupBy
    } = this.props;

    if (!Object.keys(data).length) {
      return null;
    }

    const {startDate, endDate, monthsExceptThisMonth} = timeFrame;
    const {pageSize} = this.state;
    const dateRange = this.getDateRange(startDate, endDate, monthsExceptThisMonth);
    const total = formatNumber(users.length);
    const engaged = formatNumber(this.getEngagedDataLength(users));
    const averageInteractions = this.averageFormatter(this.getTotalInteractions, users);
    const averageChannels = this.averageFormatter(this.getTotalChannels, users);

    return <div>
      <div className={this.classes.filtersPanel}>
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
        <button
          type='button'
          className={this.classes.manageColumnsButton}
          onClick={this.openPopup}
        >
          Columns
        </button>
        <Popup
          ref={el => this.popup = el}
          title='Manage columns and metrics'
          className={this.classes.popup}
          onClose={() => this.cancelSettings}
          primaryButton={{
            text: 'Save',
            onClick: () => this.closePopup(true)
          }}
          secondaryButton={{
            text: 'Cancel',
            onClick: () => this.closePopup(false)
          }}
        >
          <TextContent>
            <div className={this.classes.popupContentContainer}>
              <div className={this.classes.popupContentColumn}>
                <div className={this.classes.popupContentColumnTitle}>
                  Columns
                </div>
                {this.getColumnsOptions()}
              </div>
            </div>
          </TextContent>
        </Popup>
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
      <div className={this.classes.stats}>
        <StatSquare
          title={`Total ${statsLabel.plural}`}
          stat={total}
          className={this.classes.statSquare}
          containerClassName={this.classes.statSquareContainer}
        />
        <StatSquare
          title={`Engaged ${statsLabel.plural}`}
          stat={engaged}
          className={this.classes.statSquare}
          containerClassName={this.classes.statSquareContainer}
        />
        <StatSquare
          title={`Average number of interactions per ${statsLabel.singular}`}
          stat={averageInteractions}
          className={this.classes.statSquare}
          containerClassName={this.classes.statSquareContainer}
        />
        <StatSquare
          title={`Average number of channels per ${statsLabel.singular}`}
          stat={averageChannels}
          className={this.classes.statSquare}
          containerClassName={this.classes.statSquareContainer}
        />
      </div>
      <div className={this.classes.inner}>
        <Table
          minRows={0}
          data={users}
          onRowClick={this.showPopup}
          defaultSorted={[{id: 'LastTouch', desc: true}]}
          className={this.classes.usersTable}
          tableClassName={this.classes.table}
          headerClassName={this.classes.header}
          headRowClassName={this.classes.headRow}
          rowClassName={this.classes.row}
          cellClassName={this.classes.cell}
          columns={this.getTableColumns()}
          showPagination
          handleShowMoreClick={this.handleShowMoreClick}
          pageSize={pageSize}
          onResizedChange={(newResized) => {
            const resizedChannel = newResized.find(item => item.id === 'Channels');
            if (resizedChannel) {
              // set new channels column width - padding size
              this.setState({channelsContainerWidth: resizedChannel.value - 48});
            }
          }}
        />
      </div>
      {
        this.state.showPopup &&
        <UsersPopup
          user={this.state.selectedUser}
          startOfPeriod={dateRange.start}
          customNicknames={this.getCustomNicknames()}
          crmLinks={this.getCRMLinks()}
          close={() => {
            this.setState({showPopup: false, selectedUser: {}});
          }}
        />
      }
    </div>;
  }
}

export default enhance(Users);
