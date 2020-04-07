import React from 'react';
import Component from 'components/Component';

import style from 'styles/profile/market-fit-popup.css';
import Button from 'components/controls/Button';

export default class OrientationPopup extends Component {
  style = style;
  state = {
    choosen: true
  };

  render() {
    const $ = this.classes;
    let style;

    if (this.props.hidden) {
      style = { display: 'none' };
    }

    return <div className={ $.box } style={ style }>
      <div className={ $.title }>
        Have you reached product/market fit?
      </div>

      <div className={ $.choose }>
        <Button type="secondary" selected={ this.state.choosen } style={{
          width: '64px',
          marginRight: '10px'
        }} onClick={() => {
          this.setState({
            choosen: true
          });
        }}>Yes</Button>
        <Button type="secondary" selected={ !this.state.choosen } style={{
          width: '64px'
        }} onClick={() => {
          this.setState({
            choosen: false
          });
        }}>No</Button>
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