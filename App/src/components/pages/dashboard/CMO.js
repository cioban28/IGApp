import React, {Fragment} from 'react';
import classnames from 'classnames';
import moment from 'moment';
import Component from 'components/Component';
import style from 'styles/dashboard/dashboard.css';
import {ResponsiveContainer, PieChart, Pie, Cell} from 'recharts';
import Objective from 'components/pages/dashboard/Objective';
import {
  getIndicatorsWithProps,
  getNickname as getIndicatorNickname
} from 'components/utils/indicators';
import {getChannelsWithProps, getMetadata as getChannelMetadata} from 'components/utils/channels';
import {formatNumber, formatBudgetShortened, formatNumberWithDecimalPoint} from 'components/utils/budget';
import CampaignsByFocus from 'components/pages/dashboard/CampaignsByFocus';
import merge from 'lodash/merge';
import {getDates, getDatesSpecific} from 'components/utils/date';
import PerformanceGraph from 'components/pages/analyze/PerformanceGraph';
import TopX from 'components/pages/dashboard/TopX';
import StatSquare from 'components/common/StatSquare';
import MonthsPopup from 'components/pages/dashboard/MonthsPopup';
import {getExtarpolateRatio} from 'components/utils/utils';
import Tooltip from 'components/controls/Tooltip';
import {getColor} from 'components/utils/colors';
import {projectObjective} from 'components/utils/objective';
import {mapValues, get, isEmpty, sum, sumBy, meanBy, map} from 'lodash';
import PlanPopup, {TextContent as PopupTextContent} from 'components/pages/plan/Popup';
import Select from 'components/controls/Select';
import {monthNames} from 'components/utils/date';
import {newIndicatorMapping} from 'components/utils/indicators';

const timeFrameType = {
  month: 'This Month',
  quarter: 'This Quarter',
  year: 'This Year'
};

export default class CMO extends Component {

  style = style;

  static defaultProps = {
    actualIndicators: {
      MCL: 0,
      MQL: 0,
      SQL: 0,
      opps: 0,
      users: 0
    },
    unfilteredCampaigns: {},
    objectives: [],
    annualBudgetArray: []
  };

  constructor() {
    super();

    this.state = {
      activeIndex: void 0,
      months: 1,
      performanceTimeFrame: timeFrameType.month,
      isPast: false,
      showAdvanced: false
    };
  };

  getMonthlyDataByQuarter = (monthlyData) => {
    const {
      calculatedData: {
        historyData: {rawMonths}
      }
    } = this.props;

    // adds month name to each monthly data for filtering
    const months = [...rawMonths, new Date()];
    const monthlyDataWithDate = monthlyData.map((data, index) => ({
      ...data,
      name: moment(months[index]).format('MMM YY')
    }));

    // filter months based on quarter
    const currentMonth = (new Date()).getMonth() + 1;
    const monthNamesWithYear = monthNames.map(month => month + ' ' + (new Date()).getFullYear().toString().substr(2, 2));
    const currentQuarter = Math.ceil(currentMonth / 3);
    const currentQuarterStart = (currentQuarter - 1) * 3;
    const currentQuarterMonthsNames = monthNamesWithYear.slice(currentQuarterStart, currentQuarterStart + 3);
    const currentQuarterMonths = monthlyDataWithDate.reduce((result, {name, ...data}) => {
      if (currentQuarterMonthsNames.includes(name)) {
        result.push(data);
      }
      return result;
    }, []);

    return currentQuarterMonths;
  };

  getMonthlyDataByYear = (monthlyData) => {
    const {
      calculatedData: {
        historyData: {rawMonths}
      }
    } = this.props;

    // adds month name to each monthly data for filtering
    const months = [...rawMonths, new Date()];
    const monthlyDataWithDate = monthlyData.map((data, index) => ({
      ...data,
      name: moment(months[index]).format('YYYY')
    }));

    // filter months based on year
    const currentYear = (new Date()).getFullYear().toString();
    const currentYearMonths = monthlyDataWithDate.reduce((result, {name, ...data}) => {
      if (name === currentYear) {
        result.push(data);
      }
      return result;
    }, []);

    return currentYearMonths;
  };

  onPieEnter = (data, index) => {
    this.setState({
      activeIndex: index
    });
  };

  handleMonthsChange = (months) => {
    this.setState({months});
  };

  handleTimeFrameChange = ({value}) => {
    this.setState({performanceTimeFrame: value});
    this.timeFramePopup.close();
  };

