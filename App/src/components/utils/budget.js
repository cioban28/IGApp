import sumBy from 'lodash/sumBy';
import isNil from 'lodash/isNil';
import merge from 'lodash/merge';

export function formatNumber(budget) {
  if (budget == null) {
    return '';
  }

  return String(budget).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatBudget(budget, withSign = false) {
  if (isNil(budget)) {
    return '';
  }

  let sign = '';

  if (withSign) {
    sign = (budget > 0) ? '+' : (budget < 0 ? '-' : '');

  }
  return `${sign}$${formatNumber(Math.abs(Math.round(budget)))}`;
}

export function formatBudgetShortened(budget) {
  if (budget >= 1000000000) {
    return (budget / 1000000000).toFixed(1).replace(/\.0$/, '') + 'G';
  }
  if (budget >= 1000000) {
    return (budget / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (budget >= 1000) {
    return (budget / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return budget;
}

export function extractNumberFromBudget(budget, defaultValue = 0) {
  if (budget) {
    return parseInt(budget.toString().replace(/\D+/g, '')) || defaultValue;
  }
  return defaultValue;
}

export function getAnnualBudgetLeftToPlan(annualBudget, planBudgets, planUnknownChannels) {
  const committedBudgets = getCommitedBudgets(planBudgets);
  const allBudgets = merge([], committedBudgets, planUnknownChannels);

  return annualBudget -
    allBudgets.reduce((annualSum, month) => Object.keys(month)
      .reduce((monthSum, channel) => monthSum + month[channel], 0) + annualSum, 0);
}

export function getPlanBudgetsData(planBudgets, unknownChannels) {
  const committedBudgets = merge([], getCommitedBudgets(planBudgets), unknownChannels);

  const sumBudgets = {};
  committedBudgets.forEach(month => {
    Object.keys(month).forEach(channel => {
      if (!sumBudgets[channel]) {
        sumBudgets[channel] = 0;
      }
      sumBudgets[channel] += month[channel];
    });
  });

  const totalCost = sumBy(Object.keys(sumBudgets), key => sumBudgets[key]);

  return {
    committedBudgets,
    sumBudgets,
    totalCost
  };
}

export function getCommitedBudgets(planBudgets) {
  return planBudgets.map((month) => {
    const newMonth = {};
    Object.keys(month).map((key) => {
      const committedBudget = month[key].committedBudget;
      newMonth[key] = committedBudget || 0;
    });

    return newMonth;
  });
}

export function formatNumberWithDecimalPoint(number, numberOfDigitsAfterPoint = 2) {
  return (Math.round(number * 100) / 100).toFixed(numberOfDigitsAfterPoint);
}