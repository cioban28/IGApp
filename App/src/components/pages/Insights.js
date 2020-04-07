import React from 'react';
import Component from 'components/Component';
import Page from 'components/Page';
import insightsStyle from 'styles/insights/insights.css';
import style from 'styles/insights/insight-item.css';
import planStyle from 'styles/plan/plan.css';
import { timeFrameToDate } from 'components/utils/objective';
import InsightItem from 'components/pages/insights/InsightItem';
import { getNickname as getChannelNickname } from 'components/utils/channels';
import { getIndicatorsWithProps, getNickname as getIndicatorNickname } from 'components/utils/indicators';
import { getDates } from 'components/utils/date';
import merge from 'lodash/merge';
import { formatNumber } from 'components/utils/budget';
import Button from 'components/controls/Button';
import ReactDOM from "react-dom";

export default class Insights extends Component {

  style = style;
  styles = [insightsStyle, planStyle];

  constructor(props) {
    super(props);
    this.state = {
    }
  }

  close = () => {
    this.setState({suggestedChannel: '', balancingChannel: '', showBalancerPopup: false});
  };

  componentDidMount() {
    document.addEventListener('mousedown', this.onOutsideClick, true);
    document.addEventListener('touchstart', this.onOutsideClick, true);
    document.addEventListener('keydown', this.handleKeyPress);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.onOutsideClick, true);
    document.removeEventListener('touchstart', this.onOutsideClick, true);
    document.removeEventListener('keydown', this.handleKeyPress);
  }

  onOutsideClick = (e) => {
    const elem = ReactDOM.findDOMNode(this.refs.popup);

    if (elem && elem !== e.target && !elem.contains(e.target)) {
      this.close();
    }
  };

  handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      this.close();
    }
  };

  render() {
    const {projectedPlan, objectives, approvedBudgets, CIM, planDate, approveChannel, declineChannel, approvedBudgetsProjection, actualIndicators} = this.props;
    const {showBalancerPopup, suggestedChannel, balancingChannel, findAlternative} = this.state;
    let relevantObjectives = objectives
      .filter(item => item.isArchived !== true && timeFrameToDate(item.timeFrame) >= new Date())
      .map(item => item.indicator);
    const indicators = getIndicatorsWithProps();
    const objectiveOptions = Object.keys(indicators)
      .filter(item => indicators[item].isObjective);
    relevantObjectives = relevantObjectives.concat(objectiveOptions);
    const firstObjective = (relevantObjectives && relevantObjectives[0]) || 'newMQL';
    const zeroBudgetSuggestions = {};
    Object.keys(approvedBudgets[0]).forEach(key => zeroBudgetSuggestions[key] = 0);
    const nextMonthBudgets = merge(zeroBudgetSuggestions, projectedPlan[0].plannedChannelBudgets);
    const currentBudgets = Object.keys(approvedBudgets[0]).reduce((sum, current) => sum + approvedBudgets[0][current] * CIM[current][firstObjective], 0);
    const orderedSuggestions = Object.keys(nextMonthBudgets)
      .filter(channel => nextMonthBudgets[channel] !== (approvedBudgets[0][channel] || 0))
      .sort((channel1, channel2) => {
        const budget1 = (nextMonthBudgets[channel1] - (approvedBudgets[0][channel1] || 0)) * CIM[channel1][firstObjective];
        const budget2 = (nextMonthBudgets[channel2] - (approvedBudgets[0][channel2] || 0)) * CIM[channel2][firstObjective];
        return budget2 - budget1;
      });
    const cubesData = orderedSuggestions.map(channel => {
      const objectivesRatio = relevantObjectives.map(objective => {
        const ratio = ((nextMonthBudgets[channel] - (approvedBudgets[0][channel] || 0)) * CIM[channel][objective]) / currentBudgets;
        return {
          ratio: Math.round(ratio * 100),
          nickname: getIndicatorNickname(objective),
          projected: Math.round((approvedBudgetsProjection[0][objective] - actualIndicators[objective]) * ratio)
        }
      });
      const dates = getDates(planDate);
      const findBalancer = (channel, skip = 0) => {
        const budget = (nextMonthBudgets[channel] || 0) - (approvedBudgets[0][channel] || 0);
        const delta = 0.2 * budget;
        const lowerRange = budget - delta;
        const higherRange = budget + delta;
        const alternatives = orderedSuggestions
          .filter(item => item !== channel &&
            (budget > 0 ?
              (approvedBudgets[0][item] || 0) - (nextMonthBudgets[item] || 0) > lowerRange && (approvedBudgets[0][item] || 0) - (nextMonthBudgets[item] || 0) < higherRange
              :
              (approvedBudgets[0][item] || 0) - (nextMonthBudgets[item] || 0) < lowerRange && (approvedBudgets[0][item] || 0) - (nextMonthBudgets[item] || 0) > higherRange));
        if (alternatives && alternatives.length > 0) {
          this.setState({
            suggestedChannel: channel,
            balancingChannel: alternatives[skip % alternatives.length],
            showBalancerPopup: true,
            findAlternative: alternatives.length > 1 ? () => {
              findBalancer(channel, ++skip)
            } : null
          });
        }
        else {
          this.setState({showBalancerPopup: true});
        }
      };

      return {
        channel: channel,
        channelNickname: getChannelNickname(channel),
        objectivesRatio: objectivesRatio,
        dates: dates[0],
        currentBudget: (approvedBudgets[0][channel] || 0),
        suggestedBudget: nextMonthBudgets[channel],
        approveChannel: (() => {
          approveChannel(0, channel, nextMonthBudgets[channel])
        }),
        declineChannel: (() => {
          declineChannel(0, channel, (approvedBudgets[0][channel] || 0))
        }),
        findBalancer: (() => {
          findBalancer(channel)
        })
      };
    })
      // Filter all 'invest' insights that no effected indicators
      .filter(data=>
        !((data.suggestedBudget > data.currentBudget) &&
          data.objectivesRatio.every(objectiveRatio=>objectiveRatio.ratio==0)
        )
      );

    const cubes = cubesData.map((data)=>{
      return <InsightItem
        key={data.channel}
        {... data}
      />
    });

    return <div>
      <Page contentClassName={ planStyle.locals.content } innerClassName={ planStyle.locals.pageInner } width="100%">
        <div className={ planStyle.locals.head }>
          <div className={ planStyle.locals.headTitle }>Insights & Suggestions</div>
        </div>
        <div className={ planStyle.locals.wrap }>
            <div className={insightsStyle.locals.inner}>
              {cubes}
              {showBalancerPopup ?
                <Page popup={true} width="825px" contentClassName={insightsStyle.locals.popupContent} innerClassName={insightsStyle.locals.popupInner}>
                  <span ref="popup">
                  {balancingChannel ?
                    <div className={this.classes.frame} style={{marginBottom: '0', height: '300px'}}>
                      <div className={this.classes.leftSide}>
                        <div className={this.classes.title}>
                          2-Sides Optimization Opportunity
                        </div>
                        <div className={this.classes.text}>
                          {nextMonthBudgets[suggestedChannel] && approvedBudgets[0][suggestedChannel] ?
                            nextMonthBudgets[suggestedChannel] > approvedBudgets[0][suggestedChannel] ?
                              <span>Raising <b>{getChannelNickname(suggestedChannel)}</b> budget</span>
                              :
                              <span>Reducing <b>{getChannelNickname(suggestedChannel)}</b> budget</span>
                            : nextMonthBudgets[suggestedChannel] ?
                              <span>Adding <b>{getChannelNickname(suggestedChannel)}</b> to your mix</span>
                              :
                              <span>Removing <b>{getChannelNickname(suggestedChannel)}</b> from your mix</span>
                          }
                          <span> in <b>{getDates(planDate)[0]}</b> and instead</span>
                          {nextMonthBudgets[balancingChannel] && approvedBudgets[0][balancingChannel] ?
                            nextMonthBudgets[balancingChannel] > approvedBudgets[0][balancingChannel] ?
                              <span> raising <b>{getChannelNickname(balancingChannel)}</b> budget</span>
                              :
                              <span> reducing <b>{getChannelNickname(balancingChannel)}</b> budget</span>
                            : nextMonthBudgets[balancingChannel] ?
                              <span> adding <b>{getChannelNickname(balancingChannel)}</b> to your mix</span>
                              :
                              <span> removing <b>{getChannelNickname(balancingChannel)}</b> from your mix</span>
                          }
                          ,
                          could {((nextMonthBudgets[suggestedChannel] + nextMonthBudgets[balancingChannel]) > ((approvedBudgets[0][suggestedChannel] || 0) + (approvedBudgets[0][balancingChannel] || 0))) ? 'improve' : 'reduce'} your
                          forecasted<br/>
                          {relevantObjectives.slice(0, 2).map((objective, index) => {
                            const ratio = Math.round((((nextMonthBudgets[suggestedChannel] - (approvedBudgets[0][suggestedChannel] || 0)) * CIM[suggestedChannel][objective]) + ((nextMonthBudgets[balancingChannel] - (approvedBudgets[0][balancingChannel] || 0)) * CIM[balancingChannel][objective])) / currentBudgets * 100);
                            return <div key={index}>
                              - <b>{getIndicatorNickname(objective)}</b> {ratio >= 0 ? 'by' : 'only by'} <b>{Math.abs(ratio)}%</b><br/>
                            </div>
                          })
                          }
                          Suggested budget
                          ({getChannelNickname(suggestedChannel)}): <b>${formatNumber(nextMonthBudgets[suggestedChannel])}</b> (${formatNumber(nextMonthBudgets[suggestedChannel] - (approvedBudgets[0][suggestedChannel] || 0))}).<br/>
                          Suggested budget
                          ({getChannelNickname(balancingChannel)}): <b>${formatNumber(nextMonthBudgets[balancingChannel])}</b> (${formatNumber(nextMonthBudgets[balancingChannel] - (approvedBudgets[0][balancingChannel] || 0))}).<br/>
                          Total budget change: <b
                          style={{color: '#2fae23'}}>${formatNumber((approvedBudgets[0][suggestedChannel] || 0) + (approvedBudgets[0][balancingChannel] || 0) - nextMonthBudgets[suggestedChannel] - nextMonthBudgets[balancingChannel])}</b>.
                        </div>
                        <div className={this.classes.buttons} style={{top: '243px'}}>
                          <Button className={this.classes.approveButton} onClick={() => {
                            approveChannel(0, suggestedChannel, nextMonthBudgets[suggestedChannel] || 0);
                            approveChannel(0, balancingChannel, nextMonthBudgets[balancingChannel]);
                            this.close();
                          }
                          }>
                            <div className={this.classes.approveIcon}/>
                            Approve
                          </Button>
                          <Button className={this.classes.declineButton} onClick={() => {
                            declineChannel(0, suggestedChannel, (approvedBudgets[0][suggestedChannel] || 0));
                            declineChannel(0, balancingChannel, (approvedBudgets[0][balancingChannel] || 0));
                            this.close();
                          }
                          }>
                            <div className={this.classes.declineIcon}/>
                            Decline
                          </Button>
                          <div hidden={!findAlternative}>
                            <Button className={this.classes.balancerButton} style={{ width: '232px' }} onClick={findAlternative}>
                              <div className={this.classes.balancerIcon}/>
                              Find an alternative balancer
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className={this.classes.rightSide}>
                        <div className={insightsStyle.locals.closePopup} onClick={() => {
                          this.close();
                        }}/>
                        <div className={this.classes.end}>
                          <div className={this.classes.investBox} style={{width: '94px'}}>
                            Optimize
                          </div>
                        </div>
                        <div className={this.classes.summaryTitleContainer}>
                          <div className={insightsStyle.locals.channelIcons}>
                            <div className={insightsStyle.locals.upperIcon} data-icon={"plan:" + balancingChannel}/>
                            <div className={insightsStyle.locals.lowerIcon} data-icon={"plan:" + suggestedChannel}/>
                          </div>
                          <div className={this.classes.summaryTitle}>
                            {relevantObjectives[0] && Math.abs(Math.round((((nextMonthBudgets[balancingChannel] - (approvedBudgets[0][balancingChannel] || 0)) * CIM[balancingChannel][relevantObjectives[0]]) + ((nextMonthBudgets[suggestedChannel] - (approvedBudgets[0][suggestedChannel] || 0)) * CIM[suggestedChannel][relevantObjectives[0]])) / currentBudgets * 100))}%
                          </div>
                        </div>
                        <div className={this.classes.summaryText}>
                          {Math.round((((nextMonthBudgets[balancingChannel] - (approvedBudgets[0][balancingChannel] || 0)) * CIM[balancingChannel][relevantObjectives[0]]) + ((nextMonthBudgets[suggestedChannel] - (approvedBudgets[0][suggestedChannel] || 0)) * CIM[suggestedChannel][relevantObjectives[0]])) / currentBudgets * 100) > 0 ? 'Improve' : 'Decline'} in
                          forecasted {relevantObjectives[0] && getIndicatorNickname(relevantObjectives[0])}{relevantObjectives.slice(1, 2).map((objective, index) => {
                          const ratio = Math.round((((nextMonthBudgets[balancingChannel] - (approvedBudgets[0][balancingChannel] || 0)) * CIM[balancingChannel][objective]) + ((nextMonthBudgets[suggestedChannel] - (approvedBudgets[0][suggestedChannel] || 0)) * CIM[suggestedChannel][objective])) / currentBudgets * 100);
                          return <span key={index}>
                          , and {Math.abs(ratio)}% {ratio >= 0 ? 'improve' : 'decline'} in forecasted {getIndicatorNickname(objective)}
                        </span>
                        })}
                        </div>
                      </div>
                    </div>
                    :
                    <div className={this.classes.frame} style={{marginBottom: '0', height: '300px'}}>
                      <div className={this.classes.leftSide}>
                        <div className={this.classes.title}>
                          No balancing channel found.
                        </div>
                      </div>
                      <div className={this.classes.rightSide}>
                        <div className={insightsStyle.locals.closePopup} onClick={() => {
                          this.close();
                        }}/>
                      </div>
                    </div>
                  }
                  </span>
                </Page>
                : null
              }
            </div>
          </div>
      </Page>
    </div>
  }
}