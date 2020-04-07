import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Component from 'components/Component';
import style from 'styles/controls/custom-checkbox.css';

export default class CustomCheckbox extends Component {

  style = style;

  static propTypes = {
    children: PropTypes.node,
    onChange: PropTypes.func.isRequired,
    style: PropTypes.object,
    checkboxStyle: PropTypes.object,
    checked: PropTypes.bool,
    checkedIcon: PropTypes.string,
    className: PropTypes.string,
    checkboxClassName: PropTypes.string,
    checkMarkClassName: PropTypes.string,
    childrenClassName: PropTypes.string
  };

  static defaultProps = {
    checked: false
  };

  render() {
    const {
      style,
      checkboxStyle,
      checked,
      checkedIcon,
      children,
      onChange,
      className,
      checkboxClassName,
      checkMarkClassName,
      childrenClassName
    } = this.props;

    return <div className={classnames(this.classes.container, className)} style={style}>
      <div className={classnames(this.classes.checkbox, checkboxClassName)} style={checkboxStyle} data-checked={checked ? true : null}>
        <div className={classnames(this.classes.checkMark, checkMarkClassName)} hidden={!checked}
             data-icon={checkedIcon || 'checkbox:checked'}/>
        <input type='checkbox' className={this.classes.input} checked={checked} onChange={onChange}/>
      </div>
      <div className={classnames(this.classes.children, childrenClassName)} data-checked={checked ? true : null}>
        {children}
      </div>
    </div>;
  }
}

