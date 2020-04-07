import React from 'react';
import Component from 'components/Component';
import Page from 'components/Page';
import style from 'styles/indicators/crm-popup.css';
import CRMStyle from 'styles/indicators/crm-popup.css';
import ImportButton from 'components/pages/campaigns/ImportButton';
import SalesforceCampaignsPopup from 'components/importCampaignsPopups/SalesforceCampaignsPopup';
import AdwordsCampaignsPopup from 'components/importCampaignsPopups/AdwordsCampaignsPopup';
import FacebookCampaignsPopup from 'components/importCampaignsPopups/FacebookCampaignsPopup';
import LinkedinCampaignsPopup from 'components/importCampaignsPopups/LinkedinCampaignsPopup';
import TwitterCampaignsPopup from 'components/importCampaignsPopups/TwitterCampaignPopup';
import BingCampaignsPopup from 'components/importCampaignsPopups/BingCampaignsPopup';
import QuoraCampaignPopup from 'components/importCampaignsPopups/QuoraCampaignPopup';

export default class ImportCampaignsPopup extends Component {

  style = style;
  styles = [CRMStyle];

  render() {
    return <div hidden={this.props.hidden}>
      <Page popup={true} width={'340px'}>
        <div className={this.classes.close} onClick={this.props.close}/>
        <div className={this.classes.title}>
          Choose from where to import your campaigns
        </div>
        <div className={this.classes.inner}>
          <div className={this.classes.row}>
            <ImportButton
              setDataAsState={this.props.setDataAsState}
              close={this.props.close}
              data={this.props.salesforceapi}
              userAccount={this.props.userAccount}
              popupComponent={SalesforceCampaignsPopup}
              className={CRMStyle.locals.salesforce}
              addUnknownChannel={this.props.addUnknownChannel}
            />
          </div>
          <div className={this.classes.row}>
            <ImportButton
              setDataAsState={this.props.setDataAsState}
              close={this.props.close}
              data={this.props.googleadsapi}
              popupComponent={AdwordsCampaignsPopup}
              className={CRMStyle.locals.adwords}
            />
          </div>
          <div className={this.classes.row}>
            <ImportButton
              setDataAsState={this.props.setDataAsState}
              close={this.props.close}
              data={this.props.facebookadsapi}
              popupComponent={FacebookCampaignsPopup}
              className={CRMStyle.locals.facebookads}
            />
          </div>
          <div className={this.classes.row}>
            <ImportButton
              setDataAsState={this.props.setDataAsState}
              close={this.props.close}
              data={this.props.linkedinadsapi}
              popupComponent={LinkedinCampaignsPopup}
              className={CRMStyle.locals.linkedinads}
            />
          </div>
          <div className={this.classes.row}>
            <ImportButton
              setDataAsState={this.props.setDataAsState}
              close={this.props.close}
              data={this.props.twitteradsapi}
              popupComponent={TwitterCampaignsPopup}
              className={CRMStyle.locals.twitterads}
            />
          </div>
          <div className={this.classes.row}>
            <ImportButton
              setDataAsState={this.props.setDataAsState}
              close={this.props.close}
              data={this.props.bingadsapi}
              popupComponent={BingCampaignsPopup}
              className={CRMStyle.locals.bingads}
            />
          </div>
          <div className={this.classes.row}>
            <ImportButton
              setDataAsState={this.props.setDataAsState}
              close={this.props.close}
              data={this.props.quoraadsapi}
              popupComponent={QuoraCampaignPopup}
              className={CRMStyle.locals.quoraads}
            />
          </div>
        </div>
      </Page>
    </div>;
  }

}
