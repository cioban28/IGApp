import {calculateChannelsImpact} from './channelsImpact';
import {calculateAttributionCampaigns} from './campaigns';
import {calculateAttributionCEV} from './CEV';
import {calculateAttributionPages} from './pages';
import {formatUsers} from './users';
import {get} from 'lodash';

export function calculate(model, schema, cachedData, userMonthPlan, startDateTS, endDateTS) {
  const {groupByMapping, dataByGroupBy} = cachedData;

  const enrichedEmailData = formatUsers(dataByGroupBy.email, startDateTS, endDateTS);
  const usersByAccount = formatUsers(dataByGroupBy.account_id, startDateTS, endDateTS);

  const getMetricsData =
    metric => dataByGroupBy[getWarehouseColumnNameFromCRMMapping(groupByMapping[metric])];

  const calculateAttributionWeights = (sessions, indicator) => getAttributionWeights(sessions, indicator, model, startDateTS, endDateTS);

  const channelsImpact = calculateChannelsImpact(groupByMapping, enrichedEmailData, getMetricsData, userMonthPlan, calculateAttributionWeights);

  const attributionCampaigns = calculateAttributionCampaigns(groupByMapping, enrichedEmailData, getMetricsData, userMonthPlan, calculateAttributionWeights);

  const attributionCEV = calculateAttributionCEV(schema, userMonthPlan, channelsImpact);

  const pages = calculateAttributionPages(groupByMapping, enrichedEmailData, getMetricsData, userMonthPlan, calculateAttributionWeights);

  const contentChannels = calculateAttributionPages(groupByMapping, enrichedEmailData, getMetricsData, userMonthPlan, calculateAttributionWeights, 'contentChannel');

  const attribution = {
    channelsImpact: channelsImpact,
    attributionCEV: attributionCEV,
    campaigns: attributionCampaigns,
    usersByEmail: enrichedEmailData,
    usersByAccount,
    groupByMapping: groupByMapping,
    pages: pages,
    contentChannels
  };

  userMonthPlan.attribution = attribution;

  return userMonthPlan;
}

/**
 * @param {any[]} users
 */
function deleteFilterredSessions(users) {
  users.forEach(user => {
    if (user.filterredSessions) {
      delete user.filterredSessions;
    }
  });
}

export function getWarehouseColumnNameFromCRMMapping(mapping) {
  return mapping === 'contacts' ? 'email' : 'account_id';
}

export function getAttributionWeights(channels, indicator, model, startDateTS, endDateTS) {
  const weights = channels.map((channel) => {
    const {weightMoment, weights} = channel;
    const weight = get(weights, [model, indicator], 0);

    return ((startDateTS ? weightMoment < startDateTS : false) || (endDateTS ? weightMoment > endDateTS : false)) ? 0 : weight;
  });

  return weights;
}
