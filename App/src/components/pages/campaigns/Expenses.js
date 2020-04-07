import React from 'react';
import Component from 'components/Component';
import {getNickname as getChannelNickname} from 'components/utils/channels';
import {getDates} from 'components/utils/date';
import taskStyle from 'styles/campaigns/task.css';
import {formatExpenses} from 'components/utils/expenses';
import Table from 'components/controls/Table';
import history from 'history';

export default class Expenses extends Component {

  styles = [taskStyle];

  deleteExpense = (index) => {
    const expenses = [...this.props.expenses];
    expenses.splice(index, 1);
    this.props.updateUserMonthPlan({expenses}, this.props.region, this.props.planDate);
  };

  editExpense = (expense, index) => {
    history.push({
      pathname: '/campaigns/add-expense',
      state: {
        ...expense,
        index,
        close: () => history.push({
          pathname: '/campaigns/expenses'
        })
      }
    });
  };

  render() {
    const {expenses, planDate, calculatedData: {activeCampaigns}} = this.props;
    const data = formatExpenses(expenses, getDates(planDate))

    return (
      <Table
        data={data}
        columns={[
          {
            id: 'controls',
            header: '',
            cell: (expense, { index }) => (
              <div style={{display: 'flex'}}>
                <div
                  className={taskStyle.locals.deleteIcon} onClick={() => this.deleteExpense(index)}
                  style={{cursor: 'pointer'}}
                />
                <div
                  className={taskStyle.locals.editIcon} onClick={() => this.editExpense(expense, index)}
                  style={{cursor: 'pointer', marginLeft: '20px'}}
                />
              </div>
            )
          },
          {
            id: 'expense',
            header: 'Expense',
            cell: 'name',
          },
          {
            id: 'timeframe',
            header: 'Timeframe',
            cell: 'formattedTimeframe',
          },
          {
            id: 'dueDate',
            header: 'Due date',
            cell: 'dueDate',
          },
          {
            id: 'amount',
            header: 'Amount',
            cell: 'formattedAmount',
          },
          {
            id: 'assignedIn',
            header: 'Assigned in',
            cell: (expense) => {
              if (expense.assignedTo.entityId) {
                if (expense.assignedTo.entityType === 'campaign') {
                  return activeCampaigns[expense.assignedTo.entityId].name
                }

                return getChannelNickname(expense.assignedTo.entityId)
              }

              return ''
            },
          },
          {
            id: 'lastEdit',
            header: 'Last Edit',
            cell: 'formattedTimestamp',
          },
        ]}
      />
    );
  }
}