import React from 'react';
import Component from 'components/Component';
import SaveButton from 'components/pages/profile/SaveButton';
import style from 'styles/plan/planned-actual-tab.css';
import Paging from 'components/Paging';
import {getChannelsWithProps, isUnknownChannel} from 'components/utils/channels';
import {getCommitedBudgets} from 'components/utils/budget';
import merge from 'lodash/merge';
import {newFunnelMapping} from 'components/utils/utils';
import ChannelsSelect from 'components/common/ChannelsSelect';
import isNil from 'lodash/isNil';
import get from 'lodash/get';
import set from 'lodash/set';
import PlannedVsActualTable from 'components/pages/plan/PlannedVsActualTable';
import PlannedVsActualChart from 'components/pages/plan/PlannedVsActualChart';

export const INDICATORS = ['spending', 'newMCL', 'newMQL', 'newSQL', 'newOpps', 'newUsers'];
export const COLUMNS = {
  planned: {
    label: 'Planned',
    value: 'planned'
  },
  actual: {
    label: 'Actual',
    value: 'actual'
  },
  planVsActual: {
    label: 'Plan vs actual',
    value: 'planVsActual'
  },
  pacingFor: {
    label: 'Pacing for',
    value: 'pacingFor'
  }
};

const channelPlatformMapping = {
  'advertising_socialAds_facebookAdvertising': 'isFacebookAdsAuto',
  'advertising_displayAds_googleAdwords': 'isAdwordsAuto',
  'advertising_searchMarketing_SEM_googleAdwords': 'isAdwordsAuto',
  'advertising_socialAds_youtubeAdvertising': 'isYoutubeAuto',
  'advertising_socialAds_linkedinAdvertising': 'isLinkedinAdsAuto',
  'advertising_socialAds_twitterAdvertising': 'isTwitterAdsAuto',
  'advertising_searchMarketing_SEM_bing': 'isBingAdsAuto',
  'social_quora': 'isQuoraAdsAuto'
};

export default class PlannedVsActual extends Component {

  style = style;

  static defaultProps = {
    planUnknownChannels: [],
    committedBudgets: [],
    knownChannels: {},
    unknownChannels: {},
    hoverRow: void 0,
    month: 0
  };

  constructor(props) {
    super(props);
    this.state = {
      month: this.getCurrentMonthIndex(),
      saveSuccess: false,
      saveFail: false
    };
  }

  getCurrentMonthIndex = () => this.props.calculatedData.lastYearHistoryData.historyDataLength;

  getObjectToUpdate = (currentMonthObject, historyData, historyDataKey) => {
    const isCurrentMonth = this.state.month === this.props.calculatedData.lastYearHistoryData.historyDataLength;
    if (isCurrentMonth) {
      return currentMonthObject;
    }
    else {
      return get(historyData, [historyDataKey, this.state.month]);
    }
  };

  addChannel = (event) => {
    const channel = event.value;
    const actualChannelBudgets = {...this.props.actualChannelBudgets};
    const historyData = {...this.props.historyData};
    const objectToUpdate = this.getObjectToUpdate(actualChannelBudgets, historyData, 'actualChannelBudgets');
    set(objectToUpdate, ['knownChannels', channel], 0);
    this.props.updateState({actualChannelBudgets, historyData});
  };

  addOtherChannel = ({value: channel}) => {
    this.props.addUnknownChannel(channel);

    const actualChannelBudgets = {...this.props.actualChannelBudgets};
    const historyData = {...this.props.historyData};
    const objectToUpdate = this.getObjectToUpdate(actualChannelBudgets, historyData, 'actualChannelBudgets');
    set(objectToUpdate, ['unknownChannels', channel], 0);
    this.props.updateState({actualChannelBudgets, historyData});

  };

  updateActual = (channel, value) => {
    const actualChannelBudgets = {...this.props.actualChannelBudgets};
    const historyData = {...this.props.historyData};

    const objectToUpdate = this.getObjectToUpdate(actualChannelBudgets, historyData, 'actualChannelBudgets');
    if (isUnknownChannel(channel)) {
      set(objectToUpdate, ['unknownChannels', channel], value);
    }
    else {
      set(objectToUpdate, ['knownChannels', channel], value);
    }
    this.props.updateState({actualChannelBudgets, historyData});
  };

  setMonth = (diff) => {
    const maxMonth = this.getCurrentMonthIndex();
    let newMonth = this.state.month + diff;
    if (newMonth < 0) {
      newMonth = 0;
    }
    if (newMonth > maxMonth) {
      newMonth = maxMonth;
    }
    this.setState({month: newMonth});
  };

  updateImpact = (channel, indicator, type, value) => {
    const channelsImpact = {...this.props.channelsImpact};
    const historyData = {...this.props.historyData};

    const objectToUpdate = this.getObjectToUpdate(channelsImpact, historyData, 'channelsImpact');
    set(objectToUpdate, [channel, indicator, type], value);
    this.props.updateState({channelsImpact, historyData});
  };

