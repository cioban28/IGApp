import Component from 'components/Component';
import style from 'styles/indicators/crm-popup.css';
import PropTypes from 'prop-types';
import React from 'react';

const timerMinutes = 30;
let intervalId = 0;
let counter = 0;
let isRendered = false;

export default class ScheduleTaskRunningTimer extends Component {

  style = style;

  constructor(props) {
    super(props);
    this.state = {
      minutes: timerMinutes - counter
    };
  }

  static propTypes = {
    startedRunning: PropTypes.bool,
    doneRunning: PropTypes.func,
    updateTimerTime: PropTypes.func
  };

  componentWillMount() {
    isRendered = true;
    this.props.updateTimerTime(timerMinutes - counter);
  }

  componentWillUnmount() {
    isRendered = false;
  }

  timer = () => {
    const newCount = timerMinutes - (++counter);
    if (newCount > 0) {
      isRendered ? this.props.updateTimerTime(newCount) : null;
    }
    if (!this.props.startedRunning) {
      clearInterval(intervalId);
      counter = 0;
      this.props.updateTimerTime(timerMinutes);
    }
    else {
      clearInterval(intervalId);
      counter = 0;
      this.props.doneRunning();
      this.props.updateTimerTime(timerMinutes);
    }
  };

  startTimer = () => {
    intervalId = setInterval(this.timer, 60000);
  };

  render() {
    const {
      startedRunning,
      timerCurrentTime
    } = this.props;

    if (startedRunning && !counter) {
      this.startTimer();
    }

    return (
      <div hidden={!startedRunning}>
        <div style={{marginLeft: '12px', marginTop: '10px', fontSize: '12px'}}>
          Updating data... (~{timerCurrentTime} minutes to complete)
        </div>
      </div>
    );
  }
}
