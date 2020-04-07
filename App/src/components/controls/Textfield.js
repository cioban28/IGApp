import React from 'react';
import ReactDOM from 'react-dom';

import Component from 'components/Component';

import style from 'styles/controls/textfield.css';
import buttonsSetStyle from 'styles/profile/buttons-set.css';

export default class Textfield extends Component {
  style = style;
  styles = [buttonsSetStyle];

  static defaultProps = {
    withValidationError: false
  };

  constructor(props) {
    super(props);

    this.state = {
      validationError: false
    };
  }

  getValue() {
    const input = ReactDOM.findDOMNode(this.refs.input);
    return input.value;
  }

  focus() {
    ReactDOM.findDOMNode(this.refs.input).focus();
  }

  validationError = () => {
    this.focus();
    this.setState({validationError: true});
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.value && nextProps.value !== this.props.value) {
      this.setState({validationError: false});
    }
  }

  render() {
    let className;

    if (this.props.className) {
      className = this.classes.box + ' ' + this.props.className;
    }
    else {
      className = this.classes.box;
    }

    let inputClassName;

    if (this.props.inputClassName) {
      inputClassName = this.classes.input + ' ' + this.props.inputClassName;
    }
    else {
      inputClassName = this.classes.input;
    }

    return <div className={className} style={this.props.style} data-with-error={this.props.withValidationError ? true : null}>
      <input type={this.props.type}
             ref="input"
             className={inputClassName}
             defaultValue={this.props.defaultValue}
             value={this.props.value}
             readOnly={this.props.readOnly}
             minLength={this.props.minLength}
             pattern={this.props.pattern}
        //type={ this.props.type }
             min={this.props.min}
             required={this.props.required}
             onClick={this.props.onClick}
             onFocus={this.props.onFocus}
             onBlur={this.props.onBlur}
             onChange={this.props.onChange}
             onKeyDown={this.props.onKeyDown}
             onKeyUp={this.props.onKeyUp}
             onKeyPress={this.props.onKeyPress}
             onInput={this.props.onInput}
             placeholder={this.props.placeHolder}
             disabled={this.props.disabled}
      />
      { this.props.withValidationError
        ? <div className={this.classes.validationErrorWrapper} data-disabled={!this.state.validationError ? true: null}>
            <div className={buttonsSetStyle.locals.validationError}/>
          </div>
        : null}
    </div>;
  }
}