  parseChannelsPerMonth = () => {
    const {
      calculatedData: {
        integrations,
        lastYearHistoryData: {
          months,
          historyDataWithCurrentMonth: {
            channelsImpact,
            planBudgets,
            unknownChannels: planUnknownChannels,
            actualChannelBudgets,
            attribution
          }
        }
      }
    } = this.props;

    return months.map((monthLabel, month) => {
      const channelsProps = getChannelsWithProps();

      const attributionChannelsImpact = get(attribution, [month, 'channelsImpact'], {});
      const lastMonthAttributionChannelsImpact = get(attribution, [month - 1, 'channelsImpact'], {});

      const {knownChannels = {}, unknownChannels = {}} = actualChannelBudgets[month];
      const actuals = merge({}, knownChannels, unknownChannels);
      const planned = merge({}, getCommitedBudgets(planBudgets)[month], planUnknownChannels[month]);
      const channels = merge({}, planned, actuals);

      const parsedChannels = Object.keys(channels).map(channel => {
        let parsedChannel = {
          channel,
          category: channelsProps[channel].category,
          isAutomatic: integrations[channelPlatformMapping[channel]]
        };

        INDICATORS.forEach(indicator => {
          let columns = {};
          if (indicator === 'spending') {
            columns.planned = planned[channel] || 0;
            const isActualEmpty = isNil(actuals[channel]);
            columns.actual = isActualEmpty ? planned[channel] || 0 : actuals[channel];
            columns.isActualEmpty = isActualEmpty;
          }
          else {
            const channelImpact = get(channelsImpact, [month, channel], {});
            const {
              planned: plannedIndicator = 0,
              actual: actualIndicator = 0
            } = channelImpact[indicator] || {};

            const attributedValue = get(attributionChannelsImpact, [newFunnelMapping[indicator], channel], 0);
            const attributedIndicator = indicator === 'newUsers'
              ? attributedValue
              : Math.round(attributedValue * 100) / 100;

            const lastMonthChannelImpact = get(channelsImpact, [month - 1, channel], {});
            const {actual: lastMonthActual = 0} = lastMonthChannelImpact[newFunnelMapping[indicator]] || {};
            const lastMonthAttributed = get(
              lastMonthAttributionChannelsImpact,
              [newFunnelMapping[indicator], channel],
              0
            );

            columns.planned = plannedIndicator;
            columns.actual = actualIndicator || attributedIndicator;
            columns.lastMonthActual = lastMonthActual || lastMonthAttributed;
          }
          parsedChannel[indicator] = columns;
        });

        return parsedChannel;
      });

      return {channels, parsedChannels};
    });
  };

  render() {
    const {
      updateUserMonthPlan,
      actualChannelBudgets,
      historyData,
      channelsImpact,
      region,
      planDate,
      calculatedData: {
        extarpolateRatio,
        lastYearHistoryData: {
          historyDataLength,
          months
        },
        objectives: {
          funnelFirstObjective
        }
      }
    } = this.props;
    const {month, saveSuccess, saveFail} = this.state;

    const isCurrentMonth = month === historyDataLength;
    const extrapolatedValue = value => Math.round(value / extarpolateRatio);
    const parsedChannelsPerMonth = this.parseChannelsPerMonth();

    return <div>
      <PlannedVsActualChart
        data={parsedChannelsPerMonth}
        months={months}
      />
      <Paging
        title={months[month]}
        onBack={() => this.setMonth(-1)}
        onNext={() => this.setMonth(1)}
      />
      <PlannedVsActualTable
        channels={parsedChannelsPerMonth[month].parsedChannels}
        isCurrentMonth={isCurrentMonth}
        extrapolateValue={extrapolatedValue}
        updateActual={this.updateActual}
        updateImpact={this.updateImpact}
        funnelFirstObjective={funnelFirstObjective}
      />
      <div>
        <div className={this.classes.bottom}>
          <div style={{
            paddingBottom: '25px',
            width: '460px'
          }} className={this.classes.channelsRow}>
            <ChannelsSelect
              className={this.classes.channelsSelect}
              withOtherChannels={true}
              selected={-1}
              isChannelDisabled={channel => Object.keys(parsedChannelsPerMonth[month].channels).includes(channel)}
              onChange={this.addChannel}
              onNewOptionClick={this.addOtherChannel}
              label={`Add a channel`}
              labelQuestion={['']}
              description={['Are there any channels you invested in the last month that weren’t recommended by InfiniGrow? It is perfectly fine; it just needs to be validated so that InfiniGrow will optimize your planning effectively.\nPlease choose only a leaf channel (a channel that has no deeper hierarchy under it). If you can’t find the channel you’re looking for, please choose “other” at the bottom of the list, and write the channel name/description clearly.']}
            />
          </div>
          <div className={this.classes.footer} style={{marginTop: '150px'}}>
            <SaveButton
              onClick={() => {
                this.setState({saveFail: false, saveSuccess: false}, () => {
                  updateUserMonthPlan(
                    {
                      actualChannelBudgets,
                      historyData,
                      channelsImpact
                    },
                    region,
                    planDate
                  ).then(
                    res => this.setState({saveSuccess: true}),
                    err => this.setState({saveFail: true})
                  );
                });
              }}
              success={saveSuccess}
              fail={saveFail}
            />
          </div>
        </div>
      </div>
    </div>;
  }
}
