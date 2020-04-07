import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import ReactTable, {ReactTableDefaults} from 'react-table';
import withFixedColumns from 'react-table-hoc-fixed-columns';
import {cloneDeep, groupBy, sumBy, orderBy} from 'lodash';
import Component from 'components/Component';
import EllipsisTooltip from 'components/controls/EllipsisTooltip';
import Tooltip from 'components/controls/Tooltip';
import CustomCheckbox from 'components/controls/CustomCheckbox';
import {INDICATORS, COLUMNS} from 'components/pages/PlannedVsActual';
import Popup, {TextContent} from 'components/pages/plan/Popup';
import EditableBudgetCell from 'components/pages/plan/EditableBudgetCell';
import NumberWithArrow from 'components/NumberWithArrow';
import {
  getChannelIcon,
  getNickname as getChannelNickname,
} from 'components/utils/channels';
import {
  getIndicatorsWithProps,
  getNickname as getIndicatorNickname
} from 'components/utils/indicators';
import {
  formatBudget,
  formatNumber
} from 'components/utils/budget';
import style from 'styles/plan/planned-vs-actual-table.css';
import reactTableStyle from 'react-table/react-table.css';

const ReactTableFixedColumns = withFixedColumns(ReactTable);

class PlannedVsActualTable extends Component {

  style = style;
  styles = [reactTableStyle];

