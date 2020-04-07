import merge from 'lodash/merge';
import moment from 'moment';
import {timeFrameToDate} from 'components/utils/objective';
import {getExtarpolateRatio} from 'components/utils/utils';
import sumBy from 'lodash/sumBy';
import flatten from 'lodash/flatten';
import {flattenObjectives} from 'components/utils/objective';
import {getRawDatesSpecific, getStartOfMonthTimestamp, NUMBER_OF_FUTURE_MONTHS} from 'components/utils/date';
import {getAnnualBudgetLeftToPlan, getCommitedBudgets, getPlanBudgetsData} from 'components/utils/budget';
import {getDatesSpecific} from 'components/utils/date';
import isNil from 'lodash/isNil';
import sum from 'lodash/sum';
import isArray from 'lodash/isArray';
import round from 'lodash/round';
import groupBy from 'lodash/groupBy';
import entries from 'lodash/entries';
import mergeWith from 'lodash/mergeWith';

export function calculatedDataExtender(data) {
  const committedBudgets = getCommitedBudgets(data.planBudgets);
  const committedForecasting = data.forecastedIndicators.map(month => {
    const newMonth = {};
    Object.keys(month).forEach(indicator => newMonth[indicator] = month[indicator].committed);
    return newMonth;
  });

  const campaignsWithIndex = data.campaigns.map((campaign, index) => {
    return {...campaign, index: index};
  });
  const activeCampaigns = campaignsWithIndex.filter(campaign => campaign.isArchived !== true);
  const allBudgets = merge([], committedBudgets, data.planUnknownChannels);
  const currentMonthChannels = allBudgets[0];
  const monthlyBudget = sum(Object.values(currentMonthChannels));
  const monthlyExtarpolatedMoneySpent = calculateActualSpent(committedBudgets[0],
    data.planUnknownChannels[0],
    data.knownChannels,
    data.unknownChannels,
    data.planDate);
  const extarpolateRatio = getExtarpolateRatio(new Date(), data.planDate);

  const dates = getRawDatesSpecific(data.planDate, 0, NUMBER_OF_FUTURE_MONTHS);
  const pastDates = getRawDatesSpecific(data.planDate, data.historyData.indicators.length, 0);
  const pastIndicators = data.historyData.indicators;

  const objectivesData = flattenObjectives(data.objectives,
    data.actualIndicators,
    dates,
    pastIndicators,
    pastDates,
    false);
  const collapsedObjectives = flattenObjectives(data.objectives,
    data.actualIndicators,
    dates,
    pastIndicators,
    pastDates,
    true);

  const funnelPossibleObjectives = ['newMCL', 'newMQL', 'newSQL', 'newOpps', 'newUsers'];
  const prioritizedFunnelObjectives = ['newSQL', 'newOpps', 'newUsers', 'newMQL', 'newMCL'];

  const findFirstNonZeroIndicator = collection => {
    return collection.find(funnelObjective =>
      data.actualIndicators && data.actualIndicators[funnelObjective] > 0);
  };

  const nonZeroFunnelIndicator = findFirstNonZeroIndicator(prioritizedFunnelObjectives) ||
    prioritizedFunnelObjectives[0];
  const funnelObjectives = collapsedObjectives
    .filter(objective => funnelPossibleObjectives.includes(objective.indicator))
    .map(objective => objective.indicator);
  const nonZeroFunnelObjective = findFirstNonZeroIndicator(funnelObjectives);
  const isTrial = new Date() < new Date(data.userAccount.trialEnd);
  const isAccountEnabled = isTrial || data.userAccount.isPaid;
  const annualBudget = getAnnualBudgetFromAppData(data);

  return {
    calculatedData: {
      daily: calcDailyData(data),
      campaignsWithIndex: campaignsWithIndex,
      committedBudgets: committedBudgets,
      committedForecasting: committedForecasting,
      activeCampaigns: activeCampaigns,
      annualBudget: annualBudget,
      annualBudgetLeftToPlan: getAnnualBudgetLeftToPlan(annualBudget, data.planBudgets, data.planUnknownChannels),
      currentMonthChannels,
      monthlyBudget: monthlyBudget,
      monthlyExtarpolatedMoneySpent: monthlyExtarpolatedMoneySpent,
      monthlyExtapolatedTotalSpending: monthlyExtarpolatedMoneySpent / extarpolateRatio,
      extarpolateRatio: extarpolateRatio,
      monthlyBudgetLeftToInvest: activeCampaigns.reduce((res, campaign) => {
        if (!campaign.isArchived) {
          if (campaign.isOneTime) {
            if (campaign.dueDate && timeFrameToDate(campaign.dueDate).getMonth() === new Date().getMonth()) {
              res -= campaign.actualSpent || campaign.budget || 0;
            }
          }
          else {
            if (!campaign.dueDate || (campaign.dueDate && new Date() <= timeFrameToDate(campaign.dueDate))) {
              res -= campaign.actualSpent || campaign.budget || 0;
            }
          }
        }
        return res;
      }, monthlyBudget),
      objectives: {
        objectivesData: objectivesData,
        collapsedObjectives: collapsedObjectives,
        firstObjective: collapsedObjectives && collapsedObjectives.length > 0 ? collapsedObjectives[0].indicator : null,
        funnelObjectives: funnelObjectives,
        funnelFirstObjective: nonZeroFunnelObjective || nonZeroFunnelIndicator
      },
      historyData: calculateHistoryData(data, data.historyData, data.monthsExceptThisMonth),
      lastYearHistoryData: calculateHistoryData(data, data.historyData, NUMBER_OF_FUTURE_MONTHS),
      isTrial,
      isAccountEnabled,
      integrations: calculateAutomaticIntegration(data)
    },
    ...data
  };
}