  togglePerformanceGraph = (type) => {
    const {isPast, showAdvanced} = this.state;

    const showPast = type === 'past';
    if (!showAdvanced) {
      // performance graph is closed and needs to be shown
      this.setState({showAdvanced: true, isPast: showPast});
    }
    else if (isPast !== showPast) {
      // performance graph is opened (e.g 'past')
      // and user wants to see performance graph for other type (e.g 'future')
      this.setState({isPast: showPast});
    }
    else {
      // performance graph is opened and needs to be closed
      this.setState({showAdvanced: false});
    }
  };

  getCohortChart = () => {
    const {
      actualIndicators,
      calculatedData: {
        lastYearHistoryData: {indicatorsDataPerMonth}
      }
    } = this.props;
    const {performanceTimeFrame} = this.state;

    const indicators = ['MCL', 'MQL', 'SQL', 'opps', 'users'];
    const indicatorsConversionMapping = {
      MCL: 'leadToMQLConversionRate',
      MQL: 'MQLToSQLConversionRate',
      SQL: 'SQLToOppConversionRate',
      opps: 'OppToAccountConversionRate'
    };
    const calcConvRate = ((funnelStage1, funnelStage2) => {
      if (funnelStage2 && funnelStage1) {
        return Math.round(funnelStage2 / funnelStage1 * 100);
      }
      return 0;
    });
    const round = float => {
      return Math.round(float * 100) / 100;
    };

    let currentTimeFrame = {};
    switch (performanceTimeFrame) {
      case timeFrameType.year: {
        indicators.forEach(indicator => {
          const indicatorsDataThisYear = this.getMonthlyDataByYear(indicatorsDataPerMonth);
          currentTimeFrame[indicator] = sumBy(indicatorsDataThisYear, newIndicatorMapping[indicator]);
          currentTimeFrame[indicatorsConversionMapping[indicator]] = round(meanBy(indicatorsDataThisYear, indicatorsConversionMapping[indicator]));
        });
        break;
      }
      case timeFrameType.quarter: {
        const indicatorsDataThisQuarter = this.getMonthlyDataByQuarter(indicatorsDataPerMonth);
        indicators.forEach(indicator => {
          currentTimeFrame[indicator] = sumBy(indicatorsDataThisQuarter, newIndicatorMapping[indicator]);
          currentTimeFrame[indicatorsConversionMapping[indicator]] = round(meanBy(indicatorsDataThisQuarter, indicatorsConversionMapping[indicator]));
        });
        break;
      }
      case timeFrameType.month:
      default: {
        indicators.forEach(indicator => {
          currentTimeFrame[indicator] = actualIndicators[newIndicatorMapping[indicator]];
          currentTimeFrame[indicatorsConversionMapping[indicator]] = actualIndicators[indicatorsConversionMapping[indicator]];
        });
        break;
      }
    }

    return (
      <div className={this.classes.miniFunnelContainer}>
        {
          indicators.map((indicator, index) => (
            <div key={indicator} className={this.classes.miniFunnelRow}>
              <div className={this.classes.miniFunnelText}>
                {getIndicatorNickname(indicator)}
              </div>
              <div className={this.classes.miniFunnelStage}>
                {currentTimeFrame[indicator]}
                {
                  index !== indicators.length - 1 && (
                    <Tooltip
                      className={this.classes.miniFunnelConv}
                      tip={
                        `Cohort-based ${
                          getIndicatorNickname(indicator, true)
                          } to ${
                          getIndicatorNickname(indicators[index + 1], true)
                          } Conv. Rate - ${
                          currentTimeFrame[indicatorsConversionMapping[indicator]]
                          }%`
                      }
                      id={`${indicator}-conversion`}
                    >
                      <div className={this.classes.curvedArrow}/>
                      {calcConvRate(
                        currentTimeFrame[indicator],
                        currentTimeFrame[indicators[index + 1]]
                      )}%
                    </Tooltip>
                  )
                }
              </div>
            </div>
          ))
        }
      </div>
    );
  };

  getPerformanceData = (budgets, dates, indicators) => {
    const {months} = this.state;

    return Array.from((Array.keys(new Array(months + 1))), index => {

      const json = {
        name: dates[index],
        total: 0
      };

      const monthChannels = budgets[index];

      Object.keys(monthChannels).forEach(channel => {
        json[channel] = monthChannels[channel];
        json.total += monthChannels[channel];
      });

      Object.keys(indicators[index]).forEach(indicator => {
        json[indicator] = indicators[index][indicator];
      });

      return json;
    });
  };