  static propTypes = {
    channels: PropTypes.arrayOf(PropTypes.object).isRequired,
    isCurrentMonth: PropTypes.bool.isRequired,
    extrapolateValue: PropTypes.func.isRequired,
    updateActual: PropTypes.func.isRequired,
    updateImpact: PropTypes.func.isRequired,
    funnelFirstObjective: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      expandedCategories: this.getUniqueCategories(props.channels),
      activeIndicators: ['spending', props.funnelFirstObjective],
      activeColumns: Object.values(COLUMNS).map(({value}) => value),
      selectedIndicators: ['spending', props.funnelFirstObjective],
      selectedColumns: Object.values(COLUMNS).map(({value}) => value),
      spendingSort: 'desc'
    }
  }

  componentDidUpdate(prevProps) {
    const {channels} = this.props;
    if (prevProps.channels !== channels) {
      this.setState({expandedCategories: this.getUniqueCategories(channels)});
    }
  }

  getUniqueCategories = (channels) => {
    return Object.keys(groupBy(channels, channel => channel.category));
  }

  toggleTableSort = () => {
    const {spendingSort} = this.state;
    if (spendingSort === 'desc') {
      this.setState({spendingSort: 'asc'});
    }
    else {
      this.setState({spendingSort: 'desc'});
    }
  }

  saveSettings = () => {
    this.setState(prevState => ({
      activeIndicators: prevState.selectedIndicators,
      activeColumns: prevState.selectedColumns
    }));
  }

  cancelSettings = () => {
    this.setState(prevState => ({
      selectedIndicators: prevState.activeIndicators,
      selectedColumns: prevState.activeColumns
    }));
  }

  openPopup = () => {
    this.popup.open();
  }

  closePopup = (saveSettings) => {
    if (saveSettings) {
      this.saveSettings();
    }
    this.popup.close();
  }

  getIndicatorsOptions = () => {
    const {selectedIndicators} = this.state;
    const indicatorsProperties = getIndicatorsWithProps();

    return INDICATORS.map(indicator => (
      <CustomCheckbox
        key={indicator}
        checked={selectedIndicators.includes(indicator)}
        onChange={() => this.changeIndicators(indicator)}
        className={this.classes.checkboxContainer}
        checkboxClassName={this.classes.checkbox}
        checkMarkClassName={this.classes.checkboxMark}
        childrenClassName={this.classes.checkboxLabel}
      >
        {indicator === 'spending'
          ? 'spending'
          : indicatorsProperties[indicator].nickname}
      </CustomCheckbox>
    ));
  }

  changeIndicators = (indicator) => {
    const selectedIndicators = this.state.selectedIndicators.slice();

    const index = selectedIndicators.findIndex(item => item === indicator);
    if (index !== -1) {
      selectedIndicators.splice(index, 1);
    } else {
      selectedIndicators.push(indicator);
    }
    this.setState({selectedIndicators});
  }

  getColumnsOptions = () => {
    const {selectedColumns} = this.state;

    return Object.values(COLUMNS).map(column => (
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
  }

  changeColumns = (column) => {
    const selectedColumns = this.state.selectedColumns.slice();
    const index = selectedColumns.findIndex(item => item === column);
    if (index !== -1) {
      selectedColumns.splice(index, 1);
    } else {
      const order = {
        [COLUMNS.planned.value]: 0,
        [COLUMNS.actual.value]: 1,
        [COLUMNS.planVsActual.value]: 2,
        [COLUMNS.pacingFor.value]: 3
      }
      selectedColumns.push(column);
      selectedColumns.sort((a, b) => order[a] - order[b]);
    }
    this.setState({selectedColumns});
  }

  toggleAllCategory = () => {
    const {channels} = this.props;
    const {expandedCategories} = this.state;

    if (expandedCategories.length) {
      this.setState({expandedCategories: []});
    } else {
      this.setState({expandedCategories: Object.keys(groupBy(channels, channel => channel.category))});
    }
  }

  toggleCategory = (category) => {
    let expandedCategories = this.state.expandedCategories.slice();

    const index = expandedCategories.findIndex(item => item === category);
    if (index >= 0) {
      expandedCategories.splice(index, 1);
    } else {
      expandedCategories.push(category);
    }
    this.setState({expandedCategories});
  }

  conditionalRound = (number, digitsAfterDecimalPoint = 2) => {
    // only process float numbers which does not equal to zero
    if (number === 0 || parseInt(number) === number) {
      return number;
    }
    else {
      return parseFloat(number.toFixed(digitsAfterDecimalPoint));
    }
  }

  getData = () => {
    const {channels} = this.props;
    const {expandedCategories, spendingSort} = this.state;

    // since react-table v6 can't support our current design
    // https://app.zeplin.io/project/5b4d91b9c480e0571c8ed562/screen/5c6ee71be2369d40672c2c06
    // https://github.com/tannerlinsley/react-table/issues/905
    // we're using conditional rows as solution for custom pivot column groups

    // insert pivot rows (channel category) into table data
    let data = channels.reduce((result, channel) => {
      const index = result.findIndex(item => item.category === channel.category);
      if (index >= 0) {
        INDICATORS.forEach(indicator => {
          result[index][indicator].planned += channel[indicator].planned;
          result[index][indicator].actual += channel[indicator].actual;
        });
      } else {
        result.push({
          ...cloneDeep(channel),
          channel: channel.category,
          isPivotRow: true
        });
      }
      return result;
    }, []);
    data = orderBy(data, ['spending.planned', 'category'], [spendingSort, 'asc']);

    // insert channel rows for expanded categories into table data
    const groupedChannels = groupBy(channels, channel => channel.category);
    expandedCategories.forEach(category => {
      const index = data.findIndex(item => item.category === category);
      let categoryChannels = groupedChannels[category];
      categoryChannels = orderBy(categoryChannels, ['spending.planned', 'category'], [spendingSort, 'asc']);
      data.splice(index + 1, 0, ...categoryChannels);
    });

    return data;
  }

  getColumns = (data) => {
    const {
      isCurrentMonth,
      extrapolateValue,
      updateActual,
      updateImpact
    } = this.props;
    const {
      expandedCategories,
      activeIndicators,
      activeColumns,
      spendingSort
    } = this.state;

    const pivotRows = data.filter(row => row.isPivotRow);

    const trend = (value, lastMonthValue=0) => {
      const delta = value - lastMonthValue;
      return (
        <div className={this.classes.trend}>
          {formatNumber(this.conditionalRound(value))}
          {
            lastMonthValue && value !== lastMonthValue ? (
              <div
                className={classnames(
                  this.classes.delta,
                  delta >= 0 ? this.classes.positive : this.classes.negative
                )}
              >
                {delta > 0 && '+'}
                {formatNumber(this.conditionalRound(delta))}
              </div>
            ) : null
          }
        </div>
      );
    };

    return [{
      Header: '',
      columns: [
        {
          id: 'channel',
          accessor: item => item,
          className: this.classes.fixed,
          Header: (
            <Fragment>
              <button
                type='button'
                onClick={this.toggleAllCategory}
                className={classnames(
                  this.classes.collapseAllButton,
                  expandedCategories.length && this.classes.collapsed
                )}
              />
              channel
            </Fragment>
          ),
          Footer: 'total',
          Cell: ({value}) => (
            <Fragment>
              {value.isPivotRow &&
              <button
                type='button'
                onClick={() => this.toggleCategory(value.category)}
                className={classnames(
                  this.classes.collapseButton,
                  expandedCategories.find(
                    category => category === value.category
                  ) && this.classes.collapsed
                )}
              />
              }
              {
                value.isPivotRow
                  ? value.category
                  : (
                    <div className={this.classes.withIcon}>
                      <div className={this.classes.channelIcon} data-icon={getChannelIcon(value.channel)}/>
                      <div className={this.classes.channelName}>
                        <EllipsisTooltip
                          text={getChannelNickname(value.channel)}
                          place='top'
                        />
                      </div>
                      {value.isAutomatic &&
                      <div className={this.classes.channelAuto}>Auto</div>
                      }
                    </div>
                  )
              }
            </Fragment>
          ),
          minWidth: 290
        }
      ],
      fixed: 'left'
    }].concat(activeIndicators.map(indicator => {
      if (indicator === 'spending') {
        return {
          Header: (
            <div className={this.classes.group}>
              <span className={this.classes.arrow}/>
              spending
            </div>
          ),
          columns: activeColumns.map((column, index) => {
            let columnProps;
            switch(column) {
              case COLUMNS.planned.value:
                columnProps = {
                  id: 'spendingPlanned',
                  accessor: item => item[indicator].planned,
                  Header: (
                    <button
                      type='button'
                      onClick={this.toggleTableSort}
                      className={classnames(this.classes.sortButton, spendingSort === 'asc' && this.classes.ascending)}
                    >
                      planned budget
                    </button>
                  ),
                  Footer: formatBudget(sumBy(pivotRows, item => item[indicator].planned)),
                  Cell: ({value}) => formatBudget(value)
                };
                break;
              case COLUMNS.actual.value:
                columnProps = {
                  id: 'spendingActual',
                  accessor: item => item,
                  Header: 'actual cost',
                  Footer: formatBudget(sumBy(pivotRows, item => item[indicator].actual)),
                  Cell: ({value}) => (value.isPivotRow
                      ? formatBudget(value[indicator].actual)
                      : (
                        <EditableBudgetCell
                          value={value[indicator].actual}
                          formatter={formatBudget}
                          save={budget => updateActual(value.channel, budget)}
                          disabled={value.isAutomatic}
                        />
                      )
                  )
                };
                break;
              case COLUMNS.planVsActual.value:
                columnProps = {
                  id: 'spendingPlanVsActual',
                  accessor: item => item,
                  Header: 'plan vs actual',
                  Footer: formatBudget(
                    sumBy(pivotRows, item => item[indicator].actual - item[indicator].planned),
                    true
                  ),
                  Cell: ({value}) => formatBudget(value[indicator].actual - value[indicator].planned, true)
                };
                break;
              case COLUMNS.pacingFor.value:
                columnProps = {
                  id: 'spendingPacingFor',
                  accessor: item => item,
                  Header: 'pacing for',
                  Footer: () => {
                    if(!isCurrentMonth) {
                      return '-'
                    };
                    const sumPlanned = sumBy(pivotRows, item => item[indicator].planned || 0);
                    const sumPacing = sumBy(pivotRows, value => isCurrentMonth ? value[indicator].isActualEmpty ? value[indicator].actual : extrapolateValue(value[indicator].actual) : 0);
                    const diff = sumPacing !== 0 ? sumPacing - sumPlanned : 0;

                    return diff === 0 ? formatBudget(sumPacing) : (
                      <div style={{display: 'flex'}}>
                        {formatBudget(sumPacing)}
                        <div style={{marginLeft: 10}}>
                          <NumberWithArrow
                            stat={formatNumber(diff, true) > 0 ? `+${formatNumber(diff, true)}` : formatNumber(diff, true)}
                            isNegative={diff > 0}
                            arrowStyle={{display: 'none'}}
                            statStyle={{alignSelf: 'center', fontWeight: '500', paddingTop: 1}}
                          />
                        </div>
                      </div>
                    )
                  },
                  Cell: ({value}) => {
                    if(!isCurrentMonth) {
                      return '-'
                    };
                    const pacing = value[indicator].isActualEmpty ? value[indicator].actual : extrapolateValue(value[indicator].actual);
                    const diff = pacing !== 0 ? pacing - value[indicator].planned : 0;

                    return diff === 0 ? formatBudget(pacing) : (
                      <div style={{display: 'flex'}}>
                        {formatBudget(pacing)}
                        <div style={{marginLeft: 10}}>
                          <NumberWithArrow
                            stat={formatNumber(diff, true) > 0 ? `+${formatNumber(diff, true)}` : formatNumber(diff, true)}
                            isNegative={diff > 0}
                            arrowStyle={{display: 'none'}}
                            statStyle={{alignSelf: 'center', fontWeight: '500', paddingTop: 1}}
                          />
                        </div>
                      </div>
                    );
                  },
                };
                break;
              default:
                columnProps = null;
                break;
            }
            if (columnProps && index === 0) {
              columnProps.className = this.classes.separator;
              columnProps.headerClassName = this.classes.separator;
            }
            return columnProps;
          })
        };
      }
      else {
        return {
          Header: (
            <div className={this.classes.group}>
              <span className={this.classes.arrow}/>
              {getIndicatorNickname(indicator)}
            </div>
          ),
          columns: activeColumns.map((column, index) => {
            let columnProps;
            switch(column) {
              case COLUMNS.planned.value:
                columnProps = {
                  id: `${indicator}Planned`,
                  accessor: item => item,
                  Header: (
                    <Tooltip
                      tip={'what\'s your expectation?'}
                      id={`planned-${indicator}-tooltip`}
                    >
                      {`planned ${getIndicatorNickname(indicator)}`}
                    </Tooltip>
                  ),
                  Footer: formatNumber(this.conditionalRound(sumBy(pivotRows, item => item[indicator].planned))),
                  Cell: ({value}) => (value.isPivotRow
                      ? formatNumber(value[indicator].planned)
                      : (
                        <EditableBudgetCell
                          value={value[indicator].planned}
                          formatter={formatNumber}
                          save={budget => updateImpact(value.channel, indicator, 'planned', budget)}
                        />
                      )
                  )
                };
                break;
              case COLUMNS.actual.value:
                columnProps = {
                  id: `${indicator}Actual`,
                  accessor: item => item,
                  Header: `actual ${getIndicatorNickname(indicator)}`,
                  Footer: formatNumber(this.conditionalRound(sumBy(pivotRows, item => item[indicator].actual))),
                  Cell: ({value}) => formatNumber(value[indicator].actual)
                };
                break;
              case COLUMNS.planVsActual.value:
                columnProps = {
                  id: `${indicator}PlanVsActual`,
                  accessor: item => item,
                  Header: 'plan vs actual',
                  Footer: formatNumber(this.conditionalRound(sumBy(pivotRows, item => item[indicator].actual - item[indicator].planned))),
                  Cell: ({value}) => formatNumber(value[indicator].actual - value[indicator].planned, true)
                };
                break;
              case COLUMNS.pacingFor.value:
                columnProps = {
                  id: `${indicator}PacingFor`,
                  accessor: item => item,
                  Header: 'pacing for',
                  Footer: () => {
                    if(!isCurrentMonth) {
                      return '-'
                    };
                    const pacing = sumBy(pivotRows, item => extrapolateValue(item[indicator].actual) || 0);
                    const planned = sumBy(pivotRows, item => extrapolateValue(item[indicator].planned) || 0);

                    const diff = pacing !== 0 ? pacing - planned : 0;

                    return diff === 0 ? extrapolateValue(pacing) : (
                      <div style={{display: 'flex'}}>
                        {formatBudget(pacing)}
                        <div style={{marginLeft: 10}}>
                          <NumberWithArrow
                            stat={formatNumber(diff, true) > 0 ? `+${formatNumber(diff, true)}` : formatNumber(diff, true)}
                            isNegative={diff > 0}
                            arrowStyle={{display: 'none'}}
                            statStyle={{alignSelf: 'center', fontWeight: '500', paddingTop: 1}}
                          />
                        </div>
                      </div>
                    );
                  },
                  Cell: ({value}) => {
                    if(!isCurrentMonth) {
                      return '-'
                    };
                    const pacing = value[indicator].isActualEmpty ? value[indicator].actual : extrapolateValue(value[indicator].actual || 0);
                    const diff = pacing !== 0 ? pacing - value[indicator].planned : 0;

                    return diff === 0 ? extrapolateValue(pacing) : (
                      <div style={{display: 'flex'}}>
                        {formatBudget(pacing)}
                        <div style={{marginLeft: 10}}>
                          <NumberWithArrow
                            stat={formatNumber(diff, true) > 0 ? `+${formatNumber(diff, true)}` : formatNumber(diff, true)}
                            isNegative={diff > 0}
                            arrowStyle={{display: 'none'}}
                            statStyle={{alignSelf: 'center', fontWeight: '500', paddingTop: 1}}
                          />
                        </div>
                      </div>
                    );
                  }
                };
                break;
              default:
                columnProps = null;
                break;
            }
            if (columnProps && index === 0) {
              columnProps.className = this.classes.separator;
              columnProps.headerClassName = this.classes.separator;
            }
            return columnProps;
          })
        }
      }
    }));
  }

  getDecorators = () => {
    return {
      getTheadGroupProps: () => ({
        className: this.classes.theadGroup
      }),
      getTheadGroupThProps: () => ({
        className: classnames(this.classes.theadGroupTh, this.classes.separator)
      }),
      getTheadProps: () => ({
        className: this.classes.thead
      }),
      getTheadThProps: () => ({
        className: this.classes.theadTh
      }),
      getTbodyProps: () => ({
        className: this.classes.tbody
      }),
      getTrGroupProps: (state, rowInfo) => ({
        className: classnames(
          this.classes.trGroup,
          rowInfo.original.isPivotRow && this.classes.pivotRow
        )
      }),
      getTdProps: (state, rowInfo) => ({
        className: classnames(
          this.classes.td,
          rowInfo.original.isPivotRow && this.classes.pivotRow
        )
      }),
      getTfootProps: () => ({
        className: this.classes.tfoot
      }),
      getTfootTdProps: () => ({
        className: this.classes.tfootTd
      })
    }
  }

  render() {
    const data = this.getData();
    const columns = this.getColumns(data);

    return (
      <div className={this.classes.container}>
        <button
          type='button'
          className={this.classes.manageColumnsButton}
          onClick={() => this.openPopup()}
        >
          Manage columns
        </button>
        <ReactTableFixedColumns
          data={data}
          columns={columns}
          column={{
            ...ReactTableDefaults.column,
            minWidth: 160
          }}
          className={this.classes.table}
          pageSize={data.length}
          sortable={false}
          showPagination={false}
          showFooterTop={true}
          {...this.getDecorators()}
        />
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
                  Buckets
                </div>
                {this.getIndicatorsOptions()}
              </div>
              <div className={this.classes.popupContentColumn}>
                <div className={this.classes.popupContentColumnTitle}>
                  Columns
                </div>
                {this.getColumnsOptions()}
              </div>
            </div>
          </TextContent>
        </Popup>
      </div>
    );
  }
}

export default PlannedVsActualTable;