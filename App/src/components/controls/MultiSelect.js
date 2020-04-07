import React from 'react';
import Component from 'components/Component';

import ReactSelect from 'react-select-plus';

import Label from 'components/ControlsLabel';

import style from 'react-select-plus/dist/react-select-plus.css';

export default class MultiSelect extends Component {
  style = style;

  static defaultProps = {
    labelQuestion: false,
    style: {
      width: '460px',
      fontSize: '14px'
    }
  };

  focus() {
    this.refs.input.focus();
  }

  render() {
    let label;

    if (this.props.label) {
      label =
        <Label question={this.props.labelQuestion} description={this.props.description}>{this.props.label}</Label>;
    }

    const select = this.props.select;

    return <div style={this.props.style} className={this.props.className}>
      {label}
      <ReactSelect {...select}
                   ref="input"
                   value={this.props.selected}
                   multi={true}
                   openOnFocus={true}
                   onChange={this.props.onChange}
                   placeholder={this.props.placeholder}
                   disabled={this.props.disabled}
                   closeOnSelect={false}
                   style={{
                     background: 'linear-gradient(to bottom, #ffffff 0%, #f1f3f7 100%)',
                     border: '1px solid #ced0da',
                     color: '#535b69'
                   }}/>
    </div>;
  }
}