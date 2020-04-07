import React from 'react';
import PropTypes from 'prop-types';
import Component from 'components/Component';
import style from 'styles/controls/toggle.css';

export default class Toggle extends Component {

  style = style;

  static defaultProps = {
    options: [],
    selectedValue: null
  };

  static propTypes = {
    options: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.any.isRequired,
      text: PropTypes.any.isRequired
    })).isRequired,
    selectedValue: PropTypes.any.isRequired,
    onClick: PropTypes.func.isRequired,
    style: PropTypes.object
  };

  render() {
    const {options, selectedValue, onClick, style} = this.props;

    const toggles = options.map(item =>
      <div key={item.value} className={this.classes.frame} data-active={item.value === selectedValue ? true : null}
           onClick={() => onClick(item.value)}>
        <div className={this.classes.frameText}>
          {item.text}
        </div>
      </div>);

    return <div className={this.classes.inner} style={style}>
      <div className={this.classes.box}>
        {toggles}
      </div>
    </div>;
  }
}