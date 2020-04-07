import React from 'react';
import Component from 'components/Component';
import CampaignsImportPopup from 'components/importCampaignsPopups/CampaignsImportPopup';

export default class QuoraCampaignPopup extends Component {

  open = () => {
    this.refs.campignImportRef.open();
  };

  render() {
    return <CampaignsImportPopup ref='campignImportRef'
                                 api='quoraadsapi'
                                 accountIdPropertyName='accountId'
                                 accountLabelPropertyName='accountName'
                                 title='Choose Quora Account'
                                 platformTitle='Quora Ads'
                                 {...this.props}
    />;
  }
}
