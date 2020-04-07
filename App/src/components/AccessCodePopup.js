import React from 'react';
import Component from 'components/Component';
import Page from 'components/Page';
import Title from 'components/onboarding/Title';
import Textfield from 'components/controls/Textfield';
import style from 'styles/onboarding/onboarding.css';
import Button from 'components/controls/Button';
import serverCommunication from 'data/serverCommunication';
import history from 'history';
import { temporaryEnablePopupMode } from 'modules/popup-mode'
import AuthService from 'components/utils/AuthService';
import Notice from 'components/Notice';

export default class AccessCodePopup extends Component {

  style = style;

  constructor(props) {
    super(props);
    this.state = {
      accessCode: ''
    };
    this.createUserAccount = this.createUserAccount.bind(this);
  }

  handleChange(event) {
    this.setState({accessCode: event.target.value});
  }

  createUserAccount() {
    let self = this;
    serverCommunication.serverRequest('POST', 'useraccount', JSON.stringify({ accessCode: this.state.accessCode}))
      .then(function (data) {
        if (data.ok){
          temporaryEnablePopupMode();
          history.push('/welcome');
        }
        else {
          self.setState({error: true});
        }
      })
      .catch(function (err) {
        console.log(err);
      });
  }

  render(){
    return <div hidden={ this.props.hidden }>
      <Page popup={ true } width={'300px'}>
        <Title title="Accss Code"/>
        <div className={ this.classes.row }>
          <Textfield value={ this.state.accessCode } required={ true } onChange={ this.handleChange.bind(this)} ref="name"/>
        </div>
        <div className={ this.classes.row } hidden={ !this.state.error }>
          <Notice warning>
            Wrong access code. Please provide the invitation code you got from InfiniGrow
          </Notice>
        </div>
        <div className={ this.classes.footer } style={{ justifyContent: 'center' }}>
            <Button type="primary" style={{ width: '100px' }} onClick={ this.createUserAccount }>Enter</Button>
        </div>
      </Page>
    </div>
  }

}