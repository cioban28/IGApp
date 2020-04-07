import React from 'react';
import Component from 'components/Component';
import CampaignsImportPopup from 'components/importCampaignsPopups/CampaignsImportPopup';

export default class FacebookCampaignsPopup extends Component {

  open = () => {
    this.refs.campignImportRef.open();
  };

  render() {
    return <CampaignsImportPopup ref='campignImportRef'
                                 title='Choose Facebook Account'
                                 api='facebookadsapi'
                                 platformTitle='Facebook Ads'
                                 {...this.props}
    />;
  }
}