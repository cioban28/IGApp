import React from 'react';
import Component from 'components/Component';
import PathChart from 'components/pages/dashboard/navigate/PathChart';
import style from 'styles/dashboard/navigate.css';
import {getChannelIcon, getNickname as getChannelNickname} from 'components/utils/channels';
import {set, merge, sum, get, map} from 'lodash';
import {formatBudget, formatBudgetShortened, formatNumber, getCommitedBudgets} from 'components/utils/budget';
import {newFunnelMapping, influencedMapping, efficiencyFormatter, percentageFormatter} from 'components/utils/utils';
import DashboardStatWithContextSmall from 'components/pages/dashboard/navigate/DashboardStatWithContextSmall';
import {getColor} from 'components/utils/colors';
import {
  getIndicatorDisplaySign,
  getIndicatorsWithProps,
  getNickname as getIndicatorNickname
} from 'components/utils/indicators';
import Objective from 'components/pages/dashboard/Objective';
import Funnel from 'components/pages/dashboard/Funnel';
import {precisionFormat} from 'utils';
import {projectObjective} from 'components/utils/objective';

const MAX_CHANNELS_FOR_PERIOD = 5;

export default class Navigate extends Component {

  style = style;

  constructor(props) {
    super(props);
    this.state = {
      currentObjective: 0,
      months: 0
    };
  }

  componentDidMount() {
    this.setState({months: this.props.calculatedData.historyData.historyDataLength});
  }

  formatObjectives = () => {
    const {collapsedObjectives, funnelObjectives} = this.props.calculatedData.objectives;
    return collapsedObjectives
      .filter((obj) => funnelObjectives.includes(obj.indicator))
      .map((obj) => {
        return {
          name: obj.indicator,
          target: obj.target
        };
      });
  };

  renderChannelTooltip = ((channel, objectiveImpact, influencedObjectiveImpact, budgets, objectiveNickname, objectiveNameSingular) => {
    const channelObjectiveImpact = objectiveImpact.find(item => item.key === channel);
    const attributedObjective = channelObjectiveImpact ? channelObjectiveImpact.impact : 0;
    const totalAttributed = sum(objectiveImpact.map(item => item.impact));

    const channelInfluencedObjectiveImpact = influencedObjectiveImpact.find(item => item.key === channel);
    const influencedObjective = channelInfluencedObjectiveImpact ? channelInfluencedObjectiveImpact.impact : 0;
    const totalInfluenced = sum(influencedObjectiveImpact.map(item => item.impact));

    const channelBudgetObject = budgets.find(item => item.key === channel);
    const channelCost = channelBudgetObject ? channelBudgetObject.impact : 0;

    return <div className={this.classes.channelTooltip}>
      <div className={this.classes.channelTooltipHeader}>{getChannelNickname(channel)}</div>
      <div className={this.classes.channelTooltipBody}>
        <div className={this.classes.channelTooltipRow}>
          <div className={this.classes.channelTooltipField}>
            Cost
          </div>
          <div className={this.classes.channelTooltipValue}>
            {formatBudget(channelCost)}
          </div>
        </div>
        <div className={this.classes.channelTooltipRow}>
          <div className={this.classes.channelTooltipField}>
            Touched {objectiveNickname}
          </div>
          <div className={this.classes.channelTooltipValue}>
            {formatNumber(influencedObjective)} ({percentageFormatter(influencedObjective, totalInfluenced)})
          </div>
        </div>
        <div className={this.classes.channelTooltipRow}>
          <div className={this.classes.channelTooltipField}>
            Attributed {objectiveNickname}
          </div>
          <div className={this.classes.channelTooltipValue}>
            {formatNumber(precisionFormat(attributedObjective))} ({percentageFormatter(attributedObjective, totalAttributed)})
          </div>
        </div>
        <div className={this.classes.channelTooltipRow}>
          <div className={this.classes.channelTooltipField}>
            Efficiency
          </div>
          <div className={this.classes.channelTooltipValue}>
            {efficiencyFormatter(Math.round(channelCost / attributedObjective), objectiveNameSingular)}
          </div>
        </div>
      </div>
    </div>;
  });