  getPerformanceSection = () => {
    const {
      planDate,
      historyData,
      actualIndicators,
      calculatedData: {
        committedBudgets,
        committedForecasting,
        objectives: {firstObjective, funnelFirstObjective},
        monthlyBudget,
        currentMonthChannels,
        historyData: {historyDataLength, rawMonths},
        lastYearHistoryData: {actualBudgets, indicatorsDataPerMonth}
      }
    } = this.props;
    const {months, performanceTimeFrame, isPast, showAdvanced} = this.state;

    const getChannels = historyData => merge([],
      historyData.planBudgets.map(item => mapValues(item, 'committedBudget')),
      historyData.actualChannelBudgets.map(item => get(item, 'knownChannels', {})),
      historyData.unknownChannels,
      historyData.actualChannelBudgets.map(item => get(item, 'unknownChannels', {})));
    const sumBudgets = budgets => budgets.reduce((sum, month) => Object.keys(month).reduce((monthSum, channel) => month[channel] + monthSum, 0) + sum, 0);
    const sumLTV = (indicators) => sumBy(indicators, (month) => month.LTV);
    const sumObjective = (indicators) => sumBy(indicators, (month) => month[funnelFirstObjective]);

    const getFutureArray = array => array.slice(1, months + 1);
    const futureBudget = sumBudgets(getFutureArray(committedBudgets));
    const futureLTV = getFutureArray(committedForecasting).reduce((sum, item) => sum + (item.LTV || 0), 0);
    const furureObjective = getFutureArray(committedForecasting).reduce((sum, item) => sum + item[funnelFirstObjective], 0);

    const historyDataSliced = mapValues(historyData, arr => arr.slice(arr.length - months, arr.length));
    const pastChannels = getChannels(historyDataSliced);
    const pastSpend = sumBudgets(pastChannels);
    const pastLTV = sumLTV(historyDataSliced.indicators);
    const pastObjective = sumObjective(historyDataSliced.indicators);

    const relativePastData = {};
    Object.keys(historyData).forEach((key) => {
      relativePastData[key] = historyData[key].slice(historyDataLength - (2 * months), historyDataLength - months);
    });
    const relativePastChannels = getChannels(relativePastData);
    const relativePastBudget = sumBudgets(relativePastChannels);
    const relativePastLTV = relativePastData && sumLTV(relativePastData.indicators);
    const relativePastObjective = relativePastData && sumObjective(relativePastData.indicators);

    const roundAndAbs = number => Math.abs(Math.round(number));

    const pastDates = getDatesSpecific(planDate, months, 1);
    const futureDates = getDates(planDate);
    const concatEvenIfHistoryEmpty = (pastArray, current) => [...isEmpty(pastArray) ? [{}] : pastArray, current];
    const performanceData = isPast
      ? this.getPerformanceData(
        concatEvenIfHistoryEmpty(pastChannels, currentMonthChannels),
        pastDates,
        concatEvenIfHistoryEmpty(historyDataSliced.indicators, actualIndicators)
      )
      : this.getPerformanceData(
        committedBudgets.slice(0, months + 1),
        futureDates,
        committedForecasting
      );

    let currentTimeFrame = {};
    switch (performanceTimeFrame) {
      case timeFrameType.year: {
        const indicatorsDataThisYear = this.getMonthlyDataByYear(indicatorsDataPerMonth);
        const budgetsThisYear = this.getMonthlyDataByYear(actualBudgets);
        currentTimeFrame.sessions = sumBy(indicatorsDataThisYear, 'sessions');
        currentTimeFrame.budget = sum(budgetsThisYear.map(item => sum(Object.values(item))));
        break;
      }
      case timeFrameType.quarter: {
        const indicatorsDataThisQuarter = this.getMonthlyDataByQuarter(indicatorsDataPerMonth);
        const budgetsThisQuarter = this.getMonthlyDataByQuarter(actualBudgets);
        currentTimeFrame.sessions = sumBy(indicatorsDataThisQuarter, 'sessions');
        currentTimeFrame.budget = sum(budgetsThisQuarter.map(item => sum(Object.values(item))));
        break;
      }
      case timeFrameType.month:
      default: {
        const budgetsThisMonth = actualBudgets[actualBudgets.length - 1];
        currentTimeFrame.sessions = actualIndicators.sessions;
        currentTimeFrame.budget = sum(Object.values(budgetsThisMonth));
        break;
      }
    }
    ;

    const lastXMonths = [...rawMonths]
      .slice(-months)
      .map(month => moment(month).format('MMM YY'))
      .join(', ');
    const nextXMonths = (new Array(months))
      .fill(null)
      .map((item, index) => moment().add(index + 1, 'months').format('MMM YY'))
      .join(', ');

    return (
      <Fragment>
        <div className={classnames(this.classes.rows, this.classes.item, this.classes.performance)}>
          <div className={classnames(this.classes.column, showAdvanced && isPast && this.classes.active)}>
            <div className={this.classes.columnHeader}>
              <div className={this.classes.timeText}>
                <Tooltip
                  tip={lastXMonths}
                  id="last-x-months"
                >
                  Last {months} Months
                </Tooltip>
              </div>
              <div className={this.classes.text}>
                Past
                <div
                  className={this.classes.advanced}
                  onClick={() => this.togglePerformanceGraph('past')}
                />
              </div>
              <div className={this.classes.settingsContainer}>
                <div
                  className={this.classes.settings}
                  onClick={() => {
                    this.pastSettingsPopup.open();
                  }}
                />
                {months !== undefined && (
                  <MonthsPopup
                    months={months}
                    maxMonths={historyDataLength}
                    onChange={this.handleMonthsChange}
                    getRef={ref => this.pastSettingsPopup = ref}
                    style={{width: 'max-content', top: '0', left: 'auto', right: '-34px'}}
                  />
                )}
              </div>
            </div>
            <div className={classnames(this.classes.columnBody, this.classes.grid)}>
              <div className={this.classes.quarter}>
                <div className={this.classes.quarterNumber}>
                  ${formatBudgetShortened(pastSpend)}
                  <div className={this.classes.center} style={{
                    visibility: (relativePastBudget &&
                      isFinite(relativePastBudget) &&
                      (pastSpend / relativePastBudget - 1)) ? 'visible' : 'hidden'
                  }}>
                    <div className={this.classes.historyArrow}
                         data-decline={(pastSpend / relativePastBudget - 1) < 0 ? true : null}/>
                    <div className={this.classes.historyGrow}
                         data-decline={(pastSpend / relativePastBudget - 1) < 0 ? true : null}
                         style={{marginRight: '0'}}>
                      {roundAndAbs((pastSpend / relativePastBudget - 1) * 100)}%
                    </div>
                  </div>
                </div>
                <div className={this.classes.quarterText}>
                  Spend
                </div>
              </div>
              <div className={this.classes.quarter}>
                <div className={this.classes.quarterNumber}>
                  {pastSpend ? formatNumberWithDecimalPoint(pastLTV / pastSpend, 1) : '0.0'}x
                  <div className={this.classes.center} style={{
                    visibility: (relativePastBudget &&
                      isFinite(relativePastBudget) &&
                      relativePastLTV &&
                      isFinite(relativePastLTV)) ? 'visible' : 'hidden'
                  }}>
                    <div className={this.classes.historyArrow}
                         data-decline={(pastLTV / pastSpend) / (relativePastLTV / relativePastBudget) < 1
                           ? true
                           : null}/>
                    <div className={this.classes.historyGrow}
                         data-decline={((pastLTV / pastSpend) / (relativePastLTV / relativePastBudget)) < 1
                           ? true
                           : null} style={{marginRight: '0'}}>
                      {roundAndAbs(((pastLTV / pastSpend) / (relativePastLTV / relativePastBudget) - 1) * 100)}%
                    </div>
                  </div>
                </div>
                <div className={this.classes.quarterText}>
                  ROI
                </div>
              </div>
              <div className={this.classes.quarter}>
                <div className={this.classes.quarterNumber}>
                  ${formatBudgetShortened(pastLTV)}
                  <div className={this.classes.center} style={{
                    visibility: (relativePastLTV &&
                      isFinite(relativePastLTV) &&
                      (pastLTV / relativePastLTV - 1)) ? 'visible' : 'hidden'
                  }}>
                    <div className={this.classes.historyArrow}
                         data-decline={(pastLTV / relativePastLTV - 1) < 0 ? true : null}/>
                    <div className={this.classes.historyGrow}
                         data-decline={(pastLTV / relativePastLTV - 1) < 0 ? true : null} style={{marginRight: '0'}}>
                      {roundAndAbs((pastLTV / relativePastLTV - 1) * 100)}%
                    </div>
                  </div>
                </div>
                <div className={this.classes.quarterText}>
                  LTV
                </div>
              </div>
              <div className={this.classes.quarter}>
                <div className={this.classes.quarterNumber}>
                  {formatBudgetShortened(pastObjective)}
                  <div className={this.classes.center} style={{
                    visibility: (relativePastObjective &&
                      isFinite(relativePastObjective) &&
                      (pastObjective / relativePastObjective - 1)) ? 'visible' : 'hidden'
                  }}>
                    <div className={this.classes.historyArrow}
                         data-decline={(pastObjective / relativePastObjective - 1) < 0 ? true : null}/>
                    <div className={this.classes.historyGrow}
                         data-decline={(pastObjective / relativePastObjective - 1) < 0 ? true : null}
                         style={{marginRight: '0'}}>
                      {roundAndAbs((pastObjective / relativePastObjective - 1) * 100)}%
                    </div>
                  </div>
                </div>
                <div className={this.classes.quarterText}>
                  {getIndicatorNickname(funnelFirstObjective)}
                </div>
              </div>
            </div>
          </div>
          <div className={classnames(this.classes.column, this.classes.currentPerformance)}>
            <div className={this.classes.columnHeader}>
              <div className={this.classes.text}>
                {performanceTimeFrame}
              </div>
              <div className={this.classes.settingsContainer}>
                <div
                  className={this.classes.settings}
                  onClick={() => {
                    this.timeFramePopup.open();
                  }}
                />
                {months !== undefined && (
                  <PlanPopup
                    ref={el => this.timeFramePopup = el}
                    title='Time Frame'
                    style={{width: 'max-content', top: '0', left: 'auto', right: '-34px'}}
                  >
                    <PopupTextContent>
                      <Select
                        selected={performanceTimeFrame}
                        select={{
                          options: Object.values(timeFrameType).map(value => ({
                            value,
                            label: value
                          }))
                        }}
                        onChange={this.handleTimeFrameChange}
                        style={{width: '150px', marginTop: '10px'}}
                      />
                    </PopupTextContent>
                  </PlanPopup>
                )}
              </div>
            </div>
            <div className={this.classes.currentPerformanceContent}>
              {this.getCohortChart()}
              <div className={this.classes.currentPerformanceFooter}>
                <div className={this.classes.snapshot}>
                  <div className={this.classes.snapshotNumber}>
                    {formatBudgetShortened(currentTimeFrame.sessions)}
                  </div>
                  <div className={this.classes.snapshotText}>
                    Sessions
                  </div>
                </div>
                <div className={this.classes.snapshot}>
                  <div className={this.classes.snapshotNumber}>
                    ${formatBudgetShortened(currentTimeFrame.budget)}
                  </div>
                  <div className={this.classes.snapshotText}>
                    Budget
                  </div>
                </div>
                <div className={this.classes.snapshot}>
                  <div className={this.classes.snapshotNumber}>
                    ${formatBudgetShortened(actualIndicators.MRR)}
                  </div>
                  <div className={this.classes.snapshotText}>
                    MRR
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className={classnames(this.classes.column, showAdvanced && !isPast && this.classes.active)}>
            <div className={this.classes.columnHeader}>
              <div className={this.classes.timeText}>
                <Tooltip
                  tip={nextXMonths}
                  id="last-x-months"
                >
                  Next {months} Months
                </Tooltip>
              </div>
              <div className={this.classes.text}>
                Future
                <div
                  className={this.classes.advanced}
                  onClick={() => this.togglePerformanceGraph('future')}
                />
              </div>
              <div className={this.classes.settingsContainer}>
                <div
                  className={this.classes.settings}
                  onClick={() => {
                    this.futureSettingsPopup.open();
                  }}
                />
                {months !== undefined && (
                  <MonthsPopup
                    months={months}
                    maxMonths={historyDataLength}
                    onChange={this.handleMonthsChange}
                    getRef={ref => this.futureSettingsPopup = ref}
                    style={{width: 'max-content', top: '0', left: 'auto', right: '-34px'}}
                  />
                )}
              </div>
            </div>
            <div className={classnames(this.classes.columnBody, this.classes.grid)}>
              <div className={this.classes.quarter}>
                <div className={this.classes.quarterNumber}>
                  ${formatBudgetShortened(futureBudget)}
                  <div className={this.classes.center} style={{
                    visibility: (pastSpend && isFinite(pastSpend) && (futureBudget / pastSpend - 1))
                      ? 'visible'
                      : 'hidden'
                  }}>
                    <div className={this.classes.historyArrow}
                         data-decline={(futureBudget / pastSpend - 1) < 0 ? true : null}/>
                    <div className={this.classes.historyGrow}
                         data-decline={(futureBudget / pastSpend - 1) < 0 ? true : null}
                         style={{marginRight: '0'}}>
                      {roundAndAbs((futureBudget / pastSpend - 1) * 100)}%
                    </div>
                  </div>
                </div>
                <div className={this.classes.quarterText}>
                  Budget
                </div>
              </div>
              <div className={this.classes.quarter}>
                <div className={this.classes.quarterNumber}>
                  {futureBudget ? formatNumberWithDecimalPoint(futureLTV / futureBudget, 1) : '0.0'}x
                  <div className={this.classes.center} style={{
                    visibility: (pastSpend &&
                      isFinite(pastSpend) &&
                      pastLTV &&
                      isFinite(pastLTV)) ? 'visible' : 'hidden'
                  }}>
                    <div className={this.classes.historyArrow}
                         data-decline={(futureLTV / futureBudget) / (pastLTV / pastSpend) < 1
                           ? true
                           : null}/>
                    <div className={this.classes.historyGrow}
                         data-decline={((futureLTV / futureBudget) / (pastLTV / pastSpend)) < 1 ? true : null}
                         style={{marginRight: '0'}}>
                      {roundAndAbs(((futureLTV / futureBudget) / (pastLTV / pastSpend) - 1) * 100)}%
                    </div>
                  </div>
                </div>
                <div className={this.classes.quarterText}>
                  ROI
                </div>
              </div>
              <div className={this.classes.quarter}>
                <div className={this.classes.quarterNumber}>
                  ${formatBudgetShortened(futureLTV)}
                  <div className={this.classes.center} style={{
                    visibility: (pastLTV && isFinite(pastLTV) && (futureLTV / pastLTV - 1))
                      ? 'visible'
                      : 'hidden'
                  }}>
                    <div className={this.classes.historyArrow}
                         data-decline={(futureLTV / pastLTV - 1) < 0 ? true : null}/>
                    <div className={this.classes.historyGrow}
                         data-decline={(futureLTV / pastLTV - 1) < 0 ? true : null} style={{marginRight: '0'}}>
                      {roundAndAbs((futureLTV / pastLTV - 1) * 100)}%
                    </div>
                  </div>
                </div>
                <div className={this.classes.quarterText}>
                  LTV
                </div>
              </div>
              <div className={this.classes.quarter}>
                <div className={this.classes.quarterNumber}>
                  {formatBudgetShortened(furureObjective)}
                  <div className={this.classes.center} style={{
                    visibility: (pastObjective &&
                      isFinite(pastObjective) &&
                      (furureObjective / pastObjective - 1)) ? 'visible' : 'hidden'
                  }}>
                    <div className={this.classes.historyArrow}
                         data-decline={(furureObjective / pastObjective - 1) < 0 ? true : null}/>
                    <div className={this.classes.historyGrow}
                         data-decline={(furureObjective / pastObjective - 1) < 0 ? true : null}
                         style={{marginRight: '0'}}>
                      {roundAndAbs((furureObjective / pastObjective - 1) * 100)}%
                    </div>
                  </div>
                </div>
                <div className={this.classes.quarterText}>
                  {getIndicatorNickname(funnelFirstObjective)}
                </div>
              </div>
            </div>
          </div>
        </div>
        {showAdvanced &&
        <div className={this.classes.rows}>
          <PerformanceGraph
            isPast={isPast}
            months={months}
            data={performanceData}
            defaultIndicator={firstObjective}
          />
        </div>
        }
      </Fragment>
    );
  };

