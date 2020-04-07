import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import moment from 'moment';
import {inject, observer} from 'mobx-react';
import {
  entries,
  flatten,
  get,
  groupBy,
  mapValues,
  merge,
  mergeWith,
  sum,
  sumBy,
  uniq
} from 'lodash';

import {compose, getTotalImpactByChannel} from 'components/utils/utils';
import {formatBudget} from 'components/utils/budget';
import {
  getMonthsBetweenDates,
  getRawDatesSpecific,
  getStartOfMonthTimestamp
} from 'components/utils/date';
import {flattenObjectives} from 'components/utils/objective';
import {
  getIndicatorsKeys,
  getIndicatorsWithNicknames,
  newIndicatorMapping,
  getMetadata as getIndicatorMetadata
} from 'components/utils/indicators';
import {getChannelsWithProps, getMetadata as getChannelMetadata} from 'components/utils/channels';
import {getMarketingVsSales, MARKETING_GENERATED, MARKETING_ASSISTED, NO_MARKETING} from 'components/utils/users';
import {filterKinds} from 'components/utils/filters';

import HistoricalPerformanceChart from 'components/pages/analyze/Overview/HistoricalPerformanceChart';
import HistoryOverviewTable from 'components/pages/analyze/Overview/HistoryOverviewTable';
import ImpactByCRM from 'components/pages/analyze/Overview/ImpactByCRM';
import ImpactByIndicator from 'components/pages/analyze/Overview/ImpactByIndicator';
import ImpactByMarketing from 'components/pages/analyze/Overview/ImpactByMarketing';
import StatsSquares from 'components/pages/analyze/Overview/StatsSquares';
import TypedOverviewTable from 'components/pages/analyze/Overview/TypedOverviewTable';

import styles from 'styles/analyze/analyze.css';
import {addFilteredSessions} from '../../../../attribution/preprocess';
import {calculateIndicatorImpact} from '../../../../attribution/channelsImpact';
import {getAttributionWeights} from '../../../../attribution/calculator';
import userStore from '../../../../stores/userStore';
import {initializeChannelsImpact} from '../../../../attribution/channelsImpact';

const enhance = compose(
  inject(({
            attributionStore: {
              data,
              getMetricDataByMapping,
              metricsOptions,
              timeFrame,
              attributionModel,
              tsRange
            }
          }) => ({
    data,
    getMetricDataByMapping,
    metricsOptions,
    timeFrame,
    attributionModel,
    tsRange
  })),
  observer
);

const classes = styles.locals;

const calcDefaultColumnsForCustomDate = (start, end) => {
  const result = {};
  let nextMonthsTimestamp = start;

  while (nextMonthsTimestamp <= end) {
    result[nextMonthsTimestamp] = [];

    const nextMonth = moment(new Date(nextMonthsTimestamp)).add(1, 'months').toDate();

    nextMonthsTimestamp = getStartOfMonthTimestamp(nextMonth);
  }

  return result;
};

class Overview extends React.Component {
  state = {
    crmDataIndicator: 'SQL',
    crmFilters: [],
    groupByField: 'region',
    historicalPerformanceIndicator: 'SQL',
    marketingVsSalesIndicator: 'SQL',
    generatedImpactIndicator: 'SQL'
  };

  componentDidMount() {
    styles.use();
  }

  componentWillUnmount() {
    styles.unuse();
  }

  handleCrmFiltersChange = crmFilters => {
    this.setState({
      crmFilters
    });
  };

