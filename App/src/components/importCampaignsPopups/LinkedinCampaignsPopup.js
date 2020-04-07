import React from 'react';
import Component from 'components/Component';
import CampaignsImportPopup from 'components/importCampaignsPopups/CampaignsImportPopup';

export default class LinkedinCampaignsPopup extends Component {

  open = () => {
    this.refs.campignImportRef.open();
  };

  render() {
    return <CampaignsImportPopup ref='campignImportRef'
                                 title='Choose Linkedin Ads Account'
                                 api='linkedinadsapi'
                                 platformTitle='LinkedIn Ads'
                                 {...this.props}
    />;
  }
}