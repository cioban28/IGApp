import {decorate, observable, action, computed} from 'mobx';
import history from 'history';
import {GROUP_BY, LABELS, SINGULAR_LABELS} from 'components/utils/users';
import {usersPageConfig} from 'components/utils/filters/configs';
import {makeFunnelStagesFilter} from 'components/utils/filters/make';
import {VARIANTS, makeFilters} from 'components/utils/filters';
import attributionStore from 'stores/attributionStore';
import FiltersStore from 'stores/filtersStore';

class UsersStore {
  constructor() {
    this.filtersData = new FiltersStore(usersPageConfig);
    this.groupBy = GROUP_BY.USERS;
  }

  setGroupBy(groupBy) {
    this.groupBy = groupBy;
  }

  get users() {
    const {usersByEmail, usersByAccount} = this.filtersData;

    return this.groupBy === GROUP_BY.USERS ? usersByEmail : usersByAccount;
  }

  get statsLabel() {
    return this.groupBy === GROUP_BY.USERS
      ? {
        plural: LABELS.USERS,
        singular: SINGULAR_LABELS.USERS
      }
      : {
        plural: LABELS.ACCOUNTS,
        singular: SINGULAR_LABELS.ACCOUNTS
      };
  }

  navigateWithFilters(funnelStage, filters) {
    const {setFilters, filterConfigs} = this.filtersData;
    const {groupByMapping} = attributionStore.data.attribution;

    setFilters(makeFilters(
      [makeFunnelStagesFilter(VARIANTS.BECAME_ONE_OF, [funnelStage]), ...filters],
      filterConfigs
    ));
    this.setGroupBy(groupByMapping[funnelStage] === 'companies' ? GROUP_BY.ACCOUNT : GROUP_BY.USERS)

    history.push({ pathname: '/analyze/journeys' });
  }
}

decorate(UsersStore, {
  users: computed,
  statsLabel: computed,
  groupBy: observable,
  setGroupBy: action.bound,
  navigateWithFilters: action.bound,
});

export default new UsersStore();
