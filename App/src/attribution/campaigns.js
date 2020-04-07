import {initializeBaseObject} from './baseObject';
import {aggregateAttributionIndicators, aggregateWeights} from './aggregators';

function calculateAttributionCampaigns(mapping, dataByUser, getMetricsData, userMonthPlan, calculateAttributionWeights) {
    const initializeCampaign = () => {
        const baseObject = initializeBaseObject();
        return {
            ...baseObject,
            channels: []
        };
    };

    const attributionCampaigns = {};

    dataByUser.forEach(user => {

        user.sessions.forEach(session => {
            if (session.campaign) {

                // Initialize
                if (!attributionCampaigns[session.campaign]) {
                    attributionCampaigns[session.campaign] = initializeCampaign();
                }

                // Web visits
                attributionCampaigns[session.campaign].webVisits += 1;
            }
        });
    });

    Object.keys(mapping).forEach(indicator => {

        const data = getMetricsData(indicator);
        data.forEach(user => {

            const relevantSessions = user.filterredSessions[indicator] || [];

            // Weights
            const weights = calculateAttributionWeights(relevantSessions, indicator);
            const aggregatedWeights = aggregateWeights(relevantSessions.map(session => session.campaign), weights);

            relevantSessions.forEach(function (session, index) {
                const channel = session.channel;
                const campaign = session.campaign;

                if (campaign) {

                    // Initialize
                    if (!attributionCampaigns[campaign]) {
                        attributionCampaigns[campaign] = initializeCampaign();
                    }

                    const {revenueForAccount, accountMRR} = user;

                    const aggregatedWeight = aggregatedWeights[campaign];
                    delete aggregatedWeights[campaign];

                    aggregateAttributionIndicators(attributionCampaigns[campaign], indicator, weights, index, revenueForAccount, accountMRR, userMonthPlan, aggregatedWeight);

                    if (!attributionCampaigns[campaign].channels.includes(channel) && channel !== 'direct') {
                        attributionCampaigns[campaign].channels.push(channel);
                    }
                }
            });
        });
    });
    return Object.keys(attributionCampaigns).map(campaignName => {
        return {
            name: campaignName,
            ...attributionCampaigns[campaignName]
        };
    });
}

export {
    calculateAttributionCampaigns
}