import {decorate, observable, action, computed} from 'mobx';
import {get} from 'lodash';

import {getAttributionWeights} from 'attribution/calculator';
import {filter} from 'components/utils/users';
import {getFilterOptions} from 'components/utils/filters/configs';
import {filterKinds} from 'components/utils/filters';
import attributionStore from 'stores/attributionStore';

class FiltersStore {
  constructor(dynamicFilterConfigs) {
    this.filters = [];
    this.searchQuery = '';
    this.dynamicFilterConfigs = dynamicFilterConfigs;
  }

  setFilters(filters) {
    this.filters = filters;
  }

  setSearchQuery(searchQuery) {
    this.searchQuery = searchQuery;
  }

  get serializedFilters() {
    return this.filters.map(({config, data}) => ({data, kind: config.kind}))
  }

  get customFieldsConfig() {
    const { CRMConfig } = attributionStore.data;
    const customFieldNames = (CRMConfig && CRMConfig.customFieldsNicknames) || [];

    if (customFieldNames.length === 0) {
      return;
    }

    return {
      kind: filterKinds.CUSTOM_FIELDS,
      options: [getFilterOptions(this.usersByEmail, 'uniqCustom1'), getFilterOptions(this.usersByEmail, 'uniqCustom2')],
      fieldKey: ['uniqCustom1', 'uniqCustom2'].slice(0, customFieldNames.length),
      fieldNames: customFieldNames
    }
  }

  get filterConfigs() {
    const permissions = get(
      attributionStore,
      'data.userAccount',
    );

    return this.dynamicFilterConfigs.map(({
      getOptions = (users) => getFilterOptions(users, config.fieldKey),
      ...config,
    }) => {
      if (config.kind === filterKinds.CUSTOM_FIELDS) {
        return this.customFieldsConfig;
      }

      if (config.kind === filterKinds.CRMSource && !permissions.CRMLeadSource) {
        return;
      }

      return {
        ...config,
        options: getOptions(this.usersByEmail),
      }
    }).filter(Boolean);
  }

  get usersByEmail() {
    return filter(
      attributionStore.data.attribution.usersByEmail,
      this.filters,
      this.searchQuery
    );
  };

  get usersByAccount() {
    return filter(
      attributionStore.data.attribution.usersByAccount,
      this.filters,
      this.searchQuery
    );
  };

  getMetricsData = (metric) =>
    attributionStore.data.attribution.groupByMapping[metric] === 'contacts'
      ? this.usersByEmail
      : this.usersByAccount;

  calculateAttributionWeights = (sessions, indicator) => {
    const {startTS, endTS} = attributionStore.tsRange;

    return getAttributionWeights(sessions, indicator, attributionStore.data.attributionModel, startTS, endTS);
  }
}

decorate(FiltersStore, {
  usersByEmail: computed,
  usersByAccount: computed,
  filters: observable.ref,
  filterConfigs: computed,
  customFieldsConfig: computed,
  setFilters: action.bound,
  searchQuery: observable.ref,
  setSearchQuery: action.bound,
});

export default FiltersStore