  getObjectiveSection = () => {
    const {
      calculatedData: {
        committedForecasting,
        objectives: {collapsedObjectives}
      },
      historyData: {
        indicators
      },
      actualIndicators,
      objectives
    } = this.props;

    if (!collapsedObjectives.length) {
      return null;
    }

    const indicatorsProperties = getIndicatorsWithProps();

    return (
      <div className={this.classes.rows}>
        <div className={this.classes.item}>
          <div className={this.classes.text}>
            Objectives
          </div>
          <div className={this.classes.chart}>
            {
              collapsedObjectives.map((objective, index) => (
                <Objective
                  key={index}
                  historyIndicators={map(indicators, objective.indicator)}
                  actualIndicator={actualIndicators[objective.indicator] || 0}
                  indicator={objective.indicator}
                  target={objective.target}
                  title={indicatorsProperties[objective.indicator].nickname}
                  timeFrame={objective.dueDate}
                  project={projectObjective(committedForecasting, objective)}
                  color={getColor(index)}
                  objectives={objectives}
                />
              ))
            }
          </div>
        </div>
      </div>
    );
  };

  getStatsSection = () => {
    const {
      planDate,
      historyData,
      actualIndicators,
      campaigns,
      calculatedData: {
        annualBudget,
        annualBudgetLeftToPlan,
        monthlyBudget,
        monthlyBudgetLeftToInvest,
        monthlyExtarpolatedMoneySpent,
        monthlyExtapolatedTotalSpending,
        historyData: {historyDataLength}
      }
    } = this.props;

    const numberOfActiveCampaigns = campaigns
      .filter(campaign => campaign.isArchived !== true && campaign.status !== 'Completed').length;

    const monthlyOnTrackSpending = monthlyBudget * getExtarpolateRatio(new Date(), planDate);
    const isOnTrack = Math.abs(monthlyOnTrackSpending - monthlyExtarpolatedMoneySpent) < monthlyOnTrackSpending * 0.07;

    const ratioCalc = (LTV, CAC) => (LTV / CAC).toFixed(2) || 0;
    const ratioCanBeCalculated = (actualIndicators) => (actualIndicators &&
      actualIndicators.LTV !==
      0 &&
      actualIndicators.CAC !==
      0);
    const previousMonthData = (historyDataLength > 1)
      ? {actualIndicators: {...historyData.indicators[historyDataLength - 1]}}
      : {actualIndicators: {LTV: 0, CAC: 0}};
    const ratio = ratioCanBeCalculated(actualIndicators) ? ratioCalc(actualIndicators.LTV, actualIndicators.CAC) : null;
    const lastMonthRatio = ratioCanBeCalculated(previousMonthData.actualIndicators)
      ? ratioCalc(previousMonthData.actualIndicators.LTV, previousMonthData.actualIndicators.CAC)
      : null;
    const ratioContextStat = (ratio && lastMonthRatio) ? Math.round((ratio / lastMonthRatio) * 100) - 100 : null;

    return (
      <div className={classnames(this.classes.rows, this.classes.stats)}>
        <StatSquare
          title="Annual Budget"
          stat={'$' + formatBudgetShortened(annualBudget)}
          context={{
            stat: '$' + formatBudgetShortened(annualBudgetLeftToPlan),
            text: 'left to plan',
            type: annualBudgetLeftToPlan > 0 ? 'positive' : annualBudgetLeftToPlan < 0 ? 'negative' : 'neutral'
          }}
          containerClassName={this.classes.statSquareContainer}
        />
        <StatSquare
          title="Monthly Budget"
          stat={'$' + formatBudgetShortened(monthlyBudget)}
          note={{
            text: isOnTrack ? 'On-Track' : 'Off-Track',
            tooltipText: isOnTrack ?
              'Actual spent on-track' :
              'Actual spent off-track. Forecasted: ' + '$' + formatBudgetShortened(monthlyExtapolatedTotalSpending)
          }}
          containerClassName={this.classes.statSquareContainer}
        />
        <StatSquare
          title="Active Campaigns"
          stat={numberOfActiveCampaigns}
          context={{
            stat: '$' + formatBudgetShortened(monthlyBudgetLeftToInvest),
            text: 'left to invest',
            type: monthlyBudgetLeftToInvest > 0 ? 'positive' : monthlyBudgetLeftToInvest < 0 ? 'negative' : 'neutral'
          }}
          containerClassName={this.classes.statSquareContainer}
        />
        <StatSquare
          title="LTV:CAC Ratio"
          stat={ratio}
          context={ratio ? {
            stat: ratioContextStat + '%',
            text: 'from last month',
            type: ratioContextStat > 0 ? 'positive' : ratioContextStat < 0 ? 'negative' : 'neutral',
            withArrow: true
          } : undefined}
          emptyStatMessage={'Oh… It seems that the relevant metrics (LTV + CAC) are missing. Please update your data.'}
          showEmptyStat={ratio === null}
          containerClassName={this.classes.statSquareContainer}
        />
      </div>
    );
  };

