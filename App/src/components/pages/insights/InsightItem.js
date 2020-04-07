import React from 'react';
import Component from 'components/Component';
import style from 'styles/insights/insight-item.css';
import icons from 'styles/icons/plan.css';
import Button from 'components/controls/Button';
import { formatNumber } from 'components/utils/budget';

export default class InsightItem extends Component {

  style = style;
  styles = [icons];

  textForForecastObjectives(leftSideObjectives, objectivesRatio, suggestedBudget, currentBudget) {
    return (objectivesRatio.every(objective => objective.ratio == 0) && (suggestedBudget <= currentBudget))
      ?
      <span>
        would make no impact on your forecasted MQLs or other funnel metrics.
      </span>
      :
      <span>
        could {suggestedBudget ? 'improve' : 'reduce'} your forecasted<br/>
        {leftSideObjectives}
      </span>
  }

  getLeftSideText(channelNickname, leftSideObjectives, objectivesRatio, suggestedBudget, currentBudget, dates) {
    return <div className={this.classes.text}>
      { (currentBudget && suggestedBudget)?
        <div>
          {suggestedBudget > currentBudget ? 'Raising' : 'Reducing'} <b>{channelNickname}</b> budget
          in <b>{dates}</b> by <b>{Math.round((suggestedBudget > currentBudget ? suggestedBudget / currentBudget - 1 : currentBudget / suggestedBudget - 1) * 100)}%</b>, {this.textForForecastObjectives(leftSideObjectives,objectivesRatio, suggestedBudget, currentBudget)}
        </div>
        :
        <div>
          {suggestedBudget ? 'Adding' : 'Removing'}
          <b> {channelNickname}</b> {suggestedBudget ? 'to' : 'from'} your mix
          in <b>{dates}</b>, {this.textForForecastObjectives(leftSideObjectives,objectivesRatio, suggestedBudget, currentBudget)}
        </div>
      }
      Suggested budget: <b>${formatNumber(suggestedBudget)}</b>.
    </div>;
  }

  getLeftSideObjective(objectivesRatio, currentBudget, suggestedBudget){
    let objectives = objectivesRatio;
    if (suggestedBudget > currentBudget){
      objectives = objectives.filter(item => item.ratio !== 0);
    }

    return objectives.slice(0, 2)
      .map((item, index) => <div key={index}>
        - <b>{item.nickname}</b> {(item.ratio == 0 && suggestedBudget <= currentBudget)?  'will have no effect' :
        <span>{item.ratio >= 0 ? 'by' : 'only by'}
          <span> </span><b>{Math.abs(item.ratio)}%</b> ({(item.projected < 0 ? '-' : '+') + formatNumber(Math.abs(item.projected))})<br/>
        </span>
      }
      </div>);
  }

  render() {
    const {channel, channelNickname, objectivesRatio, dates, currentBudget, suggestedBudget, approveChannel, declineChannel, findBalancer} = this.props;
    const leftSideObjectives = this.getLeftSideObjective(objectivesRatio, currentBudget, suggestedBudget);
    const rightSideObjectives = objectivesRatio
      .filter(item => item.ratio !== 0)
      .slice(1, 2)
      .map((item, index) => <span key={index}>
      , and {Math.abs(item.ratio)}% {item.ratio >= 0 ? 'improve' : 'decline'} in forecasted {item.nickname}
    </span>);
    return <div>
      <div className={this.classes.frame}>
        <div className={this.classes.leftSide}>
          <div className={this.classes.title}>
            {(currentBudget && suggestedBudget) ? 'Budget Optimization Opportunity' : 'Channel Opportunity'}
          </div>
          {this.getLeftSideText(channelNickname, leftSideObjectives,objectivesRatio, suggestedBudget, currentBudget,dates)}
          <div className={this.classes.buttons}>
            <Button className={this.classes.approveButton} onClick={approveChannel}>
              <div className={this.classes.approveIcon}/>
              Approve
            </Button>
            <Button className={this.classes.declineButton} onClick={declineChannel}>
              <div className={this.classes.declineIcon}/>
              Decline
            </Button>
            {findBalancer ?
              <Button className={this.classes.balancerButton} onClick={findBalancer}>
                <div className={this.classes.balancerIcon}/>
                Find a balancer
              </Button>
              : null}
          </div>
        </div>
        <div className={this.classes.rightSide} data-green={!(currentBudget && suggestedBudget)}>
          <div className={this.classes.end}>
            <div className={this.classes.investBox}>
              {suggestedBudget > currentBudget ? 'Invest' : 'Save'}
            </div>
          </div>
          <div className={this.classes.summaryTitleContainer}>
            <div className={this.classes.channelIcon} data-icon={"plan:" + channel}/>
            <div className={this.classes.summaryTitle}>
              {Math.abs(objectivesRatio[0] && objectivesRatio[0].ratio)}%
            </div>
          </div>
          <div className={this.classes.summaryText}>
            {(objectivesRatio[0] && objectivesRatio[0].ratio) > 0 ? 'Improve' : 'Decline'} in forecasted {objectivesRatio[0] && objectivesRatio[0].nickname}{rightSideObjectives}
          </div>
        </div>
      </div>
    </div>
  }
}

