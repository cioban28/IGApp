import React from 'react';
import Component from 'components/Component';

import ChannelCampaigns from 'components/pages/campaigns/ChannelCampaigns';
import ReactDOM from 'react-dom';

import style from 'styles/campaigns/by-channel-tab.css';

export default class ByChannelTab extends Component {

  style = style;

  static defaultProps = {
    filteredCampaigns: [],
    monthBudget: 0,
  };

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    if (this.props.location.query.hash) {
      const domElement = ReactDOM.findDOMNode(this.refs[this.props.location.query.hash]);
      if (domElement) {
        domElement.scrollIntoView({});
      }
    }
  }

  render() {
    const { processedChannels: channels, showCampaign, filteredCampaigns, addNewCampaign } = this.props;

    const page = channels.names.sort().map((channel) => (
      <ChannelCampaigns
        channelTitle = { channels.titles[channel] }
        channelBudget = { channels.budgets[channel] }
        key = { channel }
        channel={ channel }
        campaigns={ filteredCampaigns.filter(item => item.source.includes(channel)) }
        channelIcon={ channels.icons[channel] }
        showCampaign={ showCampaign }
        addNewCampaign={ addNewCampaign }
        ref={channel}
      />
    ));

    return (
      <div className={ this.classes.wrap }>
        <ChannelCampaigns
          channelTitle = "Multi Channel Campaigns"
          channelBudget = {0}
          channel={null}
          campaigns={ filteredCampaigns.filter(item => item.source.length > 1) }
          channelIcon="plan:multiChannel"
          showCampaign={ showCampaign }
          addNewCampaign={ addNewCampaign }
        />
        { page }
      </div>
    )
  }

}