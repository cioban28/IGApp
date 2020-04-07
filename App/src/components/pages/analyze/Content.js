import React from 'react';
import {inject, observer} from 'mobx-react';
import classnames from 'classnames';
import {FeatureToggle} from 'react-feature-toggles';
import AttributionTable from 'components/pages/analyze/AttributionTable';
import Component from 'components/Component';
import StatSquare from 'components/common/StatSquare';
import Tooltip from 'components/controls/Tooltip';
import Toggle from 'components/controls/Toggle';
import FiltersPanel from 'components/pages/users/Filters/FiltersPanel';
import {formatBudgetShortened} from 'components/utils/budget';
import {getChannelIcon} from 'components/utils/filters/channels';
import {getNickname as getChannelNickname} from 'components/utils/channels';
import {getNickname as getIndicatorNickname} from 'components/utils/indicators';
import {compose, newFunnelMapping} from 'components/utils/utils';

import style from 'styles/analyze/analyze.css';

const enhance = compose(
  inject(({
    attributionStore: {attributionModel, data, conversionIndicator},
    analyze: {
      contentStore: {
        isContentPages,
        setIsContentPages,
        pages,
        navigateToJourneys,
        filtersData: {
          filters,
          setFilters,
          filterConfigs,
        },
      },
    },
  }) => ({
    attributionModel,
    data,
    isContentPages,
    setIsContentPages,
    attributionPages: pages,
    filters,
    setFilters,
    filterConfigs,
    navigateToJourneys,
    conversionIndicator,
  })),
  observer
);

class Content extends Component {

  style = style;

  constructor(props) {
    super(props);

    this.state = {
      attributionTableRevenueMetric: 'revenue'
    };
  }

  getPagesData = data => {
    return data.map(item => ({
      channel: item.channel,
      title: item.title,
      revenueMetric: item[this.state.attributionTableRevenueMetric],
      webVisits: item.webVisits,
      conversion: item.conversion,
      funnelIndicator: item[this.props.conversionIndicator],
      readRatio: item.total ? Math.round(item.totalRead / item.total * 100) : 0,
      proceedRatio: item.webVisits ? Math.round(item.proceed / item.webVisits * 100) : 0
    }));
  };

  getAverage = (data, selector) => {
    return data.length
      ? data.reduce((sum, item) => sum + (item[selector] || 0), 0) / data.length
      : 0;
  };

  onRowClick = ({page}, funnelStage) => {
    this.props.navigateToJourneys(funnelStage, page);
  };

  getChannelCell = channel => (
    <div className={this.classes.cellWithIcon}>
      <div className={this.classes.channelIcon} data-icon={getChannelIcon(channel)}/>
      {getChannelNickname(channel)}
    </div>
  );

  getContentChannelTitle = ({channel}) => ({
    text: channel,
    node: this.getChannelCell(channel)
  });

