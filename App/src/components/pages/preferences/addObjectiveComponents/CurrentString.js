import React from 'react';
import Component from 'components/Component';
import {formatNumber} from 'components/utils/budget';
import {get, last} from 'lodash';

export default class CurrentString extends Component {
  render() {
    const {indicator, isRecurrent, isCustom, startMonthIndex, classes, historyData, actualIndicators} = this.props;
    if (!indicator || !!((isRecurrent && !isCustom))) return null;
    const text = startMonthIndex !== 0 ?
      `Previous: ${formatNumber(get(last(historyData.indicators), indicator, 0))}` :
      `Current: ${formatNumber(actualIndicators[indicator])}`;

    return (
      <div className={classes.text} style={{marginLeft: '20px'}}>
        {text}
      </div>
    );
  }
}
