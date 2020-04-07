import React from 'react';
import Component from 'components/Component';
import CampaignsImportPopup from 'components/importCampaignsPopups/CampaignsImportPopup';

export default class BingCampaignsPopup extends Component {

  open = () => {
    this.refs.campignImportRef.open();
  };

  render() {
    return <CampaignsImportPopup ref='campignImportRef'
                                 api='bingadsapi'
                                 accountIdPropertyName='accountId'
                                 accountLabelPropertyName='accountName'
                                 title='Choose Bing Account'
                                 platformTitle='Bing Ads'
                                 {...this.props}
    />;
  }
}
