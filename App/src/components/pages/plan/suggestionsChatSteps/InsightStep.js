import Component from 'components/Component';
import React from 'react';
import PropTypes from 'prop-types';
import style from 'styles/plan/plan-optimization-popup.css';
import InsightItem from 'components/pages/plan/suggestionsChatSteps/InsightItem';

export default class InsightStep extends Component {
  style = style;

  static propTypes = {
    getInsightData: PropTypes.func.isRequired,
    planDate: PropTypes.string.isRequired,
    getNumberOfPlanUpdates: PropTypes.func.isRequired
  };

  componentWillMount() {
    this.insightData = this.props.getInsightData && this.props.getInsightData();
  }

  componentDidMount() {
    // Patch for preventing ReactSimpleChatBot scroll to bottom when a ReactTooltip is added to a component in the step
    this.refs.outerDiv.addEventListener('DOMNodeInserted', this.stopEventPropagation);
  }

  componentWillUnmount() {
    this.refs.outerDiv.removeEventListener('DOMNodeInserted', this.stopEventPropagation);
  }

  stopEventPropagation = (e) => {
    e.stopPropagation();
  };

  checkIfMoreUpdatesAvailable = (trigger) => {
    const stepToTrigger = this.props.getNumberOfPlanUpdates() === 0 ? '16' : trigger;
    this.props.triggerNextStep({trigger: stepToTrigger});
  };

  render() {
    const {planDate} = this.props;
    const {fromChannels, toChannels, forecastedIndicators, commitPlanBudgets} = this.insightData;
    return <div className={this.classes.optionsWrapper} ref='outerDiv'>
      <InsightItem fromChannels={fromChannels}
                   toChannels={toChannels}
                   planDate={planDate}
                   forecasting={forecastedIndicators}
                   onCommit={() => {
                     commitPlanBudgets()
                       .then(() => {
                         this.checkIfMoreUpdatesAvailable('8');
                       });
                   }}
                   onDecline={() => {
                     this.checkIfMoreUpdatesAvailable('11');
                   }}
      />
    </div>;
  }
}