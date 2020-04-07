import {observable, action, decorate, computed} from 'mobx';
import q from 'q';
import {get} from 'lodash';

import userStore from 'stores/userStore';
import serverCommunication from 'data/serverCommunication';
import {calculatedDataExtender} from 'dataExtenders/calculatedDataExtender';
import {getNickname} from 'components/utils/indicators';
import {mapObjToSelectOptions} from 'components/utils/utils';

import {handleCompressedAttributionResponse, preprocessDataByGroupBy} from 'attribution/responseHandler';
import {calculate} from 'attribution/calculator';
import moment from 'moment';

class AttributionStore {
  attributionModel = {};
  data = {};
  isLoaded = false;
  isLoading = false;
  metricsOptions = [];
  conversionIndicator = 'MCL';
  timeFrame = {
    monthsExceptThisMonth: 0
  };

  calculateAttributionLocally(params, attributionModel) {
    const deferred = q.defer();
    this.isLoading = true;
    serverCommunication.serverRequest('POST', 'attribution/cached', JSON.stringify(params), localStorage.getItem('region'))
      // .then(handleCompressedAttributionResponse)
      // .then(({schema, cachedData, shouldPreprocess}) => {
      .then(res => res.json())
      .then(({schema, cachedData, shouldPreprocess = true}) => {
        if (cachedData.dataByGroupBy.email.length === 0 && cachedData.dataByGroupBy.account_id.length === 0) {
          userStore.userMonthPlan.attribution = AttributionStore.makeDefaultAttribution();
          return userStore.userMonthPlan;
        }
        this.setTimeFrame(params);
        const {startTS, endTS} = this.getStartAndEndTS(params);

        if (shouldPreprocess) {
          const startUnixTS = startTS / 1000;
          const endUnixTS = endTS / 1000;
          cachedData.dataByGroupBy = preprocessDataByGroupBy(cachedData.dataByGroupBy, startUnixTS, endUnixTS, true);
        }
        return calculate(attributionModel, schema, cachedData, userStore.userMonthPlan, startTS, endTS);
      })
      .then((data) => {
        this.setAttributionData(data, params, attributionModel);
        this.isLoading = false;

        // Ugly patch! should be temp, in order to get groupByMapping on other pages
        deferred.resolve(data.attribution.groupByMapping);
      })
      .catch((err) => {
        console.log(err);
        deferred.reject();
      });

    return deferred.promise;
  }

  getStartAndEndTS(timeFrame) {
    const {startDate, endDate, monthsExceptThisMonth} = timeFrame;
    const startTS = Date.parse(startDate) || moment().subtract(monthsExceptThisMonth, 'months').startOf('month').toDate().valueOf();
    const endTS = Date.parse(endDate) || moment().toDate().valueOf();
    return {startTS, endTS};
  }

  get tsRange() {
    return this.getStartAndEndTS(this.timeFrame);
  }

  calculateAttributionOnServer(params, attributionModel) {
    this.isLoading = true;

    const deferred = q.defer();
    serverCommunication
      .serverRequest(
        'POST',
        'attribution',
        JSON.stringify({
          ...params,
          attributionModel: attributionModel
        }),
        localStorage.getItem('region')
      )
      .then(response => {
        if (response.ok) {
          response.json().then(data => {
            this.setAttributionData(data, params, attributionModel);
            this.isLoading = false;
            deferred.resolve();
          });
        }
      })
      .catch(() => {
        deferred.reject();
      });

    return deferred.promise;
  }

  pullAttributionData(params, attributionModel) {
    return this.calculateAttributionLocally(params, attributionModel);
  }

  setAttributionData(data, params, attributionModel) {
    const t0 = performance.now();
    data.planUnknownChannels = data.unknownChannels || [];
    data.userAccount = userStore.userAccount;
    data.attributionDateParams = params;
    data.attributionModel = attributionModel;
    data.customDateMode = params.startDate && params.endDate;
    data.monthsExceptThisMonth = Number(params.monthsExceptThisMonth) || 0;

    this.isLoaded = true;
    this.data = {
      companyWebsite: this.data.companyWebsite,
      ...data,
      ...calculatedDataExtender(data)
    };
    const t1 = performance.now();

    console.log(
      `setAttributionData this.data update (${t1 - t0}) milliseconds.`
    );
  }

  setDefaultAttributionData(data) {
    const t0 = performance.now();
    this.data = data;
    const t1 = performance.now();
    console.log(
      `setDefaultAttributionData this.data update (${t1 - t0}) milliseconds.`
    );
  }

  cleanAttributionData() {
    this.attributionModel = {};
    this.data = {};
    this.isLoaded = false;
    this.metricsOptions = [];
    this.timeFrame = {
      monthsExceptThisMonth: 0
    };
  }

  setAttributionModel(model) {
    this.attributionModel = model;
  }

  setTimeFrame(timeFrame) {
    this.timeFrame = timeFrame;
  }

  setConversionIndicator(conversionIndicator) {
    this.conversionIndicator = conversionIndicator;
  }

  setMetricOptions() {
    const metrics = {
      MCL: getNickname('MCL'),
      MQL: getNickname('MQL'),
      SQL: getNickname('SQL'),
      opps: getNickname('opps'),
      users: getNickname('users')
    };
    this.metricsOptions = mapObjToSelectOptions(metrics);
  }

  getMetricDataByMapping = metric => {
    const {
      attribution: {groupByMapping, usersByEmail, usersByAccount}
    } = this.data;
    const groupBy = get(groupByMapping, metric);

    return groupBy === 'contacts' ? usersByEmail : usersByAccount;
  };

  static makeDefaultAttribution() {
    return {
      channelsImpact: {},
      groupByMapping: {},
      pages: [],
      campaigns: [],
      usersByEmail: [],
      usersByAccount: []
    };
  }
}

decorate(AttributionStore, {
  data: observable.ref,
  isLoaded: observable,
  isLoading: observable,
  timeFrame: observable,
  attributionModel: observable,
  conversionIndicator: observable.ref,
  metricsOptions: observable.ref,

  tsRange: computed,

  calculateAttributionLocally: action.bound,
  cleanAttributionData: action.bound,
  pullAttributionData: action.bound,
  setAttributionData: action.bound,
  setAttributionModel: action.bound,
  setDefaultAttributionData: action.bound,
  setMetricOptions: action.bound,
  setTimeFrame: action.bound,
  setConversionIndicator: action.bound,
});

export default new AttributionStore();