  getData() {
    const {data, getMetricDataByMapping, timeFrame, attributionModel, tsRange} = this.props;
    const {
      attribution: {
        channelsImpact,
        groupByMapping
      } = {},
      calculatedData: {
        daily: {total: dailyTotalCost, indicatorsDataPerDay} = {},
        historyData: {
          months,
          totalCost: monthlyTotalCost,
          historyDataWithCurrentMonth: {
            indicators: indicatorsWithCurrentMonth,
            actualIndicatorsDaily
          }
        }
      },
      CRMConfig: {
        isCountByOpps,
        dataCustomFilters,
        customFieldsNicknames = []
      } = {},
      userAccount: {
        permissions = {}
      }
    } = data;
    const {customDateMode, monthsExceptThisMonth, startDate, endDate} = timeFrame;
    const {
      historicalPerformanceIndicator,
      marketingVsSalesIndicator,
      crmDataIndicator,
      groupByField,
      crmFilters,
      generatedImpactIndicator
    } = this.state;
    const indicatorsOptions = getIndicatorsWithNicknames();
    const indicatorsKeys = getIndicatorsKeys();

    const {startTS, endTS} = tsRange;
    const monthsIncludingCustom = getMonthsBetweenDates(startTS, endTS);

    // Parse object to recharts format per indicator
    const indicatorsData = {};
    const costPerFunnel = {};
    let indicatorData;
    let grow;
    let performanceData;
    let totalCost;
    let defaultColumns;

    const getFirstTouchPoints = data =>
      data
        .filter(item => item.funnelStages[marketingVsSalesIndicator])
        .map(item => ({
          ...getMarketingVsSales(item),
          funnelStages: item.funnelStages
        }));

    const calcCostPerFunnel = data =>
      Object.keys(newIndicatorMapping).map(indicator => {
        const newIndicator = newIndicatorMapping[indicator];
        const indicatorSum = sumBy(
          data,
          item => item[newIndicator] || 0
        );
        costPerFunnel[indicator] = indicatorSum
          ? formatBudget(Math.round(totalCost / indicatorSum))
          : '-';
      });

    const calcImpactData = (
      touchPointsByPeriod,
      getNameFn,
      filterFn = () => true
    ) => {
      const keys = Object.keys(touchPointsByPeriod);

      return Object.values(touchPointsByPeriod)
        .map((period, index) => {
          const periodKey = Number(keys[index]);

          return period.reduce(
            (object, item) => {
              if (item.isMarketingGenerated) {
                object[MARKETING_GENERATED] += 1;
              }
              else if (item.isMarketingAssisted) {
                object[MARKETING_ASSISTED] += 1;
              }
              else {
                object[NO_MARKETING] += 1;
              }
              return object;
            },
            {
              [MARKETING_GENERATED]: 0,
              [MARKETING_ASSISTED]: 0,
              [NO_MARKETING]: 0,
              period: periodKey,
              name: getNameFn(index, periodKey)
            }
          );
        })
        .filter(filterFn)
        .sort((a, b) => a.period - b.period)
        .map(({period, ...item}) => item);
    };

    const getGroupByDataFiltered = indicator =>
      getMetricDataByMapping(indicator).filter(
        item =>
          item.funnelStages[indicator] &&
          moment(item.funnelStages[indicator]).isBetween(startTS, endTS)
      );

    const customFilter = new Function(
      'item',
      dataCustomFilters || 'return true'
    );
    const calcCrmSessions = dateItems => dateItems
      .map(user => {
        const {revenue, sessions} = user;
        const crmSession = sessions.find(session => session.isCRM);
        return {...crmSession, revenue};
      })
      .filter(item => !!item)
      .filter(item => customFilter(item))
      .filter((item) => crmFilters.every((filter) => filter.assert(item)));

    const calcCrmItem = crmSessions => {
      return mapValues(groupBy(crmSessions, groupByField), users => {
        if (isCountByOpps) {
          return users.reduce((sum, user) => sum + (Object.keys(user.revenue).length || 1), 0);
        }
        else {
          return users.length;
        }
      });
    };

    const groupIndicatorsData = (item, indicator) =>
      getStartOfMonthTimestamp(
        new Date(item.funnelStages[indicator])
      );

    const addDefaultColumns = grouppedData =>
      merge({}, defaultColumns, grouppedData);

    if (customDateMode) {
      const start = getStartOfMonthTimestamp(new Date(startDate));
      const end = getStartOfMonthTimestamp(new Date(endDate));

      totalCost = dailyTotalCost;
      defaultColumns = calcDefaultColumnsForCustomDate(start, end);

      indicatorsDataPerDay.forEach(item => {
        indicatorsKeys.forEach(indicator => {
          if (!indicatorsData[indicator]) {
            indicatorsData[indicator] = [];
          }

          const value = item[indicator];

          indicatorsData[indicator].push({
            name: item.name,
            value: value && value > 0 ? value : 0
          });
        });
      });

      indicatorData = indicatorsData[historicalPerformanceIndicator];

      if (indicatorData) {
        const indicatorDataWithValue = indicatorData.filter(item =>
          Boolean(item && item.value)
        );

        if (indicatorDataWithValue.length < 2) {
          // not enough data to show growth,
          // treat it as if there's no growth (hide it)
          grow = {
            value: 0
          };
        }

        else {
          if (getIndicatorMetadata('isRefreshed', historicalPerformanceIndicator)) {
            grow = {
              value: sum(indicatorDataWithValue.map(data => data.value)),
              percentage: null,
              isRefreshed: true
            };
          }
          else {
            const current = indicatorDataWithValue[indicatorDataWithValue.length - 1].value;
            const previous = indicatorDataWithValue[0].value;
            grow = {
              value: current - previous,
              percentage: previous ? Math.round((current - previous) / previous * 100) : Infinity,
              isRefreshed: false
            };
          }
        }
      }

      calcCostPerFunnel(indicatorsDataPerDay);

      performanceData =
        indicatorsData[historicalPerformanceIndicator] || [];
    }
    else {
      const monthsCount = monthsExceptThisMonth + 1;

      totalCost = monthlyTotalCost;
      defaultColumns = Array.from(
        {length: monthsCount},
        (_, index) =>
          getStartOfMonthTimestamp(
            moment()
              .subtract(monthsCount - index - 1, 'months')
              .toDate()
          )
      ).reduce((res, curr) => ({...res, [curr]: []}), {});

      const currentDay = new Date().getDate();

      actualIndicatorsDaily.forEach((item, key) => {
        const isCurrentMonth = key === actualIndicatorsDaily.length - 1;
        const monthString = months[key];

        if (isCurrentMonth) {
          item = item.slice(0, currentDay);
        }

        item.forEach((month = {}, index) => {
          const displayDate = index
            ? `${index + 1} ${monthString}`
            : monthString;
          indicatorsKeys.forEach(indicator => {
            if (!indicatorsData[indicator]) {
              indicatorsData[indicator] = [];
            }
            const value = month[indicator];
            indicatorsData[indicator].push({
              name: displayDate,
              value: value && value > 0 ? value : 0
            });
          });
        });
      });

      indicatorData = indicatorsData[historicalPerformanceIndicator];

      if (indicatorData) {
        const relevantIndicatorData = indicatorData.slice(months || 0, indicatorData.length);
        if (getIndicatorMetadata('isRefreshed', historicalPerformanceIndicator)) {
          grow = {
            value: sum(relevantIndicatorData.map(data => data.value)),
            percentage: null,
            isRefreshed: true
          };
        }
        else {
          const current = relevantIndicatorData[relevantIndicatorData.length - 1].value;
          const previous = relevantIndicatorData[0].value;
          grow = {
            value: current - previous,
            percentage: previous ? Math.round((current - previous) / previous * 100) : Infinity,
            isRefreshed: false
          };
        }
      }

      const indicatorsInRelevantMonths = indicatorsWithCurrentMonth.slice(
        -(monthsExceptThisMonth + 1)
      );

      calcCostPerFunnel(indicatorsInRelevantMonths);

      performanceData = indicatorsData[historicalPerformanceIndicator]
        ? indicatorsData[historicalPerformanceIndicator].slice(months)
        : [];
    }

    const firstTouchPoints = getFirstTouchPoints(
      getGroupByDataFiltered(marketingVsSalesIndicator)
    );

    const impactData = calcImpactData(
      addDefaultColumns(
        groupBy(firstTouchPoints, item =>
          groupIndicatorsData(
            item,
            marketingVsSalesIndicator
          )
        )
      ),
      index => monthsIncludingCustom[index]
    );

    const crmSessionsByPeriod = Object.values(
      addDefaultColumns(
        groupBy(
          getGroupByDataFiltered(crmDataIndicator),
          item => groupIndicatorsData(item, crmDataIndicator)
        )
      )
    )
      .map(calcCrmSessions);

    const crmSessions = flatten(crmSessionsByPeriod);

    const crmData = crmSessionsByPeriod
      .map(calcCrmItem)
      .map((item, index) => ({...item, name: monthsIncludingCustom[index]}));

    const calculateAttributionWeights = (sessions, indicator) => getAttributionWeights(sessions, indicator, attributionModel.value, startTS, endTS);

    const generatedImpactData = Object.values(groupBy(getGroupByDataFiltered(generatedImpactIndicator),
      item => groupIndicatorsData(item, generatedImpactIndicator)
    )).map(users => addFilteredSessions(users, startTS, endTS));

    const generatedImpactPerMonth = Array.from({length: generatedImpactData.length}, () => initializeChannelsImpact(groupByMapping));

    generatedImpactData.forEach((month, index) => month.forEach(user => calculateIndicatorImpact(calculateAttributionWeights, generatedImpactIndicator, user, userStore.userMonthPlan, generatedImpactPerMonth[index])));

    const categoryData = generatedImpactPerMonth.map((item, index) => {
      const obj = {};
      item[generatedImpactIndicator] && Object.keys(item[generatedImpactIndicator]).forEach(channel => {
        const category = getChannelMetadata('category', channel) || 'Direct';
        const value = item[generatedImpactIndicator][channel];
        if (value) {
          if (!obj[category]) {
            obj[category] = 0;
          }
          obj[category] += value;
        }
      });
      obj.name = monthsIncludingCustom[index];
      return obj;
    });

    const getFilterOptions = (data, key) => uniq(data.map((item) => item[key]).filter(Boolean));

    const customOptions = [
      getFilterOptions(crmSessions, 'custom1'),
      getFilterOptions(crmSessions, 'custom2')
    ];

    const CRMSourcesOptions = [
      getFilterOptions(crmSessions, 'external_lead_source'),
      getFilterOptions(crmSessions, 'external_lead_source_data1'),
      getFilterOptions(crmSessions, 'external_lead_source_data2')
    ];

    const crmFilterConfigs = [];

    if (customFieldsNicknames.length > 0) {
      crmFilterConfigs.push({
        kind: filterKinds.CUSTOM_FIELDS,
        options: customOptions,
        fieldKey: ['custom1', 'custom2'].slice(0, customFieldsNicknames.length),
        fieldNames: customFieldsNicknames
      });
    }

    if (permissions.CRMLeadSource) {
      crmFilterConfigs.push({
        kind: filterKinds.CRMSource,
        options: CRMSourcesOptions,
        fieldKey: ['external_lead_source', 'external_lead_source_data1', 'external_lead_source_data2'],
        fieldNames: ['CRM lead source', 'CRM lead source details 1', 'CRM lead source details 2']
      });
    }

    return {
      indicatorsData,
      performanceData,
      costPerFunnel,
      categoryData,
      grow,
      impactData,
      crmData,
      totalCost,
      indicatorsOptions,
      crmFilterConfigs
    };
  };

