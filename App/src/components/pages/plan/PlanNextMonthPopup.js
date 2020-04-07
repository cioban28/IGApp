import React from 'react';
import Component from 'components/Component';

import style from 'styles/profile/product-launch-popup.css';
import Button from 'components/controls/Button';
import Dropdown from 'components/controls/Dropdown';

export default class PlanNextMonthPopup extends Component {
  style = style;

  render() {
    const $ = this.classes;
    let style;

    if (this.props.hidden) {
      style = { display: 'none' };
    }

    return <div className={ $.box } style={ style }>
      <div className={ $.title }>
        Are you sure?
      </div>

      <div className={ $.nav } style={{ marginTop: '25px' }}>
        <Button type="secondary" style={{
          width: '100px',
          marginRight: '20px'
        }} onClick={ this.props.onBack }>
          Cancel
        </Button>
        <Button type="primary" style={{
          width: '100px'
        }} onClick={ this.props.onNext }>
          I'm sure
        </Button>
      </div>
    </div>
  }
}