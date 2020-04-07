import {formatBudget} from 'components/utils/budget';
import {formatTimestamp} from 'components/utils/date';
import isEmpty from 'lodash/isEmpty';

export function formatExpenses(expenses, dates) {
  return isEmpty(expenses) ? [] :
    expenses.map(expense => {

      const timeframeWithIndex = expense.timeframe
        .map((amount, index) => {
          return {amount, index};
        })
        .filter(item => item.amount);

      return {
        ...expense,
        formattedTimeframe: timeframeWithIndex.map(item => dates[item.index]).join(', '),
        formattedAmount: formatBudget(expense.amount),
        formattedTimestamp: formatTimestamp(expense.lastUpdateTime)
      };
    });
}