  getChartSection = () => {
    const {
      campaigns,
      planUnknownChannels,
      calculatedData: {
        committedBudgets,
        monthlyBudget
      }
    } = this.props;

    const merged = merge(committedBudgets, planUnknownChannels);
    const fatherChannelsWithBudgets = [];
    Object.keys(merged && merged[0])
      .filter(channel => merged[0][channel])
      .forEach(channel => {
        const category = getChannelMetadata('category', channel);
        const alreadyExistItem = fatherChannelsWithBudgets.find(item => item.name === category);
        if (!alreadyExistItem) {
          fatherChannelsWithBudgets.push({name: category, value: merged[0][channel]});
        }
        else {
          alreadyExistItem.value += merged[0][channel];
        }
      });

    return (
      <div className={classnames(this.classes.rows, this.classes.twoColumns)}>
        <div className={this.classes.item}>
          <Tooltip
            className={this.classes.text}
            tip="Total allocated budget for campaigns per defined focus"
            id="cam-by-focus"
          >
            Campaigns by Focus
          </Tooltip>
          <div className={this.classes.chart}>
            <CampaignsByFocus campaigns={campaigns}/>
          </div>
        </div>
        <div className={this.classes.summaryItem}>
          <div className={this.classes.text} style={{width: '100%'}}>
            Monthly Marketing Mix Summary
          </div>
          <div className={this.classes.summaryChart}>
            <div className={this.classes.monthlyMarketingLegend}>
              {
                fatherChannelsWithBudgets.map((element, i) => (
                  <div key={i} className={this.classes.fatherChannelBox}>
                    <div
                      className={this.classes.fatherChannelThumbnail}
                      style={{
                        borderColor: getColor(i),
                        backgroundColor: this.state.activeIndex === i ? getColor(i) : 'initial'
                      }}
                    />
                    <div
                      className={this.classes.fatherChannelText}
                      style={{
                        fontWeight: this.state.activeIndex === i ? 'bold' : 'initial'
                      }}
                    >
                      {element.name}
                    </div>
                    <div className={this.classes.fatherChannelValue}>
                      ${formatNumber(element.value)}
                    </div>
                    <div className={this.classes.fatherChannelPercentage}>
                      ({Math.round(element.value / monthlyBudget * 100)}%)
                    </div>
                  </div>
                ))
              }
            </div>
            <div className={this.classes.monthlyMarketingChart}>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart
                  onMouseLeave={() => {
                    this.setState({activeIndex: void 0});
                  }}
                >
                  <Pie
                    data={fatherChannelsWithBudgets}
                    dataKey='value'
                    cx='50%'
                    cy='50%'
                    labelLine={true}
                    innerRadius='75%'
                    outerRadius='100%'
                    isAnimationActive={false}
                    onMouseMove={this.onPieEnter}
                  >
                    {
                      fatherChannelsWithBudgets.map((entry, index) => (
                        <Cell
                          fill={getColor(index)}
                          key={index}
                        />
                      ))
                    }
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  getRankingSection = () => {
    const {
      attribution: {
        channelsImpact,
        campaigns: attributionCampaigns,
        pages
      },
      calculatedData: {
        objectives: {funnelObjectives}
      }
    } = this.props;

    const weights = {
      newMCL: 1,
      newMQL: 1,
      newSQL: 1,
      newOpps: 1,
      newUsers: 1
    };

    Object.keys(weights).forEach(indicator => {
      const objectiveIndex = funnelObjectives.findIndex(function (objective) {
        return objective === indicator;
      });
      switch (objectiveIndex) {
        case 0:
          weights[indicator] = 2;
          break;
        case 1:
          weights[indicator] = 1.5;
          break;
        case 2:
          weights[indicator] = 1.25;
          break;
      }
    });

    const channelsWithProps = getChannelsWithProps();
    const topChannels = Object.keys(channelsWithProps).map(channel => {
      const score = Math.round(
        ((channelsImpact && channelsImpact.MCL && channelsImpact.MCL[channel]) ? channelsImpact.MCL[channel] *
          weights.newMCL : 0)
        +
        ((channelsImpact && channelsImpact.MQL && channelsImpact.MQL[channel]) ? channelsImpact.MQL[channel] *
          weights.newMQL : 0)
        +
        ((channelsImpact && channelsImpact.SQL && channelsImpact.SQL[channel]) ? channelsImpact.SQL[channel] *
          weights.newSQL : 0)
        +
        ((channelsImpact && channelsImpact.opps && channelsImpact.opps[channel]) ? channelsImpact.opps[channel] *
          weights.newOpps : 0)
        +
        ((channelsImpact && channelsImpact.users && channelsImpact.users[channel]) ? channelsImpact.users[channel] *
          weights.newUsers : 0)
      );
      return {title: channelsWithProps[channel].nickname, score: score, icon: 'plan:' + channel};
    });

    const topCampaigns = attributionCampaigns ? attributionCampaigns.map(campaignData => {
      const score = Math.round(campaignData.MCL * weights.newMCL
        + campaignData.MQL * weights.newMQL
        + campaignData.SQL * weights.newSQL
        + campaignData.opps * weights.newOpps
        + campaignData.users * weights.newUsers);
      return {
        title: campaignData.name,
        score: score,
        icon: campaignData.channels.length > 0 ? campaignData.channels.length === 1
          ? 'plan:' + campaignData.channels[0]
          : 'plan:multiChannel' : null
      };
    }) : [];

    const topContent = pages.map(item => {
      const score = Math.round(item.MCL * weights.newMCL
        + item.MQL * weights.newMQL
        + item.SQL * weights.newSQL
        + item.opps * weights.newOpps
        + item.users * weights.newUsers);
      return {title: item.title, score: score, icon: 'plan:' + item.channel};
    });

    return (
      <div className={this.classes.rows}>
        <TopX title='channel' data={topChannels}/>
        <TopX title='campaign' data={topCampaigns}/>
        <TopX title='content' data={topContent}/>
      </div>
    );
  };

  render() {
    return (
      <div>
        {this.getPerformanceSection()}
        {this.getObjectiveSection()}
        {this.getStatsSection()}
        {this.getChartSection()}
        {this.getRankingSection()}
      </div>
    );
  }
}
