import React from 'react';
import Component from 'components/Component';
import Page from 'components/Page';
import style from 'styles/indicators/crm-popup.css';
import HubspotAutomaticPopup from 'components/pages/indicators/HubspotAutomaticPopup';
import SalesforceAutomaticPopup from 'components/pages/indicators/SalesforceAutomaticPopup';
import CRMStyle from 'styles/indicators/crm-popup.css';

export default class CRMPopup extends Component {

  style = style;
  styles = [CRMStyle];

  render() {
    return <div hidden={this.props.hidden}>
      <HubspotAutomaticPopup setDataAsState={this.props.setDataAsState}
                             close={this.props.close}
                             data={this.props.hubspotapi}
                             updateState={this.props.updateState}
                             ref="hubspot"/>
      <SalesforceAutomaticPopup setDataAsState={this.props.setDataAsState}
                                close={this.props.close}
                                data={this.props.salesforceapi}
                                ref="salesforce"/>
      <Page popup={true} width={'340px'} style={{zIndex: '9'}}>
        <div className={this.classes.close} onClick={this.props.close}/>
        <div className={this.classes.title}>
          Choose your main CRM platform
        </div>
        <div className={this.classes.inner}>
          <div className={this.classes.row}>
            <div className={CRMStyle.locals.hubspot} onClick={() => {
              this.refs.hubspot.open();
            }}/>
          </div>
          <div className={this.classes.row}>
            <div className={CRMStyle.locals.salesforce} onClick={() => {
              this.refs.salesforce.open();
            }}/>
          </div>
        </div>
      </Page>
    </div>;
  }

}