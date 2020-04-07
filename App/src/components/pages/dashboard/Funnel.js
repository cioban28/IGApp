import React from 'react';
import Component from 'components/Component';
import Column from 'components/pages/dashboard/Column';
import Arrow from 'components/pages/dashboard/Arrow';
import Circle from 'components/pages/dashboard/Circle';
import style from 'styles/dashboard/funnel.css';
import {getNickname} from 'components/utils/indicators';

export default class Funnel extends Component {

  style = style;

  render() {
    const funnel = {
      MCL: {
        value: this.props.MCL,
        title: getNickname('MCL'),
        fillColor: '#0099cc',
        backgroundColor: 'rgba(0, 153, 204, 0.1)'
      },
      MQL: {
        value: this.props.MQL,
        title: getNickname('MQL'),
        fillColor: '#0099ccb3',
        backgroundColor: 'rgba(0, 153, 204, 0.1)'
      },
      SQL: {
        value: this.props.SQL,
        title: getNickname('SQL'),
        fillColor: '#0099cc4d',
        backgroundColor: 'rgba(0, 153, 204, 0.1)'
      },
      opps: {
        value: this.props.opps,
        title: getNickname('opps'),
        fillColor: '#33cc33b3',
        backgroundColor: 'rgba(50, 204, 50, 0.1)'
      }
    };
    // Find max value for the columns height
    const maxValue = Math.max.apply(null, Object.keys(funnel).map(item => funnel[item].value));
    const funnelObject = Object.keys(funnel)
      .filter(item => funnel[item].value >= 0)
      .map((item, index, values) => {
        return <div className={this.classes.inner} key={index}>
          <Column {... funnel[item]} maxValue={maxValue}
                  maxHeight={this.props.columnHeight}
                  width={this.props.columnWidth}
                  titleStyle={this.props.titleStyle}/>
          <Arrow
            value={index + 1 == values.length ? this.props.users / funnel[item].value : funnel[values[index + 1]].value / funnel[item].value}/>
        </div>;
      });

    return <div className={this.classes.inner}>
      {funnelObject}
      <Circle value={this.props.users} title={getNickname('users')}/>
      <div className={this.classes.line} style={{marginTop: `${this.props.columnHeight}px`}}/>
    </div>;
  }

}