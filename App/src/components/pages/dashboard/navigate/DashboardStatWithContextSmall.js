import React from 'react';
import PropTypes from 'prop-types';
import Component from 'components/Component';
import style from 'styles/dashboard/navigate/dashboard-stat-with-context-small.css';
import NumberWithArrow from 'components/NumberWithArrow';

export default class DashboardStatWithContextSmall extends Component {

  style = style;

  static propTypes = {
    value: PropTypes.any,
    sign: PropTypes.any,
    name: PropTypes.string
  };

  render() {
    const {value, sign, name, ...contextProps} = this.props;
    return <div className={this.classes.outer}>
      <div className={this.classes.statValue}>
        {value}
        <div className={this.classes.statSign}>
          {sign}
        </div>
      </div>
      <div style={{marginTop: '5px'}}>
        <NumberWithArrow {...contextProps}/>
      </div>
      <div className={this.classes.statName}>
        {name}
      </div>
    </div>;
  }
}