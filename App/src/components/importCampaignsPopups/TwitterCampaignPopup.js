import React from 'react';
import Component from 'components/Component';
import CampaignsImportPopup from 'components/importCampaignsPopups/CampaignsImportPopup';

export default class TwitterCampaignsPopup extends Component {

  open = () => {
    this.refs.campignImportRef.open();
  };

  render() {
    return <CampaignsImportPopup ref='campignImportRef'
                                 api='twitteradsapi'
                                 title='Choose Twitter Account'
                                 platformTitle='Twitter Ads'
                                 {...this.props}
    />;
  }
}