import {mapValues, mapKeys} from 'lodash';

export const influencedMapping = {
    MCL: 'influencedMCL',
    MQL: 'influencedMQL',
    SQL: 'influencedSQL',
    opps: 'influencedOpps',
    users: 'influencedUsers'
};

export const revenueMapping = {
    users: 'revenue',
    opps: 'pipeline'
};

export const influencedRevenueMapping = {
    users: 'influencedRevenue',
    opps: 'influencedPipeline'
};

const initializeObjectValues = object => mapValues(mapKeys(object, (value) => value), () => 0);
export const initializeBaseObject = () => {
    const influencedMetrics = initializeObjectValues(influencedMapping);
    const influencedRevenueMetrics = initializeObjectValues(influencedRevenueMapping);
    return {
        MCL: 0,
        MQL: 0,
        SQL: 0,
        opps: 0,
        users: 0,
        ...influencedMetrics,
        conversion: 0,
        webVisits: 0,
        revenue: 0,
        pipeline: 0,
        LTV: 0,
        ...influencedRevenueMetrics,
        influencedLTV: 0
    };
};