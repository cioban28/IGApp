import {decorate, computed, observable, action} from 'mobx';
import {contentPageConfig} from 'components/utils/filters/configs';
import {
  makeContentChannelBeforeStageFilter,
  makeContentBeforeStageFilter
} from 'components/utils/filters/make';
import {calculateAttributionPages} from 'attribution/pages';
import attributionStore from 'stores/attributionStore';
import userStore from 'stores/userStore';
import FiltersStore from 'stores/filtersStore';
import journeysStore from 'stores/analyze/journeysStore';

class ContentStore {
  filtersData = new FiltersStore(contentPageConfig);
  isContentPages = true;

  setIsContentPages(isContentPages) {
    this.isContentPages = isContentPages;
  }

  get pages() {
    const {usersByEmail, getMetricsData, calculateAttributionWeights} = this.filtersData;
    const {userMonthPlan} = userStore;
    const {attribution: {groupByMapping}} = attributionStore.data;

    return calculateAttributionPages(
      groupByMapping,
      usersByEmail,
      getMetricsData,
      userMonthPlan,
      calculateAttributionWeights,
      this.isContentPages ? undefined : 'contentChannel'
    );
  }

  navigateToJourneys = (funnelStage, page) => {
    const makeFilterFunc = this.isContentPages
      ? makeContentBeforeStageFilter
      : makeContentChannelBeforeStageFilter;

    journeysStore.navigateWithFilters(
      funnelStage,
      [makeFilterFunc(page, funnelStage), ...this.filtersData.serializedFilters]
    );
  }
}

decorate(ContentStore, {
  pages: computed,
  isContentPages: observable,
  setIsContentPages: action.bound,
});

export default new ContentStore();
