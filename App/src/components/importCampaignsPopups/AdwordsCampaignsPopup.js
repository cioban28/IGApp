import React from 'react';
import Component from 'components/Component';
import CampaignsImportPopup from 'components/importCampaignsPopups/CampaignsImportPopup';

export default class AdwordsCampaignsPopup extends Component {

  open = () => {
    this.refs.campignImportRef.open();
  };

  render() {
    return <CampaignsImportPopup ref='campignImportRef'
                                 title='Google AdWords - choose customer'
                                 api='googleadsapi'
                                 accountIdPropertyName='customerId'
                                 accountLabelPropertyName='descriptiveName'
                                 serverAccountIDPropertyName='customerId'
                                 platformTitle='Google Adwords'
                                 {...this.props}
    />;
  }
}