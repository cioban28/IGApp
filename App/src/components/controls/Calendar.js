import React from 'react';
import classnames from 'classnames';
import Component from 'components/Component';

import calendarStyle from 'rc-calendar/assets/index.css';
import RcCalendar from 'rc-calendar';
import DatePicker from 'rc-calendar/lib/Picker';
import RangeRcCalendar from 'rc-calendar/lib/RangeCalendar';
import moment from 'moment';
import _CalendarLocale from 'rc-calendar/lib/locale/en_US';

import Textfield from 'components/controls/Textfield';

import style from 'styles/controls/calendar.css';
import Button from "components/controls/Button"
const format = 'MM-DD-YYYY';

const now = moment();

const defaultCalendarValue = now.clone();
defaultCalendarValue.add(-1, 'month');

const CalendarLocale = Object.assign({ }, _CalendarLocale, {
  monthFormat: 'MMMM',
});

export default class Calendar extends Component {
  style = style;
  styles = [calendarStyle];
  state = {
    value: null,
    open: false
  }

  focus() {
    this.textfield.focus();
    this.openCalendar();
  }

  onChange = (value) => {
    this.setState({ value });

    if (this.props.onChange) {
      this.props.onChange(moment(value).format(format));
    }
  }

  openCalendar = () => {
    this.refs.picker.onVisibleChange(true);
  }

  render() {
    const calendar = (
      <RcCalendar
        locale={ CalendarLocale }
        style={{ zIndex: 1000 }}
        format={ format }
        disabledTime={ null }
        timePicker={ null }
        defaultValue={ this.props.value ? moment(this.props.value, format) : defaultCalendarValue }
        showDateInput={ false }
        disabledDate={ disabledDate }
      />
    );

    let inputClassName = this.classes.input;

    if (this.props.inputClassName) {
      inputClassName += ' ' + this.props.inputClassName;
    }

    return <div className={ this.classes.box }>
      <DatePicker
        ref="picker"
        disabled={ this.props.disabled }
        calendar={ calendar }
        value={ this.state.value }
        onChange={ this.onChange }
        defaultValue={ this.props.value ? moment(this.props.value, format) : defaultCalendarValue }
      >
        {() => (
          <Textfield
            ref={ (t) => { this.textfield = t; } }
            className={ inputClassName }
            onClick={ this.openCalendar }
            readOnly
            value={ this.props.value }
            placeHolder={ this.props.placeholder }
            disabled={ this.props.disabled }
          />
        )}
      </DatePicker>
      <div className={ this.classes.icon } onClick={ this.openCalendar } />
    </div>
  }
}

export class RangeCalendar extends Component {
  style = style;
  styles = [calendarStyle];

  state = {
    selectedValue: this.props.defaultSelectedValue || [defaultCalendarValue, now],
  }

  onOk = ([startDate, endDate]) => this.props.onSelect({
    startDate: moment(startDate).startOf('day').toDate(),
    endDate: moment(endDate).endOf('day').toDate(),
  })

  onApply = () => this.calendar && this.calendar.onOk()
  onClose = () => this.props.onClose()

  renderFooter = () => (
    <footer className={this.classes.rangeCalendarFooter}>
      <Button
        className={this.classes.rangeCalendarButtonSecondary}
        contClassName={this.classes.rangeCalendarButtonInner}
        type="secondary"
        onClick={this.onClose}
      >
        Cancel
      </Button>
      <Button
        type="primary"
        className={this.classes.rangeCalendarButton}
        contClassName={this.classes.rangeCalendarButtonInner}
        onClick={this.onApply}
      >
        Apply
      </Button>
    </footer>
  )

  render() {
    return (
      <RangeRcCalendar
        ref={(ref) => this.calendar = ref}
        className={classnames(this.classes.rangeCalendar, this.props.className)}
        locale={CalendarLocale}
        timePicker={null}
        selectedValue={this.state.selectedValue}
        onChange={(v) => this.setState({ selectedValue: v })}
        onOk={this.onOk}
        showDateInput={false}
        showToday={false}
        disabledDate={this.props.disabledDate || disabledDate}
        renderFooter={this.renderFooter}
      />
    )
  }
}

function disabledDate(current) {
  if (!current) {
    // allow empty select
    return false;
  }

  const now = moment({hour: 0, minute: 0, seconds: 0, milliseconds: 0});

  return now.diff(current, 'years') > 10;  // can not select days before today
}
