import React from 'react';

import Component from 'components/Component';

import CampaignSummary from 'components/pages/campaigns/CampaignSummary';
import ChannelRectangle from 'components/pages/campaigns/ChannelRectangle';

import style from 'styles/campaigns/channel-campaigns.css';

export default class ChannelCampaigns extends Component {

  style = style;

  constructor(props) {
    super(props);
    this.state = {
      showCampaigns: false
    };
  }

  render() {
    const { campaigns } = this.props;
    const runningCampaigns = campaigns ?
      campaigns.map((campaign, index) => {
        return <CampaignSummary
          key={this.props.channel + index}
          index={index}
          campaign={ campaign }
          channelIcon={ this.props.channelIcon }
          channel={ [this.props.channel] }
          showCampaign={ this.props.showCampaign }
        />
      })
      : null ;
    const numberOfCampaigns = runningCampaigns ? runningCampaigns.length : 0;
    return <div>
      <ChannelRectangle
        channelTitle = { this.props.channelTitle }
        channelBudget = { this.props.channelBudget }
        channelIcon={ this.props.channelIcon }
        onClick={ ()=> { this.setState({showCampaigns: !this.state.showCampaigns}) } }
        numberOfCampaigns={ numberOfCampaigns }
      />
      <div hidden={ !this.state.showCampaigns }>
        <div>
          { runningCampaigns }
          <div className={ this.classes.plusBox }>
            <div className={ this.classes.plus } onClick={ () => { this.props.addNewCampaign({source: this.props.channel ? [this.props.channel] : []}) } }>
              +
            </div>
          </div>
        </div>
      </div>
    </div>
  }

}
