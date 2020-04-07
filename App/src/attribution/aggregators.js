import {revenueMapping, influencedMapping, influencedRevenueMapping} from './baseObject';

function calculateLTV(accountMRR, userMonthPlan) {
    // take const churn in case its 0
    const churnRate = userMonthPlan.actualIndicators.churnRate || 0.005;
    return accountMRR / (churnRate / 100);
}

function aggregateAttributionIndicators(object, indicator, weights, index, revenueForAccount, accountMRR, userMonthPlan, influencedWeight = 0) {
    // In case weight is 0, take 0. if it's 0<x<1, then 1
    const ceilInfluencedWeight = Math.ceil(influencedWeight);
    if (!object[indicator]) {
        object[indicator] = 0;
        if (influencedMapping[indicator]) {
            object[influencedMapping[indicator]] = 0;
        }
    }
    object[indicator] += weights[index];
    if (influencedMapping[indicator]) {
        object[influencedMapping[indicator]] += ceilInfluencedWeight;
    }

    if (revenueForAccount && revenueMapping[indicator]) {
        if (!object[revenueMapping[indicator]]) {
            object[revenueMapping[indicator]] = 0;
            object[influencedRevenueMapping[indicator]] = 0;
        }
        object[revenueMapping[indicator]] += Math.round(revenueForAccount * weights[index]);
        object[influencedRevenueMapping[indicator]] += Math.round(revenueForAccount * ceilInfluencedWeight);
    }

    if (accountMRR && indicator === 'users') {
        if (!object.LTV) {
            object.LTV = 0;
            object.influencedLTV = 0;
        }
        const LTV = calculateLTV(accountMRR, userMonthPlan);
        object.LTV += Math.round(LTV * weights[index]);
        object.influencedLTV += Math.round(LTV * ceilInfluencedWeight);
    }
}

function aggregateWeights(array, weights) {
    return array.reduce((total, item, index) => {
        if (!total[item]) {
            total[item] = 0;
        }
        total[item] += weights[index];
        return total;
    }, {});
}

export {
    aggregateAttributionIndicators,
    aggregateWeights
}