const sumFields = (objects) => mergeWith({}, ...objects, (valA = 0, valB = 0) => valA + valB);

function calcDailyData(data) {
  const budgetsDaily = flatten([...data.historyData.actualChannelBudgetsDaily, data.actualChannelBudgetsDaily]);
  const indicatorsDaily = flatten([...data.historyData.actualIndicatorsDaily, data.actualIndicatorsDaily]);
  const endDate = (data.attributionDateParams && data.attributionDateParams.endDate) || Date.now();
  const startDate = (data.attributionDateParams && data.attributionDateParams.startDate) || 0;
  const endOfCurrentMonth = moment().endOf('month');
  const endDateMoment = moment(new Date(endDate)).endOf('day');
  const startDateMoment = moment(new Date(startDate)).subtract(1, 'days').endOf('day');
  const daysCount = endDateMoment.diff(startDateMoment, 'days');
  const shift = endOfCurrentMonth.diff(endDateMoment, 'days');
  const endIndex = shift < indicatorsDaily.length ? indicatorsDaily.length - shift : 0;
  const startIndex = endIndex > daysCount ? endIndex - daysCount : 0;
  const indicators = indicatorsDaily.slice(startIndex, endIndex);
  const budgets = budgetsDaily.map(({knownChannels}) => knownChannels || {})
    .slice(startIndex, endIndex);

  const rawIndicatorsDataPerDay = indicators.map((day, index) => {
    const budget = budgets[index] || {};
    const date = moment(new Date(endDate)).subtract(indicators.length - index - 1, 'days');

    return {
      ...day,
      ...budget,
      total: round(sumBy(Object.keys(budget), (channelKey) => budget[channelKey]), 2),
      date: date.valueOf(),
      month: getStartOfMonthTimestamp(date.toDate()),
      name: date.format('D MMM')
    };
  });

  const indicatorsDataPerDay = rawIndicatorsDataPerDay.map(({date, month, ...item}) => item);

  const grouppedByMonth = groupBy(rawIndicatorsDataPerDay, 'month');
  const monthEntries = entries(grouppedByMonth);

  const indicatorsDataPerMonth = monthEntries
    .map(([, days]) => days.map(({date, month, name, ...day}) => day))
    .map(sumFields)
    .map((month, index) => ({
      ...month,
      name: moment(new Date(+monthEntries[index][0])).format('MMM YY')
    }));

  const sumActualBudgetsDaily = sumFields(budgets);

  return {
    indicatorsDataPerDay,
    indicatorsDataPerMonth,
    sumActualBudgets: sumActualBudgetsDaily,
    total: round(sumBy(indicatorsDataPerDay, (data) => data.total), 2)
  };
}

export function getAnnualBudgetFromAppData(data) {
  return !isNil(data.annualBudget) ? data.annualBudget : sum(data.annualBudgetArray);
}

function calculateHistoryData(currentData, historyData, monthExceptThisMonth = 0) {
  const historyDataLength = (data) => data.indicators.length;

  const historyDataWithCurrentMonth = {};
  Object.keys(historyData).forEach(key => {
    const sliceNumber = Math.max(historyDataLength(historyData) - monthExceptThisMonth, 0);
    // Indicators key in current month is ActualIndicators, that's why is has special treatment
    // TODO: generalize
    if (key === 'indicators') {
      historyDataWithCurrentMonth[key] = [...historyData[key], currentData.actualIndicators].slice(sliceNumber);
    }
    else if (key === 'actualIndicatorsDaily') {
      historyDataWithCurrentMonth[key] = [...historyData[key], currentData[key]].slice(sliceNumber);
    }
    else if (key === 'unknownChannels') {
      historyDataWithCurrentMonth[key] = [...historyData[key], currentData.planUnknownChannels[0]].slice(sliceNumber);
    }
    else {
      isArray(currentData[key]) ?
        historyDataWithCurrentMonth[key] = [...historyData[key], currentData[key][0]].slice(sliceNumber)
        :
        historyDataWithCurrentMonth[key] = [...historyData[key], currentData[key]].slice(sliceNumber);
    }
  });

  const months = getDatesSpecific(currentData.planDate, historyDataLength(historyDataWithCurrentMonth) - 1, 1);

  const {committedBudgets, sumBudgets, totalCost} = getPlanBudgetsData(historyDataWithCurrentMonth.planBudgets, historyDataWithCurrentMonth.unknownChannels);

  const actualBudgets = merge([], committedBudgets, historyDataWithCurrentMonth.actualChannelBudgets.map(item => item.knownChannels || {}), historyDataWithCurrentMonth.actualChannelBudgets.map(item => item.unknownChannels || {}));
  const sumActualBudgets = {};
  actualBudgets.forEach(month => {
    Object.keys(month).forEach(channel => {
      if (!sumActualBudgets[channel]) {
        sumActualBudgets[channel] = 0;
      }
      sumActualBudgets[channel] += month[channel];
    });
  });

  const indicatorsDataPerMonth = months.map((month, monthIndex) => {
    return {
      name: months[monthIndex],
      ...historyDataWithCurrentMonth.indicators[monthIndex],
      ...actualBudgets[monthIndex],
      total: sumBy(Object.keys(actualBudgets[monthIndex]), (channelKey) => actualBudgets[monthIndex][channelKey])
    };
  });

  const rawMonths = getRawDatesSpecific(currentData.planDate, historyDataLength(historyData), 0);

  return {
    historyDataWithCurrentMonth,
    months,
    rawMonths,
    committedBudgets,
    sumBudgets,
    totalCost,
    actualBudgets,
    sumActualBudgets,
    indicatorsDataPerMonth,
    historyDataLength: historyDataLength(historyData)
  };
}

