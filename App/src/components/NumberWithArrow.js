import React from 'react';
import PropTypes from 'prop-types';
import Component from 'components/Component';
import style from 'styles/number-with-arrow.css';
import {isNil} from 'lodash';

export default class NumberWithArrow extends Component {

  style = style;

  static propTypes = {
    stat: PropTypes.any,
    isNegative: PropTypes.bool,
    arrowStyle: PropTypes.object,
    statStyle: PropTypes.object
  };

  render() {
    const {stat, isNegative, arrowStyle, statStyle} = this.props;
    const notExist = isNil(stat);
    return notExist ? null :
      <div className={this.classes.inner} data-negative={isNegative ? true : null}>
        <div className={this.classes.arrow} style={arrowStyle}/>
        <div className={this.classes.stat} style={statStyle}>
          {stat}
        </div>
      </div>;
  }
}