import {getEndOfMonthDate} from 'components/utils/date';
import {getMetadata, isRefreshed} from 'components/utils/indicators';
import {concat, findIndex, get, isArray, isNaN, isNumber, last, map, sum, sumBy} from 'lodash';
import moment from 'moment';

export function timeFrameToDate(timeFrame) {
  /*
   const formattedDateArray = timeFrame.split('-').reverse();
   formattedDateArray.push(formattedDateArray.shift());
   const formattedDate = formattedDateArray.reverse().join('-');
   */
  const formattedDateArray = timeFrame.split('-');
  formattedDateArray.splice(0, 0, formattedDateArray.splice(2, 1)[0]);
  const formattedDate = formattedDateArray.join('-');
  return new Date(formattedDate);
}

function sumIndicator(indicator, forecasting, startIndex, toIndex) {
  return sumBy(forecasting.slice(startIndex, toIndex + 1), month => get(month, indicator, 0));
}

export function projectObjective(forecasting, objectiveData, monthIndex = objectiveData.monthIndex) {
  if (isRefreshed(objectiveData.indicator)) {
    return objectiveData.valueBeforeCurrentMonth + sumIndicator(objectiveData.indicator, forecasting, 0, monthIndex);
  }
  else {
    return forecasting[monthIndex] &&
      forecasting[monthIndex][objectiveData.indicator];
  }
}

export function flattenObjectives(objectives,
                                  actualIndicators,
                                  dates,
                                  historyIndicators,
                                  historyDates,
                                  removeDuplicates = false) {

  const datesWithHistory = concat(historyDates, dates);

  const getObjectiveData = (indicator, objective, monthIndex) => {
    let objectiveValue;
    // in the case that objectives comes from historyData
    // indicators is an array and needs special treatment
    const normalizedActualIndicators = (
      Array.isArray(actualIndicators)
        ? actualIndicators[monthIndex][indicator]
        : actualIndicators[indicator]
    ) || 0;

    if (isRefreshed(indicator)) {
      const objectiveDate = new Date(objective.userInput.startDate);
      const startMonthIndex = datesWithHistory.findIndex(
        date => date.getMonth() === objectiveDate.getMonth() && date.getFullYear() === objectiveDate.getFullYear());
      const valueBeforeCurrentMonth = sumIndicator(indicator, historyIndicators, startMonthIndex, monthIndex + historyDates.length);
      objectiveValue = normalizedActualIndicators + valueBeforeCurrentMonth;
    }
    else {
      objectiveValue = normalizedActualIndicators;
    }

    return {
      monthIndex: monthIndex,
      dueDate: getEndOfMonthDate(dates[monthIndex]),
      indicator: indicator,
      value: objectiveValue,
      target: objective.target.value,
      priority: objective.target.priority,
      ...objective.userInput
    };
  };

  let objectivesData = objectives.map((month, index) => {
    const monthData = {};
    month && Object.keys(month).forEach(objectiveKey => {
      monthData[objectiveKey] = getObjectiveData(objectiveKey, month[objectiveKey], index);
    });

    return monthData;
  });

  if (removeDuplicates) {
    const withoutDuplicates = {};
    objectivesData.forEach((month) => {
      Object.keys(month).forEach((key) => {
        if (!withoutDuplicates[key]) {
          withoutDuplicates[key] = month[key];
        }
      });
    });

    objectivesData = Object.keys(withoutDuplicates).map(objectiveKey => withoutDuplicates[objectiveKey]);
  }
  else {
    objectivesData = [].concat(...objectivesData.map(monthData =>
      Object.keys(monthData).map(objectiveKey => monthData[objectiveKey])));
  }

  return objectivesData;
}

export const historyDataExtractor = (recurrentArray, historyIndicators) => {
  if (!isArray(recurrentArray) || !isArray(historyIndicators) || !useHistoryData(historyIndicators)) return [];
  const start = Math.max(findIndex(recurrentArray, (value) => value !== -1), 0);
  const end = Math.max(historyIndicators.length, 1);
  return [...historyIndicators.slice(start, end)].filter(value => !!value);
};

export const useHistoryData = (historyIndicators = []) => {
  return historyIndicators.length > 0; //recurrentArray.length === 12 && recurrentArray.filter(item => isNumber(item) && item !== -1).length >= 1;
};

export const getCurrentQuarter = () => moment().quarter();

export const getQuarterOptions = () => {
  const startQuarter = getCurrentQuarter();
  return [
    {
      value: startQuarter,
      label: `Q${moment().format('Q YYYY')}`
    },
    {
      value: startQuarter + 1,
      label: `Q${moment().add(1, 'quarter').format('Q YYYY')}`
    }
  ];
};

