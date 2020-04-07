import React from 'react';
import Component from 'components/Component';
import Page from 'components/Page';
import style from 'styles/onboarding/onboarding.css';
import Button from 'components/controls/Button';
import { temporaryEnablePopupMode } from 'modules/popup-mode'
export default class UnsavedPopup extends Component {

  style = style;

  callback(userAnswer) {
    this.props.callback(userAnswer);
  }

  render(){
    return <div hidden={ this.props.hidden }>
      <Page popup={ true } width={'370px'}>
          <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '15px', textAlign: 'center' }}>
            Your changes have not been saved.
          </div>
          <div style={{ fontSize: '15px', marginBottom: '32px', textAlign: 'center'}}>
            Are you sure you want to leave this page?
          </div>
        <div className={ this.classes.footer } style={{ justifyContent: 'center' }}>
          <Button type="secondary" style={{ width: '100px', marginRight: '9px' }} onClick={ this.callback.bind(this, true) }>Leave</Button>
          <Button type="primary" style={{ width: '100px', marginLeft: '9px' }} onClick={ this.callback.bind(this, false) }>Stay</Button>
        </div>
      </Page>
    </div>
  }

}