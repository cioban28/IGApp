import React from 'react';
import PropTypes from 'prop-types';
import Component from 'components/Component';
import style from 'styles/plan/insight-item.css';
import Button from 'components/controls/Button';
import {formatBudget} from 'components/utils/budget';
import groupBy from 'lodash/groupBy';
import {getNickname as getIndicatorNickname} from 'components/utils/indicators';
import {getNickname as getChannelNickname} from 'components/utils/channels';
import {getDates} from 'components/utils/date';
import {formatNumber} from 'components/utils/budget';
import Tooltip from 'components/controls/Tooltip';

export default class InsightItem extends Component {

  style = style;

  static propTypes = {
    fromChannels: PropTypes.arrayOf(PropTypes.shape({
      fromBudget: PropTypes.number.isRequired,
      toBudget: PropTypes.number.isRequired,
      channel: PropTypes.any.isRequired,
      monthKey: PropTypes.any.isRequired
    })).isRequired,
    toChannels: PropTypes.arrayOf(PropTypes.shape({
      fromBudget: PropTypes.number.isRequired,
      toBudget: PropTypes.number.isRequired,
      channel: PropTypes.any.isRequired,
      monthKey: PropTypes.any.isRequired
    })).isRequired,
    forecasting: PropTypes.arrayOf(PropTypes.shape({
      committed: PropTypes.number.isRequired,
      ifApproved: PropTypes.number.isRequired,
      indicator: PropTypes.any.isRequired,
      monthKey: PropTypes.any.isRequired
    })).isRequired,
    onCommit: PropTypes.func.isRequired,
    onDecline: PropTypes.func.isRequired,
    planDate: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      disabled: false
    };
  }

  getTooltip = (dates) => {
    const forecastingData = groupBy(this.props.forecasting, (item) => item.monthKey);
    return Object.keys(forecastingData).map(month => {
      const monthIndicators = forecastingData[month]
        .map(item =>
          `<div style="text-align: left; font-size: 10px; font-weight: 500">
       ${getIndicatorNickname(item.indicator)} <span style="color: #24b10e">${Math.round(item.ifApproved / item.committed * 100)}%</span> (${item.ifApproved > item.committed ? '+' : '-'}${formatNumber(Math.abs(item.ifApproved - item.committed))})
        </div><br/>`
        );
      return `<div style="text-align: center; font-size: 10px; font-weight: 500">
        ${dates[month]}
        </div><br/>
      <div>
      ${monthIndicators.join('')}
    </div>`;
    }).join('');
  };

  render() {
    const {fromChannels, toChannels, planDate, onCommit, onDecline} = this.props;
    const dates = getDates(planDate);
    const fromChannelsItems = fromChannels.map((item, index) => <ChannelItem key={index} {...item}
                                                                             month={dates[item.monthKey]}/>);
    const toChannelsItems = toChannels.map((item, index) => <ChannelItem key={index} {...item}
                                                                         month={dates[item.monthKey]}/>);

    return <div style={{width: '100%'}}>
      <div className={this.classes.frame}>
        <div className={this.classes.title}>
          Optimization Opportunity
          <Tooltip
            className={this.classes.forecastingIcon}
            id='forecasting-tooltip'
            tip={this.getTooltip(dates)}
          />
        </div>
        <div className={this.classes.inner}>
          <div style={{width: 'fit-content'}}>
            {fromChannelsItems}
          </div>
          <div className={this.classes.arrowIcon}/>
          <div style={{width: 'fit-content'}}>
            {toChannelsItems}
          </div>
        </div>
      </div>
      <div className={this.classes.buttons}>
        <Button type='approve' icon='buttons:approve' style={{width: '100px'}}
                disabled={this.state.disabled}
                onClick={() => {
                  onCommit();
                  this.setState({disabled: true});
                }}>
          Commit
        </Button>
        <Button type='decline' icon='buttons:decline' style={{
          width: '100px',
          marginLeft: '20px'
        }}
                disabled={this.state.disabled}
                onClick={() => {
                  onDecline();
                  this.setState({disabled: true});
                }}>
          Decline
        </Button>
      </div>
    </div>;
  }
}

export class ChannelItem extends Component {

  style = style;

  render() {
    const {fromBudget, toBudget, channel, month} = this.props;
    return <div style={{display: 'inline-flex'}}>
      <div className={this.classes.channelItem}>
        <div className={this.classes.date}>
          {month}
        </div>
          <Tooltip className={this.classes.channelIcon}
                   data-icon={`plan:${channel}`}
                   tip={getChannelNickname(channel)}
                   id="channel-tooltip"
          />
        <div className={this.classes.budgets}>
          <div className={this.classes.fromBudget}>
            {formatBudget(fromBudget)}
          </div>
          <div className={this.classes.shiftIcon}/>
          <div className={this.classes.toBudget}>
            {formatBudget(toBudget)}
          </div>
        </div>
      </div>
    </div>;
  }
};