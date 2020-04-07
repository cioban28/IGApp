import React from 'react';
import Component from 'components/Component';
import style from 'styles/onboarding/onboarding.css';
import popupStyle from 'styles/welcome/add-member-popup.css';
import navStyle from 'styles/profile/market-fit-popup.css';
import moment from 'moment';
import {getNickname} from 'components/utils/indicators';
import {formatNumber} from 'components/utils/budget';
import {getCurrentValue} from 'components/utils/objective';


export default class CurrentStringRecurrent extends Component {
  style = style;
  styles = [popupStyle, navStyle];

  render() {
    const {indicator, recurrentType, actualIndicators, quarter, historyData} = this.props;
    if (!indicator) return null;
    const calendarUnit = recurrentType === 'quarterly' ?
      `Q${moment().format('Q YYYY')}` :
      moment().format('MMM YYYY');
    const nickname = getNickname(indicator);
    const value = formatNumber(getCurrentValue(recurrentType, historyData, indicator, actualIndicators, quarter));
    const text = `Current (${calendarUnit}): ${value} ${nickname}`;

    return (
      <div className={this.classes.text} style={{marginBottom: '12px'}}>
        {text}
      </div>
    );
  }
}