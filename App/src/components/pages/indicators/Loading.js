/**
 * Created by Dor on 01/08/2017.
 */
import React from 'react';
import Component from 'components/Component';
import style from 'styles/indicators/loading.css';

export default class Loading extends Component {

  style = style;

  render() {
    return <div className={this.classes.frame + ' ' + (this.props.className || '')}>
      <div className={this.classes.top}>
        <div className={this.classes.topInner}>
          <div className={this.classes.title}>
            Loading data from
          </div>
          <div className={this.classes.icon} data-icon={this.props.icon}/>
        </div>
      </div>
      <div className={this.classes.bottom}>
        <div className={this.classes.gif}/>
      </div>
    </div>;
  }
}