  render() {
    const {
      attributionPages,
      attributionModel,
      data,
      isContentPages,
      setIsContentPages,
      filters,
      setFilters,
      filterConfigs,
      conversionIndicator,
    } = this.props;

    if (!Object.keys(data).length) {
      return null;
    }

    const {
      totalRevenue,
      calculatedData: {
        daily: {
          indicatorsDataPerDay
        },
        objectives: {
          funnelFirstObjective
        },
        historyData: {
          historyDataWithCurrentMonth
        }
      },
      customDateMode
    } = data;

    const getPageItemTitle = ({title, page: url}) => {
      const {data} = this.props;
      const {userAccount: {companyWebsite}} = data;

      return {
        text: title,
        node: (
          <Tooltip tip={title} id="analyze-title-tooltip" component="div">
            {title}
            {url && (
              <a href={companyWebsite + url} target={'_blank'} className={this.classes.tableTitleIcon}/>
            )}
          </Tooltip>
        )
      };
    };

    const actualIndicatorsArray = customDateMode ? indicatorsDataPerDay : historyDataWithCurrentMonth.indicators;
    const objective = funnelFirstObjective;

    const revenue = attributionPages.reduce((sum, item) => sum + item.revenue, 0);
    const impact = attributionPages.reduce((sum, item) => sum + item[newFunnelMapping[objective]], 0) /
      actualIndicatorsArray.reduce((sum, item) => sum + (item[objective] || 0), 0);

    const pagesData = this.getPagesData(attributionPages);
    const avgReadRatio = this.getAverage(pagesData, 'readRatio');
    const avgProceedRatio = this.getAverage(pagesData, 'proceedRatio');

    const objectiveNickName = getIndicatorNickname(objective);

    const outOfTotalRevenue = Math.round((revenue / totalRevenue) * 100);

    return (
      <div>
        <div className={this.classes.filtersPanel}>
          <div className={this.classes.toggle}>
            <Toggle
              options={[
                {
                  text: 'Content',
                  value: true
                },
                {
                  text: 'Content Type',
                  value: false
                }
              ]}
              selectedValue={isContentPages}
              onClick={setIsContentPages}
            />
          </div>
          <FiltersPanel
            filters={filters}
            filterConfigs={filterConfigs}
            onFiltersChange={setFilters}
          />
        </div>
        <div className={classnames(this.classes.stats, this.classes.rows)}>
          <StatSquare
            title='Content-Influenced Revenue'
            stat={`$${formatBudgetShortened(revenue)}`}
            context={isFinite(outOfTotalRevenue) ? {
              stat: `${outOfTotalRevenue}% out of $${formatBudgetShortened(totalRevenue)}`
            } : null}
            containerClassName={this.classes.statSquareContainer}
          />
          <StatSquare
            title={`Impact On ${getIndicatorNickname(objective)}`}
            stat={`${isFinite(impact) ? Math.round(impact * 100) : 0}%`}
            tooltipText={`# of ${objectiveNickName} that have been influenced by content out of the total ${objectiveNickName}.`}
            containerClassName={this.classes.statSquareContainer}
          />
          <StatSquare
            title='Avg. Read Ratio'
            stat={`${Math.round(avgReadRatio)}%`}
            tooltipText='How many out of those who started to read the content piece, actually read/finished it.'
            containerClassName={this.classes.statSquareContainer}
          />
          <StatSquare
            title='Avg. Proceed ratio'
            stat={`${Math.round(avgProceedRatio)}%`}
            tooltipText='How many out of those who saw/read the content piece, moved to another page in the website afterward.'
            containerClassName={this.classes.statSquareContainer}
          />
        </div>
        <FeatureToggle featureName="attribution">
          <AttributionTable
            key={conversionIndicator}
            defaultStageKey={conversionIndicator}
            title='Content Impacts Analysis'
            data={attributionPages}
            showCostColumns={false}
            dataNickname='Content'
            getItemCost={() => ''}
            getItemTitle={isContentPages ? getPageItemTitle : this.getContentChannelTitle}
            attributionModel={attributionModel.label}
            columnsBefore={isContentPages ? [
              {
                id: 'channel',
                header: 'Channel',
                accessor: 'channel',
                cell: this.getChannelCell,
                footer: 'Total',
                sortable: true
              }
            ] : []}
            columnsAfter={[
              {
                id: 'read-ratio',
                header: 'Read Ratio',
                accessor: ({total, totalRead}) =>
                  (total ? Math.round(totalRead / total * 100) : 0),
                cell: (value) => value + '%',
                footer: (data) => `${Math.round(this.getAverage(this.getPagesData(data), 'readRatio'))}%`,
                sortable: true
              },
              {
                id: 'proceed-ratio',
                header: 'Proceed Ratio',
                accessor: ({webVisits, proceed}) =>
                  (webVisits ? Math.round(proceed / webVisits * 100) : 0),
                cell: (value) => value + '%',
                footer: (data) => `${Math.round(this.getAverage(this.getPagesData(data), 'proceedRatio'))}%`,
                sortable: true
              }
            ]}
            onClick={this.onRowClick}
          />
        </FeatureToggle>
      </div>
    );
  }
}

export default enhance(Content);
