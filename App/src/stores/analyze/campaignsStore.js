import {decorate, computed} from 'mobx';
import {campaignsPageConfig} from 'components/utils/filters/configs';
import {makeCampaignBeforeStageFilter} from 'components/utils/filters/make';
import {calculateAttributionCampaigns} from 'attribution/campaigns';
import attributionStore from 'stores/attributionStore';
import userStore from 'stores/userStore';
import FiltersStore from 'stores/filtersStore';
import journeysStore from 'stores/analyze/journeysStore';

class CampaignsStore {
  constructor() {
    this.filtersData = new FiltersStore(campaignsPageConfig);
  }

  get campaigns() {
    const {usersByEmail, getMetricsData, calculateAttributionWeights} = this.filtersData;
    const {userMonthPlan} = userStore;
    const {attribution: {groupByMapping}} = attributionStore.data;

    return calculateAttributionCampaigns(
      groupByMapping,
      usersByEmail,
      getMetricsData,
      userMonthPlan,
      calculateAttributionWeights
    );
  }

  navigateToJourneys = (funnelStage, campaignName) => {
    journeysStore.navigateWithFilters(
      funnelStage,
      [makeCampaignBeforeStageFilter(campaignName, funnelStage), ...this.filtersData.serializedFilters]
    );
  }
}

decorate(CampaignsStore, {
  campaigns: computed,
});

export default new CampaignsStore();
