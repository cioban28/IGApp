import React from 'react';
import PropTypes from 'prop-types';
import Component from 'components/Component';
import style from 'styles/plan/budget-left-to-plan.css';
import {formatNumber} from 'components/utils/budget';

export default class BudgetLeftToPlan extends Component {

  style = style;

  static propTypes = {
    annualBudget: PropTypes.number,
    annualBudgetLeftToPlan: PropTypes.number
  };

  render() {
    const {annualBudget, annualBudgetLeftToPlan} = this.props;
    const totalWidth = 216;

    const lineWidth = Math.round(totalWidth *
      (1 - (annualBudgetLeftToPlan >= 0 ? annualBudgetLeftToPlan / annualBudget : 0)));

    return <div>
      <div className={this.classes.upperText}>
        Annual Budget
      </div>
      <div className={this.classes.center}>
        <div className={this.classes.number}>
          {formatNumber(annualBudget)}
        </div>
        <div className={this.classes.dollar}>
          $
        </div>
      </div>
      <div className={this.classes.line}>
        <div className={this.classes.lineFill} style={{width: `${lineWidth}px`}}/>
      </div>
      <div className={this.classes.bottomText}>
        ${formatNumber(annualBudgetLeftToPlan)} left to plan
      </div>
    </div>;
  }

}