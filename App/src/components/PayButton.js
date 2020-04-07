import React from 'react';
import PropTypes from 'prop-types';
import Component from 'components/Component';
import Button from 'components/controls/Button';
import style from 'styles/pay-button.css';
import {getNumberOfDaysBetweenDates} from 'components/utils/date';

export default class PayButton extends Component {

  style = style;

  static propTypes = {
    isPaid: PropTypes.bool,
    trialEnd: PropTypes.string,
    pay: PropTypes.func
  };

  static defaultProps = {
    trialEnd: new Date().toDateString(),
  }

  render() {
    const daysLeft = getNumberOfDaysBetweenDates(new Date(this.props.trialEnd));

    return !this.props.isPaid ?
      <div className={this.classes.inner}>
        Days left in trial
        <span className={this.classes.timeLeftFrame}>
          <span className={this.classes.timeLeftText}>
          {daysLeft}
          </span>
      </span>
        <Button type='primary' onClick={this.props.pay}>Upgrade</Button>
      </div>
      : null;

  }
}

