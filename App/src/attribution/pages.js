import {initializeBaseObject} from './baseObject';
import {aggregateAttributionIndicators, aggregateWeights} from './aggregators';
import {union, isNil} from 'lodash';
import moment from 'moment';

function calculateAttributionPages(mapping, dataByUser, getMetricsData, userMonthPlan, calculateAttributionWeights, key = 'path') {

  const initializePage = (contentChannel, title) => {
    const baseObject = initializeBaseObject();
    return {
      ...baseObject,
      title: title,
      totalRead: 0,
      total: 0,
      proceed: 0,
      channel: contentChannel
    };
  };

  const pages = {};
  dataByUser.forEach(user => {

    const userPages = union(...user.sessions
      .map(session => session.pages.filter(page => !isNil(page.contentChannel))));

    userPages.forEach((page, index) => {

      const pageKey = page[key];

      // Initialize
      if (!pages[pageKey]) {
        pages[pageKey] = initializePage(page.contentChannel, page.title);
      }

      // Web visits
      pages[pageKey].webVisits++;

      // is last?
      if (index !== userPages.length - 1) {

        const readTime = moment.duration(moment(page.endTime).diff(page.startTime)).asSeconds();
        if (readTime && readTime >= 90) {
          pages[pageKey].totalRead++;
        }

        pages[pageKey].total++;
        pages[pageKey].proceed++;
      }
    });
  });

  Object.keys(mapping).forEach(indicator => {

    const data = getMetricsData(indicator);
    data.forEach(user => {

      const userPagesForFunnel = union(...(user.filterredSessions[indicator] || [])
        .map(session => session.pages.filter(page => !isNil(page.contentChannel))));

      // Weights
      const weights = calculateAttributionWeights(userPagesForFunnel, indicator);
      const aggregatedWeights = aggregateWeights(userPagesForFunnel.map(page => page[key]), weights);

      userPagesForFunnel.forEach((page, index) => {

        const pageKey = page[key];
        if (!pages[pageKey]) {
          pages[pageKey] = initializePage(page.contentChannel, page.title);
        }
        const {revenueForAccount, accountMRR} = user;

        const aggregatedWeight = aggregatedWeights[pageKey];
        delete aggregatedWeights[pageKey];

        aggregateAttributionIndicators(pages[pageKey], indicator, weights, index, revenueForAccount, accountMRR, userMonthPlan, aggregatedWeight);

      });
    });
  });
  return Object.keys(pages).map(function (page) {
    return {
      ...pages[page],
      page: page
    };
  });
}

export {
  calculateAttributionPages
};