import React from 'react';
import Component from 'components/Component';
import Page from 'components/Page';
import style from 'styles/indicators/crm-popup.css';
import GoogleAutomaticPopup from 'components/pages/indicators/GoogleAutomaticPopup';
import CRMStyle from 'styles/indicators/crm-popup.css';

export default class AnalyticsPopup extends Component {

  style = style;
  styles = [CRMStyle];

  render() {
    return <div>
      <div hidden={this.props.hidden}>
        <GoogleAutomaticPopup setDataAsState={this.props.setDataAsState}
                              close={this.props.close}
                              data={this.props.googleapi}
                              ref="googleAnalytics"/>
        <Page popup={true} width={'340px'} style={{zIndex: '9'}}>
          <div className={this.classes.close} onClick={this.props.close}/>
          <div className={this.classes.inner}>
            <div className={this.classes.row}>
              <div className={CRMStyle.locals.googleAnalytics} onClick={() => {
                this.refs.googleAnalytics.open();
              }}/>
            </div>
          </div>
        </Page>
      </div>
    </div>;
  }

}