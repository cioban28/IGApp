import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {NUMBER_OF_FUTURE_MONTHS} from 'components/utils/date';
import PlanPopup, {TextContent as PopupTextContent} from 'components/pages/plan/Popup';
import Select from 'components/controls/Select';

const getOptions = (maxMonths) => {
  const numberOfMonthsOptions = Math.min(maxMonths + 1, NUMBER_OF_FUTURE_MONTHS);

  const options = Array.from((Array.keys(new Array(numberOfMonthsOptions))), (i) => ({
    value: i,
    label: i
  }));

  // Prevent selecting this month
  return options.filter(item => item.value);
};

export default class MonthsPopup extends Component {
  static propTypes = {
    // amount of months to display
    months: PropTypes.number.isRequired,
    // max possible months to display
    maxMonths: PropTypes.number.isRequired,
    // change handler
    onChange: PropTypes.func.isRequired,
    // acts like 'ref' but returns root node of component
    getRef: PropTypes.func.isRequired
  };

  handleChange = (e) => {
    this.props.onChange(e.value);
    this.popup.close();
  };

  setRef = (ref) => {
    this.popup = ref;
    this.props.getRef(ref);
  };

  render() {
    const {maxMonths, months, getRef, onChange, ...props} = this.props;
    const monthSelectOptions = getOptions(maxMonths);

    return (
      <PlanPopup ref={this.setRef} title="Settings" {...props}>
        <PopupTextContent>
          <div>
            Past/Future number of months
            <Select
              selected={months}
              select={{options: monthSelectOptions}}
              onChange={this.handleChange}
              style={{width: '100px', marginTop: '10px'}}
            />
          </div>
        </PopupTextContent>
      </PlanPopup>
    );
  }
}
