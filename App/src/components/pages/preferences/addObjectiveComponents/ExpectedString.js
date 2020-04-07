import React from 'react';
import Component from 'components/Component';
import style from 'styles/onboarding/onboarding.css';
import popupStyle from 'styles/welcome/add-member-popup.css';
import navStyle from 'styles/profile/market-fit-popup.css';
import {formatNumber} from 'components/utils/budget';
import {calculateExpected} from 'components/utils/objective';

export default class ExpectedString extends Component {
  style = style;
  styles = [popupStyle, navStyle];

  render() {
    const {targetValue, indicator, isTarget, isRecurrent, isCustom, isPercentage, amount, fromValue} = this.props;

    if (!(targetValue && !isTarget && !(isRecurrent && isCustom))) return null;
    if (!indicator) return null;

    const value = isRecurrent ?
      formatNumber(calculateExpected(fromValue, indicator, isPercentage, amount)) :
      formatNumber(targetValue);

    return (
      <div className={this.classes.text} style={{marginTop: '23px'}}>
        {`Expected target: ${value}`}
      </div>
    );
  }
}
