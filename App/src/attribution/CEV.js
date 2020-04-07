import {isNil} from 'lodash';

function calculateAttributionCEV(schema, userMonthPlan, channelsImpact) {
    const attributionCEV = {};
    Object.keys(schema.properties).forEach(function (channel) {
        attributionCEV[channel] = -1;
    });

    var orderedObjectives = userMonthPlan.objectives
        .filter(function (objective) {
            var today = new Date();
            var date = objective && objective.timeFrame ? new Date(objective.timeFrame) : today;
            return date >= today;
        })
        .map(function (objective) {
            return objective.indicator;
        });


    Object.keys(channelsImpact).forEach(indicator => {

        var factor = 1;
        if (orderedObjectives && orderedObjectives.length > 0) {
            var objectiveIndex = orderedObjectives.findIndex(function (objective) {
                return objective === indicator;
            });
            switch (objectiveIndex) {
                case 0:
                    factor = 2;
                    break;
                case 1:
                    factor = 1.5;
                    break;
                case 2:
                    factor = 1.25;
                    break;
                // TODO: verify with Daniel
                default:
                    factor = 0;
                    break;
            }
        }

        Object.keys(channelsImpact[indicator]).forEach(channel => {
            // only system channels, ignore others
            if (!isNil(attributionCEV[channel])) {
                if (attributionCEV[channel] === -1) {
                    attributionCEV[channel] = 0;
                }
                attributionCEV[channel] += factor * channelsImpact[indicator][channel];
            }
        });
    });

    return attributionCEV;
}

export {
    calculateAttributionCEV
}