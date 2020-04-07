import React from 'react';
import Component from 'components/Component';

import style from 'styles/profile/product-launch-popup.css';
import Button from 'components/controls/Button';

export default class DeleteChannelPopup extends Component {
  style = style;

  render() {
    const $ = this.classes;
    let style;

    if (this.props.hidden) {
      style = { display: 'none' };
    }

    return <div className={ $.box } style={ style }>
      <div className={ $.choose }>
        Are you sure you want to delete this channel?
      </div>

      <div className={ $.nav }>
        <Button type="secondary" style={{
          width: '100px',
          marginRight: '20px'
        }} onClick={ this.props.onBack }>
          No
        </Button>
        <Button type="primary" style={{
          width: '100px'
        }} onClick={ this.props.onNext }>
          Yes
        </Button>
      </div>
    </div>
  }
}