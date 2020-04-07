import React from 'react';
import Component from 'components/Component';
import style from 'styles/plan/planned-actual-tab.css';
import copy from 'copy-to-clipboard';
import buttonsStyle from 'styles/onboarding/buttons.css';
import trackingStyle from 'styles/campaigns/tracking.css';
import Textfield from 'components/controls/Textfield';
import Table from 'components/controls/Table';

export default class TrackingPlan extends Component {

  style = style;
  styles = [buttonsStyle, trackingStyle];

  static defaultProps = {
    campaigns: []
  };

  constructor(props) {
    super(props);
    this.state = {
      copied: ''
    };
  }

  copy(value) {
    this.setState({copied: ''});
    copy(value);
    this.setState({copied: value});
  }

  render() {
    const {campaigns} = this.props;
    let data = [];

    campaigns
      .filter(campaign => campaign.isArchived !== true)
      .forEach((campaign) => {
        campaign.tracking && campaign.tracking.urls && campaign.tracking.urls.forEach((url, index) => {
          data.push({
            utm: campaign.tracking.utms[index],
            campaign,
            url,
          })
        })
      })

    return (
      <div style={{margin: -15}}>
        <Table
          data={data}
          columns={[
            {
              id: 'CampaignName',
              header: 'Campaign Name',
              cell: 'campaign.name',
              fixed: 'left',
              minWidth: 200,
            },
            {
              id: 'CampaignSource',
              header: 'Campaign Source',
              cell: 'utm.source',
            },
            {
              id: 'CampaignMedium',
              header: 'Campaign Medium',
              cell: 'utm.medium',
            },
            {
              id: 'ShortenedTrackingURL',
              header: 'Shortened Tracking URL',
              cell: ({ url }) => (
                <div style={{padding: '0 5px', marginBottom: '7px'}}>
                  <Textfield inputClassName={trackingStyle.locals.urlTextbox} style={{width: '250px'}} value={url.short}
                             readOnly={true} onFocus={(e) => e.target.select()}/>
                  <div className={trackingStyle.locals.copyToClipboard} onClick={() => this.copy(url.short)}
                       style={{marginTop: '-26px', marginLeft: '221px'}}
                       data-checked={this.state.copied === url.short ? true : null}/>
                </div>
              ),
              minWidth: 270,
            },
            {
              id: 'FullTrackingURL',
              header: 'Full Tracking URL',
              cell: ({ url }) => (
                <div style={{padding: '0 5px', marginBottom: '7px'}}>
                  <Textfield inputClassName={trackingStyle.locals.urlTextbox} style={{width: '250px'}} value={url.long}
                             readOnly={true} onFocus={(e) => e.target.select()}/>
                  <div className={trackingStyle.locals.copyToClipboard} onClick={() => this.copy(url.long)}
                       style={{marginTop: '-26px', marginLeft: '221px'}}
                       data-checked={this.state.copied === url.long ? true : null}/>
                </div>
              ),
              minWidth: 270,
            },
            {
              id: 'CreateDate',
              header: 'Create Date',
              cell: ({ url }) => new Date(url.createDate).toLocaleDateString()
            },
          ]}
        />
      </div>
    );
  }
}