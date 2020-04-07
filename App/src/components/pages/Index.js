import React from 'react';

import Component from 'components/Component';
import Header from 'components/Header';
import Sidebar from 'components/Sidebar';
import Page from 'components/Page';

import Title from 'components/onboarding/Title';
import Button from 'components/controls/Button';

import onboardingStyle from 'styles/onboarding/onboarding.css';
import tagsStyle from 'styles/tags.css';

import history from 'history';
import { Link } from 'react-router';
import global from 'global';

import { isPopupMode } from 'modules/popup-mode';

export default class SignIn extends Component {
  // style = style
  styles = [onboardingStyle, tagsStyle]

  state = {}

  render() {
    return <div>
      <Header user={ false } />
      <Page popup={ isPopupMode() } sidebar={ false } width="600px" centered>
        <Title title="Index" />
        <div>
          <div style={{
            margin: '12px 0'
          }}>
            <Link to="/profile" className={ tagsStyle.locals.a }>Profile</Link>
          </div>
          <div style={{
            margin: '12px 0'
          }}>
            <Link to="/welcome" className={ tagsStyle.locals.a }>Welcome page</Link>
          </div>
          <div style={{
            margin: '12px 0'
          }}>
            <Link to="/preferences" className={ tagsStyle.locals.a }>Preferences</Link>
          </div>
          <div style={{
            margin: '12px 0'
          }}>
            <Link to="/target-audience" className={ tagsStyle.locals.a }>Target Audience</Link>
          </div>
          <div style={{
            margin: '12px 0'
          }}>
            <Link to="/indicators" className={ tagsStyle.locals.a }>Indicators</Link>
          </div>
          <div style={{
            margin: '12px 0'
          }}>
            <Link to="/manual" className={ tagsStyle.locals.a }>Manual</Link>
          </div>
          <div style={{
            margin: '12px 0'
          }}>
            <Link to="/sign-in" className={ tagsStyle.locals.a }>Sign in</Link>
          </div>
          <div style={{
            margin: '12px 0'
          }}>
            <Link to="/plan" className={ tagsStyle.locals.a }>Plan</Link>
          </div>
          { !isPopupMode() ?
            <div style={{
              marginTop: '32px'
            }}>
              <Button type="secondary" onClick={() => {
                window.location.href = '/?popup';
              }}>Enable Popup Mode</Button>
            </div>
          : null }
          { isPopupMode() ?
            <div style={{
              marginTop: '32px'
            }}>
              <Button type="secondary" onClick={() => {
                window.location.href = '/';
              }}>Disable Popup Mode</Button>
            </div>
          : null }
        </div>
      </Page>
    </div>
  }
}