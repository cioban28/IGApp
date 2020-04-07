import {decorate, computed} from 'mobx';
import {channelsPageConfig} from 'components/utils/filters/configs';
import {makeChannelBeforeStageFilter} from 'components/utils/filters/make';
import {calculateChannelsImpact} from 'attribution/channelsImpact';
import attributionStore from 'stores/attributionStore';
import userStore from 'stores/userStore';
import FiltersStore from 'stores/filtersStore';
import journeysStore from 'stores/analyze/journeysStore';

class ChannelsStore {
  constructor() {
    this.filtersData = new FiltersStore(channelsPageConfig);
  }

  get channelsImpact() {
    const {usersByEmail, getMetricsData, calculateAttributionWeights} = this.filtersData;
    const {userMonthPlan} = userStore;
    const {attribution: {groupByMapping}} = attributionStore.data;

    return calculateChannelsImpact(
      groupByMapping,
      usersByEmail,
      getMetricsData,
      userMonthPlan,
      calculateAttributionWeights
    );
  }

  navigateToJourneys = (funnelStage, channelKey) => {
    journeysStore.navigateWithFilters(
      funnelStage,
      [makeChannelBeforeStageFilter(channelKey, funnelStage), ...this.filtersData.serializedFilters]
    );
  }
}

decorate(ChannelsStore, {
  channelsImpact: computed,
});

export default new ChannelsStore();
