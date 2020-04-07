import React from 'react';
import Component from 'components/Component';
import style from 'styles/onboarding/onboarding.css';
import popupStyle from 'styles/welcome/add-member-popup.css';
import navStyle from 'styles/profile/market-fit-popup.css';
import moment from 'moment';
import {getNickname} from 'components/utils/indicators';
import {formatNumber} from 'components/utils/budget';
import {getPrevValue} from 'components/utils/objective';

export default class PrevValueString extends Component {
  style = style;
  styles = [popupStyle, navStyle];

  render() {
    const {indicator, recurrentType, isRecurrent, historyData} = this.props;
    if (!(indicator && isRecurrent)) return null;

    const calendarUnit = recurrentType === 'quarterly'
      ? `Q${moment().subtract(1, 'quarter').format('Q YYYY')}`
      : moment().subtract(1, 'month').format('MMM YYYY');
    const nickname = getNickname(indicator);
    const prevValue = formatNumber(getPrevValue(recurrentType, historyData, indicator));
    const text = `Previous (${calendarUnit}): ${prevValue} ${nickname}`;

    return (
      <div className={this.classes.text} style={{marginBottom: '10px'}}>
        {text}
      </div>
    );
  }
}
