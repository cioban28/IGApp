import React from 'react';
import Component from 'components/Component';
import style from 'styles/header/infinigrow-robot.css';
import { getNickname as getIndicatorNickname } from 'components/utils/indicators';
import { timeFrameToDate } from 'components/utils/objective';

export default class InfiniGrowRobot extends Component {

  style = style;

  static defaultProps = {
    comapny: '',
    historyData: {},
    actualIndicators: {},
  };

  render() {
    const {company, historyData, actualIndicators, funnelFirstObjective} = this.props;

    const historyValue = historyData && historyData.indicators && historyData.indicators[funnelFirstObjective] && historyData.indicators[funnelFirstObjective][0];
    const currentValue = actualIndicators[funnelFirstObjective] || 0;
    const growth = Math.round((currentValue - historyValue) / historyValue * 100);
    return <div className={this.classes.inner}>
      <div className={this.classes.textBubble}>
        Since joining InfiniGrow, {company}'s {getIndicatorNickname(funnelFirstObjective)} has grown by {growth ? `${growth}%` : 'Infinity'}!
      </div>
      <div className={this.classes.robot}/>
    </div>
  }

}