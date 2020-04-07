import {aggregateAttributionIndicators, aggregateWeights} from './aggregators';
import {influencedMapping} from './baseObject';

function initializeChannelsImpact(mapping) {
  // Initialize funnel channelsImpact
  const channelImpactForIndicators = {};
  Object.keys(mapping).forEach(function (funnelIndicator) {
    channelImpactForIndicators[funnelIndicator] = {};
    if (influencedMapping[funnelIndicator]) {
      channelImpactForIndicators[influencedMapping[funnelIndicator]] = {};
    }
  });

  const channelsImpact = {
    conversion: {},
    webVisits: {},
    revenue: {},
    pipeline: {},
    LTV: {},
    influencedRevenue: {},
    influencedPipeline: {},
    influencedLTV: {},
    ...channelImpactForIndicators
  };

  return channelsImpact;
}

function calculateIndicatorImpact(calculateAttributionWeights, indicator, user, userMonthPlan, channelsImpact) {
  const relevantSessions = user.filterredSessions[indicator] || [];
  // Weights
  const weights = calculateAttributionWeights(relevantSessions, indicator);
  const aggregatedWeights = aggregateWeights(relevantSessions.map(session => session.channel), weights);

  relevantSessions.forEach(function (session, index) {
    const object = {};
    const channel = session.channel;
    const {revenueForAccount, accountMRR} = user;

    const aggregatedWeight = aggregatedWeights[channel];
    delete aggregatedWeights[channel];

    aggregateAttributionIndicators(object, indicator, weights, index, revenueForAccount, accountMRR, userMonthPlan, aggregatedWeight);
    Object.keys(object).forEach(indicator => {
      if (!channelsImpact[indicator][channel]) {
        channelsImpact[indicator][channel] = 0;
      }
      channelsImpact[indicator][channel] += object[indicator];
    });

  });

  return channelsImpact;
}

function calculateChannelsImpact(mapping, dataByContact, getMetricsData, userMonthPlan, calculateAttributionWeights) {
  const channelsImpact = initializeChannelsImpact(mapping);

  dataByContact.forEach(user => {

    user.sessions.forEach(session => {
      const channel = session.channel;

      // Web visits
      if (!channelsImpact.webVisits[channel]) {
        channelsImpact.webVisits[channel] = 0;
      }
      channelsImpact.webVisits[channel] += 1;
    });
  });


  Object.keys(mapping).forEach(indicator => {
    const data = getMetricsData(indicator);

    data.forEach(user => {
      calculateIndicatorImpact(calculateAttributionWeights, indicator, user, userMonthPlan, channelsImpact);
    });

  });

  return channelsImpact;
}

export {
  initializeChannelsImpact,
  calculateChannelsImpact,
  calculateIndicatorImpact
};