  handleChangeWidgetIndicator = name => event => {
    if (this.state[name] && event.value) {
      this.setState({
        [name]: event.value
      });
    }
  };

  isMarketingChannel = channel =>
    getChannelMetadata('department', channel) === 'marketing';

  render() {
    const {
      data,
      location,
      metricsOptions
    } = this.props;
    const {
      crmDataIndicator,
      crmFilters,
      groupByField,
      historicalPerformanceIndicator,
      marketingVsSalesIndicator,
      generatedImpactIndicator
    } = this.state;

    if (!Object.keys(data).length) {
      return null;
    }

    const months = get(data, `calculatedData.historyData.months`);
    const {
      categoryData,
      costPerFunnel,
      crmData,
      crmFilterConfigs,
      grow,
      impactData,
      performanceData,
      totalCost
    } = this.getData();

    const objectives = get(data, 'historyData.objectives', []);
    const indicators = get(data, 'historyData.indicators');
    const planDate = get(data, 'planDate');
    const flattenHistoryObjectives = flattenObjectives(
      objectives,
      indicators,
      getRawDatesSpecific(planDate, objectives.length, 0),
      [],
      [],
      false
    );

    const channelsImpact = get(
      data,
      'attribution.channelsImpact',
      {}
    );
    const totalPipeline = getTotalImpactByChannel(channelsImpact.pipeline);
    const totalRevenue = getTotalImpactByChannel(channelsImpact.revenue);

    const committedForecasting = get(data, 'calculatedData.committedForecasting');
    const actualIndicators = get(data, 'actualIndicators');

    return (
      <React.Fragment>
        <StatsSquares
          totalCost={totalCost}
          totalPipeline={totalPipeline}
          totalRevenue={totalRevenue}
          costPerFunnel={costPerFunnel}
        />

        <ImpactByIndicator
          impactData={impactData}
          indicator={marketingVsSalesIndicator}
          metricsOptions={metricsOptions}
          onIndicatorChange={this.handleChangeWidgetIndicator('marketingVsSalesIndicator')}

        />

        <ImpactByCRM
          location={location}
          filters={crmFilters}
          onFiltersChange={this.handleCrmFiltersChange}
          crmData={crmData}
          indicator={crmDataIndicator}
          groupBy={groupByField}
          metricsOptions={metricsOptions}
          onIndicatorChange={this.handleChangeWidgetIndicator('crmDataIndicator')}
          onGroupByChange={this.handleChangeWidgetIndicator('groupByField')}
          filterConfigs={crmFilterConfigs}
        />

        <ImpactByMarketing
          categoryData={categoryData}
          indicator={generatedImpactIndicator}
          metricsOptions={metricsOptions}
          onIndicatorChange={this.handleChangeWidgetIndicator('generatedImpactIndicator')}/>

        <div className={classNames(classes.rows, classes.wrap)}>
          <TypedOverviewTable type={'category'}/>
          <TypedOverviewTable type={'channel'}/>
          <TypedOverviewTable type={'campaign'}/>
          <TypedOverviewTable type={'content'}/>

          <HistoricalPerformanceChart
            indicator={historicalPerformanceIndicator}
            grow={grow}
            months={months}
            onIndicatorChange={this.handleChangeWidgetIndicator('historicalPerformanceIndicator')}
            performanceData={performanceData}
          />
          <HistoryOverviewTable
            data={flattenHistoryObjectives}
            committedForecasting={committedForecasting}
            indicators={indicators}
            actualIndicators={actualIndicators}
          />
        </div>
      </React.Fragment>
    );
  }
}

Overview.proTypes = {
  data: PropTypes.shape({}),
  getMetricDataByMapping: PropTypes.func,
  metricsOptions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    value: PropTypes.string
  })),
  timeFrame: PropTypes.shape({
    monthsExceptThisMonth: PropTypes.number,
    startDate: PropTypes.string,
    endDate: PropTypes.string
  })
};

export default enhance(Overview);