  renderFutureTooltip = ((channel, impact) => {
    const channelBudgetObject = impact.find(item => item.key === channel);
    const budget = channelBudgetObject ? channelBudgetObject.impact : 0;
    return <div className={this.classes.channelTooltip}>
      <div className={this.classes.channelTooltipHeader}>{getChannelNickname(channel)}</div>
      <div className={this.classes.channelTooltipBody}>
        <div className={this.classes.channelTooltipRow}>
          <div className={this.classes.channelTooltipField}>
            Budget
          </div>
          <div className={this.classes.channelTooltipValue}>
            {formatBudget(budget)}
          </div>
        </div>
      </div>
    </div>;
  });

  handleMonthsChange = (months) => this.setState({months});

  handleObjectiveChange = (shift) => () => {
    const objectivesCount = this.formatObjectives().length;

    this.setState(({currentObjective}) => ({
      currentObjective: (currentObjective + shift + objectivesCount) % objectivesCount
    }));
  };

  render() {
    const {attribution: {channelsImpact}, actualIndicators, historyData: {attribution, indicators, planBudgets: historyPlanBudgets, unknownChannels: historyUnknownChannels}, planBudgets, calculatedData: {monthlyBudget, committedForecasting, objectives: {collapsedObjectives, funnelFirstObjective}, historyData: {historyDataLength}}} = this.props;
    const {currentObjective, months} = this.state;

    const historyChannelsImpact = attribution.map(item => get(item, ['channelsImpact'], {}));

    const parseChannelsImpact = (channelsImpact) => {
      const impact = {};
      let sum = 0;
      channelsImpact.forEach(month => {
        month && Object.keys(month)
          .filter(channel => month[channel])
          .forEach(channel => {
            set(impact, [channel], (impact[channel] || 0) + month[channel]);
            sum += month[channel];
          });
      });
      const channelsArray = Object.keys(impact)
        .filter(channel => channel !== 'direct')
        .map(channel => {
          return {
            key: channel,
            impact: impact[channel],
            score: (impact[channel] / sum) + 1, // from 1 to 2
            icon: getChannelIcon(channel)
          };
        });
      return _.sortBy(channelsArray, item => item.score).reverse();
    };

    const objectives = this.formatObjectives();

    const objectiveKey = objectives[currentObjective].name;
    const mapping = newFunnelMapping[objectiveKey];
    const objectiveNickname = getIndicatorNickname(mapping);
    const objectiveNameSingular = getIndicatorNickname(mapping, true);

    const getHistoryChannelsImpact = key => parseChannelsImpact(historyChannelsImpact.map(month => get(month, [key], {})).slice(0, months));

    const channelsPresent = parseChannelsImpact([get(channelsImpact, [mapping], {})]);
    const channelsPast = getHistoryChannelsImpact(mapping);

    const committedBudgets = getCommitedBudgets(planBudgets);
    const presentBudgets = parseChannelsImpact(committedBudgets.slice(0, 1));
    const channelFuture = parseChannelsImpact(committedBudgets.slice(1, 1 + months));

    const indicatorsProperties = getIndicatorsWithProps();

    const previousMonthUnknownChannels = historyUnknownChannels[historyDataLength - 1];
    const historyCommittedBudgets = getCommitedBudgets(historyPlanBudgets);
    const relevantHistoryBudgets = parseChannelsImpact(historyCommittedBudgets.slice(0, months));

    const previousMonthCommittedBudgets = historyCommittedBudgets[historyDataLength - 1];
    const previousMonthCosts = merge({}, previousMonthCommittedBudgets, previousMonthUnknownChannels);
    const previousMonthBudget = sum(Object.values(previousMonthCosts));

    const previousMonthLTV = get(indicators, [historyDataLength - 1, 'LTV']);
    const previousMonthObjective = get(indicators, [historyDataLength - 1, funnelFirstObjective]);

    return (
      <div className={this.classes.container}>
        <div className={this.classes.wrap}>
          <div style={{margin: '25px 0'}}>
            <div className={this.classes.metricsTitle}>
              This month
            </div>
            <div className={this.classes.metrics}>
              <DashboardStatWithContextSmall value={formatBudgetShortened(monthlyBudget)} name='Budget' sign='$'
                                             stat={previousMonthBudget ? percentageFormatter(monthlyBudget - previousMonthBudget, previousMonthBudget) : null}
                                             isNegative={previousMonthBudget > monthlyBudget}/>
              <DashboardStatWithContextSmall value={formatBudgetShortened(actualIndicators.LTV)} name='LTV' sign='$'
                                             stat={previousMonthLTV ? percentageFormatter(actualIndicators.LTV - previousMonthLTV, previousMonthLTV) : null}
                                             isNegative={previousMonthLTV >= actualIndicators.LTV}/>
              <DashboardStatWithContextSmall
                value={formatNumber(Math.round(actualIndicators.LTV / monthlyBudget * 100))}
                name='ROI'
                sign='%'
                stat={(previousMonthBudget && previousMonthLTV) ? `${formatNumber(Math.round(actualIndicators.LTV / monthlyBudget - previousMonthLTV / previousMonthBudget * 100))}%` : null}
                isNegative={(previousMonthLTV / previousMonthBudget) >= (actualIndicators.LTV / monthlyBudget)}/>
              <DashboardStatWithContextSmall value={formatNumber(actualIndicators[funnelFirstObjective])}
                                             name={getIndicatorNickname(funnelFirstObjective)}
                                             sign={getIndicatorDisplaySign(funnelFirstObjective)}
                                             stat={previousMonthObjective ? percentageFormatter(actualIndicators[funnelFirstObjective] - previousMonthObjective, previousMonthObjective) : null}
                                             isNegative={previousMonthObjective >= actualIndicators[funnelFirstObjective]}/>
            </div>
          </div>
          <div className={this.classes.objectives}>
            <div className={this.classes.objectivesTitle}>
              We are going
            </div>
            <div className={this.classes.objectivesLine}>
              {
                collapsedObjectives.slice(0, 2).map((objective, index) => {
                  const target = objective.target;
                  const project = projectObjective(committedForecasting, objective);

                  return <Objective
                    target={target}
                    value={objective.value}
                    title={indicatorsProperties[objective.indicator].nickname}
                    project={project}
                    key={index}
                    directionDown={!indicatorsProperties[objective.indicator].isDirectionUp}
                    timeFrame={objective.dueDate}
                    color={getColor(index)}
                    indicator={objective.indicator}
                    historyIndicators={map(indicators, objective.indicator)}
                  />;
                })
              }
            </div>
          </div>
          <div className={this.classes.funnel}>
            <div style={{position: 'absolute', top: 0, left: 0}}>
              <Funnel {
                        ...{
                          MCL: actualIndicators.newMCL,
                          MQL: actualIndicators.newMQL,
                          SQL: actualIndicators.newSQL,
                          opps: actualIndicators.newOpps,
                          users: actualIndicators.newUsers
                        }}
                      columnHeight={179}
                      columnWidth={66}
                      titleStyle={{backgroundColor: '#F5F6FB'}}/>
            </div>
          </div>
        </div>
        <PathChart
          data={{
            future: committedForecasting,
            past: indicators
          }}
          channels={{
            future: channelFuture.slice(0, MAX_CHANNELS_FOR_PERIOD),
            past: channelsPast.slice(0, MAX_CHANNELS_FOR_PERIOD),
            present: channelsPresent.slice(0, MAX_CHANNELS_FOR_PERIOD)
          }}
          tooltip={{
            future: (channel) => this.renderFutureTooltip(channel, channelFuture),
            past: (channel) => this.renderChannelTooltip(channel, channelsPast, getHistoryChannelsImpact(influencedMapping[mapping]), relevantHistoryBudgets, objectiveNickname, objectiveNameSingular),
            present: (channel) => this.renderChannelTooltip(channel, channelsPresent, parseChannelsImpact([get(channelsImpact, [influencedMapping[mapping]], {})]), presentBudgets, objectiveNickname, objectiveNameSingular)
          }}
          handleMonthsChange={this.handleMonthsChange}
          handleObjectiveChange={this.handleObjectiveChange}
          objectives={objectives}
          currentObjective={currentObjective}
          months={months}
          maxMonths={historyDataLength}
        />
      </div>
    );
  }
}