export const getCurrentMonth = () => moment().month();

export const getMonthlyOptions = () => {
  const startMonth = getCurrentMonth();
  return [
    {
      value: startMonth,
      label: moment().format('MMM YYYY')
    },
    {
      value: startMonth + 1,
      label: moment().add(1, 'month').format('MMM YYYY')
    }
  ];
};

export const getCustomYearsList = () => [moment().year(), moment().year() + 1].map(year => ({
  label: year,
  value: year
}));

export const calculateExpected = (current, indicator, isPercentage, amount) => {
  const isDirectionUp = indicator && getMetadata('isDirectionUp', indicator);

  if (isPercentage) {
    return Math.floor(current * ((isDirectionUp ? 100 + +amount : 100 - +amount) / 100));
  }
  else {
    return Math.floor(current + (+amount * (isDirectionUp ? 1 : -1)));
  }
};

export const addToCurrentDate = (increaseBy, startMonth) => {
  const dateValues = moment().add(increaseBy, 'months').endOf('month').format('YYYY/MM/DD').split('/').map(value => +value);
  if (startMonth) dateValues[2] = 1;
  const [year, month, day] = dateValues;
  return new Date(year, month - 1, day);
};

export const extractDatesByQuarter = (quarter) => {
  const [startDay, startMonth, startYear] = moment().add(quarter, 'quarter').startOf('quarter').format('DD/MM/YYYY').split('/').map(value => +value);
  const [endDay, endMonth, endYear] = moment().add(quarter, 'quarter').endOf('quarter').format('DD/MM/YYYY').split('/').map(value => +value);
  return {
    startDate: new Date(startYear, startMonth - 1, startDay),
    endDate: new Date(endYear, endMonth - 1, endDay)
  };
};

export const getObjectiveTypes = (directionText) => [{text: 'Target', value: true}, {
  text: directionText,
  value: false
}];

export const getTypeOptions = (actualIndicator, isRecurrent) => {
  const result = [{label: '(num)', value: false}];
  // If current indicator is 0 or not defined, prevent increase in percentages
  if (actualIndicator) result.push({label: '%', value: true});
  if (isRecurrent) {
    result.push({
      value: 'custom',
      label: 'Custom'
    });
  }
  return result;
};

export const getObjectivesPriority = (numOfObjectives) => {
  const result = [];
  for (let i = 0; i <= numOfObjectives; i++) {
    result.push({value: i, label: '#' + (i + 1)});
  }
  return result;
};

export const extractPrevQuarterData = (historyIndicators = [], indicator) => {
  const passedMonthCurrentQuarter = Number(moment().format('MM')) - Number(moment().startOf('quarter').format('MM'));
  const endSliceValue = historyIndicators.length - passedMonthCurrentQuarter;
  const result = sumBy(historyIndicators.slice(endSliceValue - 3, endSliceValue), indicator);
  return isNumber(result) && !isNaN(result) ? result : 0;
};

export const extractThisQuarterData = (historyIndicators = [], indicator) => {
  const values = map(historyIndicators, indicator);
  const result = sum(extractMilestones(values));
  return isNumber(result) && !isNaN(result) ? result : 0;
};

export const extractMilestones = (values) => {
  const sliceValue = Number(moment().startOf('quarter').format('MM')) - Number(moment().format('MM'));
  return values.slice(values.length + sliceValue).filter(value => !!value);
};

export const extractCustomMilestones = ([values], indicator, objective) => {
  const startObjectiveMonth = Number(moment().format('MM')) + Number(get(objective, [indicator, 'userInput', 'startMonthIndex'], 0));
  const sliceValue = Number(startObjectiveMonth) - Number(moment().format('MM'));
  return sliceValue < 0 ? values.slice(values.length + sliceValue).filter(value => !!value) : [];
};

export const getCurrentValue = (recurrentType, historyData, indicator, actualIndicators, quarter) => {
  const currentQuarter = getCurrentQuarter();
  const value = (recurrentType === 'quarterly' && currentQuarter === quarter) ? extractThisQuarterData(historyData.indicators, indicator) + actualIndicators[indicator] : actualIndicators[indicator];
  return value;
};

export const getPrevValue = (recurrentType, historyData, indicator) => {
  const prevValue = recurrentType === 'quarterly' ? extractPrevQuarterData(historyData.indicators, indicator) : get(last(historyData.indicators), [indicator], 0);
  return prevValue;
};
