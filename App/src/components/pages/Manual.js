import React from 'react';

import Component from 'components/Component';
import Header from 'components/Header';
import Sidebar from 'components/Sidebar';
import Page from 'components/Page';

import Select from 'components/controls/Select';
import Textfield from 'components/controls/Textfield';
import Calendar from 'components/controls/Calendar';
import Button from 'components/controls/Button';
import Label from 'components/ControlsLabel';

import Title from 'components/onboarding/Title';
import ProfileProgress from 'components/pages/profile/Progress';
import ProfileInsights from 'components/pages/profile/Insights';
import BackButton from 'components/pages/profile/BackButton';
import NextButton from 'components/pages/profile/NextButton';
import NotSure from 'components/onboarding/NotSure';

import style from 'styles/onboarding/onboarding.css';

import { isPopupMode } from 'modules/popup-mode';
import history from 'history';

export default class Manual extends Component {
  style = style

  render() {
    const selects = {
      event_type: {
        label: 'Event Type',
        select: {
          name: 'event_type',
          onChange: () => {},
          options: [
            { label: 'Software release' },
            { label: 'Funding' },
          ]
        }
      }
    };

    return <div>
      <Header />
      <Sidebar />
      <Page popup={ isPopupMode() }>
        <Title title="Manual" subTitle=" Do you have any upcoming events / campaigns? Let us know it so that we can implement it to your new strategy" />
        <div className={ this.classes.cols }>
          <div className={ this.classes.colLeft }>
            <h3>Events</h3>
            <div className={ this.classes.row } style={{
              width: '258px'
            }}>
              <Select { ... selects.event_type } />
            </div>
            <div className={ this.classes.row } style={{
              width: '258px'
            }}>
              <Label question>Start Date</Label>
              <Calendar />
            </div>
            <div className={ this.classes.row } style={{
              width: '258px'
            }}>
              <Label question>End Date</Label>
              <Calendar />
            </div>

            <h3>Planned Campaigns</h3>
            <div className={ this.classes.row } style={{
              width: '258px'
            }}>
              <Label>Campaign name</Label>
              <Textfield defaultValue="" />
            </div>
            <div className={ this.classes.row }>
              <Label question>Plan Annual Budge ($)</Label>
              <Textfield defaultValue="$" style={{
                width: '166px'
              }} />
            </div>
            <div className={ this.classes.row } style={{
              width: '258px'
            }}>
              <Label question>Start Date</Label>
              <Calendar />
            </div>
            <div className={ this.classes.row } style={{
              width: '258px'
            }}>
              <Label question>End Date</Label>
              <Calendar />
            </div>
          </div>

          { isPopupMode() ?

          <div className={ this.classes.colRight }>
            <div className={ this.classes.row }>
              <ProfileProgress progress={ 81 } image={
                require('assets/flower/4.png')
              }
              text="You rock!"/>
            </div>
            <div className={ this.classes.row }>
              <ProfileInsights />
            </div>
          </div>

          : null }
        </div>

        { isPopupMode() ?

        <div className={ this.classes.footerCols }>
          <div className={ this.classes.footerLeft }>
            <Button type="secondary" style={{
              letterSpacing: '0.075',
              width: '150px'
            }} onClick={() => {
              history.push('/indicators');
            }}>Skip this step</Button>
          </div>
          <div className={ this.classes.footerRight }>
            <BackButton onClick={() => {
              history.push('/preferences');
            }} />
            <div style={{ width: '30px' }} />
            <NextButton onClick={() => {
              history.push('/indicators');
            }} />
          </div>
        </div>

        : null }
      </Page>
    </div>
  }
}