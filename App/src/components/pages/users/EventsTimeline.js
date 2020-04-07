import React, {Fragment} from 'react';
import {isEmpty} from 'lodash';
import moment from 'moment';
import Component from 'components/Component';
import Tooltip from 'components/controls/Tooltip';
import {formatBudget} from 'components/utils/budget';
import {getNickname as getChannelNickname} from 'components/utils/channels';
import style from 'styles/users/users-popup.css';
import {getChannelIcon} from 'components/utils/filters/channels';
import classnames from 'classnames';
import { getFormName } from 'components/utils/users';

const tooltip = {
  utm_source: 'Source',
  utm_medium: 'Medium',
  utm_campaign: 'Campaign',
  utm_term: 'Term',
  utm_content: 'Content',
  referrer_url: 'Referrer',
  device: 'Device',
  browser: 'Browser',
  os: 'Operating system'
};

export default class EventsTimeline extends Component {

  style = style;

  getChannelNicknameWithDirect = (channel) => channel === 'direct' ? 'Direct' : getChannelNickname(channel);

  stringifyDate = (dateString) => {
    const date = new Date(dateString);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return monthNames[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear() + ' at ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
  };

  getTooltip = data =>
    Object.keys(tooltip)
      .filter(field => data[field])
      .map(field => `${tooltip[field]} - ${data[field]}`).join('<br/>');

  getDateTitle = date => {
    const today = moment();
    const yesterday = moment().subtract(1, 'day');
    if (moment(date).isSame(today, 'day')) {
      return 'Today';
    } else if (moment(date).isSame(yesterday, 'day')) {
      return 'Yesterday';
    } else {
      return date;
    }
  };

  render() {
    const {groupedEvents, emails} = this.props;

    return (
      <div>
        {Object.keys(groupedEvents).map((date, dateIndex) => {
          if (dateIndex === Object.keys(groupedEvents).length - 1 && groupedEvents[date].length === 1 && groupedEvents[date][0].isStartOfPeriod) {
            // hide event timeline for current date if it only contain start of period
            // and there are no older events
            return null;
          }
          else if (groupedEvents[date].length === 1 && groupedEvents[date][0].isStartOfPeriod) {
            // hide timeline for current date and show start of period line if it only contain start of period
            // and there are older events
            return <div key={dateIndex} className={this.classes.periodSeparation}>
              <span>{moment(groupedEvents[date][0].startTime).format('MMM D, YYYY')}</span></div>;
          }
          else {
            // show timeline for current date
            const startOfPeriodIndex = groupedEvents[date].findIndex(item => item.isStartOfPeriod);
            let showStartOfPeriod = false;
            if (startOfPeriodIndex >= 0) {
              // show start of period line if there are older events
              // 1. start of period is not the oldest item/event on current date, or
              // 2. current date is not the oldest date
              if (startOfPeriodIndex !== groupedEvents[date].length - 1) {
                showStartOfPeriod = true;
              }
              else if (dateIndex !== Object.keys(groupedEvents).length - 1) {
                showStartOfPeriod = true;
              }
            }
            return <Fragment key={dateIndex}>
              <div className={this.classes.dailyEvents}>
                <div className={classnames(this.classes.label, this.classes.date)}>{this.getDateTitle(date)}</div>
                <div className={this.classes.timeline}>
                  {
                    groupedEvents[date].map((item, index) => {
                      if (item.isStartOfPeriod) {
                        return null;
                      }
                      else if (item.isForm) {
                        return (
                          <div className={this.classes.eventLine} key={`form-${index}`}>
                            <div className={this.classes.iconContainer}>
                              <div className={this.classes.iconCircle} data-icon="event:form"
                                   style={{backgroundSize: '40%'}}/>
                            </div>
                            <div className={this.classes.eventText}>
                              {`${item.email} submitted ${getFormName(item)} on ${item.page_path}`}
                              <div className={this.classes.eventTime}>
                                {this.stringifyDate(item.timestamp)}
                              </div>
                            </div>
                          </div>
                        );
                      }
                      else if (item.isFunnelStage) {
                        return (
                          <Tooltip className={this.classes.eventLine}
                                   key={`stage-${index}`}
                                   tip={item.revenueForAccount ? `Deal amount - ${formatBudget(item.revenueForAccount)}` : null}
                                   id={`stage-${index}`}>
                            <div className={this.classes.iconContainer}>
                              <div className={this.classes.iconCircle} data-icon="event:status"
                                   style={{backgroundSize: '40%'}}/>
                            </div>
                            <div className={this.classes.eventText}>
                              Status changed to <span
                              className={this.classes.bold}>{item.nickname} creation</span> {item.previousFunnelStageNickname &&
                            <span className={this.classes.thin}>{`from ${item.previousFunnelStageNickname}`}</span>}
                              <div className={this.classes.eventTime}>
                                {this.stringifyDate(item.startTime)}
                                {/*{emails.length > 1 ? ", " + item.email : null}*/}
                              </div>
                            </div>
                          </Tooltip>
                        );
                      }
                      else {
                        return (
                          <Fragment key={`channel-${index}`}>
                            {
                              !isEmpty(item.pages) && (
                                <div className={this.classes.eventLine} key={`pages-${index}`}>
                                  <div className={this.classes.iconContainer}>
                                    <div className={classnames(this.classes.iconCircle, this.classes.iconGreen)}
                                         data-icon="event:page"/>
                                  </div>
                                  <div className={this.classes.eventText}>
                                    {`Visited `}
                                    <span className={this.classes.capsule}>{item.pages[0].path}</span>
                                    {item.pages.length > 1 &&
                                    <span className={this.classes.otherPages}>
                                      {`\u00A0and\u00A0`}
                                      <Tooltip
                                        id={`pages-${dateIndex}-${index}`}
                                        tip={item.pages.slice(1).map((item, index) => `${index !== 0 ? '<br>' : ''}${item.path}`).join('')}
                                        html={false}
                                        TooltipProps={{
                                          multiline: true
                                        }}
                                      >
                                        <span className={classnames(this.classes.capsule, this.classes.toggle)}>
                                          {`${item.pages.length - 1} other ${item.pages.length === 2 ? 'page' : 'pages'}`}
                                        </span>
                                      </Tooltip>
                                    </span>
                                    }
                                    <div className={this.classes.eventTime}>
                                      {this.stringifyDate(item.startTime)}
                                      {emails.length > 1 ? ', ' + item.email : null}
                                    </div>
                                  </div>
                                </div>
                              )
                            }
                            <Tooltip className={this.classes.eventLine}
                                     tip={this.getTooltip(item)}
                                     id={`channel-${index}`}>
                              <div className={this.classes.iconContainer}>
                                <div className={this.classes.iconSquare} data-icon={getChannelIcon(item.channel)}/>
                              </div>
                              <div className={this.classes.eventText}>
                                {item.isOffline ? 'Interacted' : 'Visited website'} through <span
                                className={this.classes.bold}>{this.getChannelNicknameWithDirect(item.channel)}</span>
                                <div className={this.classes.eventTime}>
                                  {this.stringifyDate(item.startTime)}
                                  {emails && emails.length > 1 ? ', ' + item.email : null}
                                </div>
                              </div>
                            </Tooltip>
                          </Fragment>
                        );
                      }
                    })
                  }
                </div>
              </div>
              {
                showStartOfPeriod && <div className={this.classes.periodSeparation}>
                  <span>{moment(groupedEvents[date][startOfPeriodIndex].startTime).format('MMM D, YYYY')}</span></div>
              }
            </Fragment>;
          }
        })}
      </div>
    );
  }
}
