import React from 'react';
import Component from 'components/Component';
import style from 'styles/indicators/marketing-app.css';

export default class MarketingApp extends Component {

  style = style;

  static defaultProps = {
    disabled: false
  };

  render(){
    return <div className={this.classes.square}>
      <div className={this.classes.inner}>
        <input type="checkbox" disabled={this.props.disabled ? true : null} onChange={ this.props.onChange } checked={ this.props.checked } className={this.classes.checkbox}/>
        <div className={this.classes.platformIcon} data-icon={this.props.icon}/>
        <div className={this.classes.platformText}>
          {this.props.title}
        </div>
      </div>
    </div>
  }
}