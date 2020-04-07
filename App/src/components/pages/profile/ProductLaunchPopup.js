import React from 'react';
import Component from 'components/Component';

import style from 'styles/profile/product-launch-popup.css';
import Button from 'components/controls/Button';
import Dropdown from 'components/controls/Dropdown';

export default class LifeCyclePopup extends Component {
  style = style;

  render() {
    const $ = this.classes;
    let style;

    if (this.props.hidden) {
      style = { display: 'none' };
    }

    return <div className={ $.box } style={ style }>
      <div className={ $.title }>
        When was your product launch?
      </div>

      <div className={ $.choose }>
        <Button style={{
          width: '68px'
        }}>
          3
          <div className={ $.rangeIcon } />
        </Button>
        <Dropdown style={{
          margin: '0 10px',
          width: '108px'
        }} select={{
          name: 'duration',
          onChange: () => {},
          options: [
            { val: 'days', label: 'Days' },
            { val: 'months', label: 'Months' },
            { val: 'years', label: 'Years' }
          ]
        }} selected={ 1 } />
        <div className={ $.text }>
          ago
        </div>
      </div>

      <div className={ $.nav }>
        <Button type="secondary" style={{
          width: '100px',
          marginRight: '20px'
        }} onClick={ this.props.onBack }>
          <div className={ $.backIcon } />
          BACK
        </Button>
        <Button type="primary" style={{
          width: '100px'
        }} onClick={ this.props.onNext }>
          NEXT
          <div className={ $.nextIcon } />
        </Button>
      </div>
    </div>
  }
}