function calculateActualSpent(committedBudgets, planUnknownChannels, knownChannels, unknownChannels, planDate) {

  const extarpolateRatio = getExtarpolateRatio(new Date(), planDate);
  const approvedExtarpolate = {...committedBudgets};
  const planUnknownExtarpolate = {...planUnknownChannels};
  Object.keys(approvedExtarpolate).map((key) => {
    approvedExtarpolate[key] *= extarpolateRatio;
  });
  Object.keys(planUnknownExtarpolate).map((key) => {
    planUnknownExtarpolate[key] *= extarpolateRatio;
  });

  if (knownChannels) {
    Object.keys(knownChannels).forEach((key) => approvedExtarpolate[key] = knownChannels[key]);
  }

  if (unknownChannels) {
    Object.keys(unknownChannels).forEach((key) => planUnknownExtarpolate[key] = unknownChannels[key]);
  }

  return sumBy(Object.keys(approvedExtarpolate), (key) => approvedExtarpolate[key]) +
    sumBy(Object.keys(planUnknownExtarpolate), (key) => planUnknownExtarpolate[key]);
}

function calculateAutomaticIntegration(data) {
  const isTwitterAdsAuto = !!(data.twitteradsapi &&
    data.twitteradsapi.oauthAccessToken &&
    data.twitteradsapi.oauthAccessTokenSecret &&
    data.twitteradsapi.accountId);
  const isLinkedinAdsAuto = !!(data.linkedinadsapi && data.linkedinadsapi.tokens && data.linkedinadsapi.accountId);
  const isQouraAdsAuto = !!(data.quoraadsapi && data.quoraadsapi.tokens && data.quoraadsapi.accountId);
  const isBingAdsAuto = !!(data.bingadsapi && data.bingadsapi.tokens && data.bingadsapi.accountId);
  const isFacebookAdsAuto = !!(data.facebookadsapi && data.facebookadsapi.accountId && data.facebookadsapi.token);
  const isAdwordsAuto = !!(data.googleadsapi && data.googleadsapi.tokens && data.googleadsapi.customerId);
  const isSalesforceCampaignsAuto = !!(data.salesforceapi &&
    data.salesforceapi.tokens &&
    data.salesforceapi.campaignsMapping);
  const isSalesforceAuto = !!(data.salesforceapi && data.salesforceapi.tokens && data.salesforceapi.mapping);
  const isMozAuto = !!(data.mozapi && data.mozapi.url);
  const isHubspotAuto = !!(data.hubspotapi && data.hubspotapi.mapping && data.hubspotapi.tokens);
  const isGoogleAuto = !!(data.googleapi && data.googleapi.tokens && data.googleapi.profileId);
  const isLinkedinAuto = !!(data.linkedinapi && data.linkedinapi.accountId && data.linkedinapi.tokens);
  const isFacebookAuto = !!(data.facebookapi && data.facebookapi.pageId);
  const isTwitterAuto = !!(data.twitterapi && data.twitterapi.accountName);
  const isYoutubeAuto = !!(data.youtubeapi && data.youtubeapi.type && data.youtubeapi.id);
  const isStripeAuto = !!(data.stripeapi && data.stripeapi.tokens);
  const isGoogleSheetsAuto = !!(data.googlesheetsapi && data.googlesheetsapi.tokens && data.googlesheetsapi.mapping);

  return {
    isTwitterAdsAuto,
    isLinkedinAdsAuto,
    isQouraAdsAuto,
    isFacebookAdsAuto,
    isBingAdsAuto,
    isAdwordsAuto,
    isSalesforceCampaignsAuto,
    isSalesforceAuto,
    isMozAuto,
    isHubspotAuto,
    isGoogleAuto,
    isLinkedinAuto,
    isFacebookAuto,
    isTwitterAuto,
    isYoutubeAuto,
    isStripeAuto,
    isGoogleSheetsAuto
  };
}
