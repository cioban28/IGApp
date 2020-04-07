import React, { Component } from 'react';
import isEqual from 'lodash/isEqual'
import cloneDeep from 'lodash/cloneDeep'

import Board from './Board/Board'

import styles from 'styles/campaigns/by-status-tab.css';

const initialOrder = -1;
const getCampaignOrder = (campaign) => campaign.order !== undefined ? campaign.order : initialOrder

export default class ByChannelTab extends Component {

  static defaultProps = {
    filteredCampaigns: [],
  };

  state = {
    lists: [],
  };

  componentDidMount() {
    this.setState({
      lists: this.getLists()
    });
  }

  componentWillReceiveProps(nextProps) {
    const isChannelsEqual = isEqual(nextProps.processedChannels, this.props.processedChannels);
    const isCampaignsEqual = isEqual(nextProps.filteredCampaigns, this.props.filteredCampaigns);

    if (!isChannelsEqual || !isCampaignsEqual) {
      this.setState({
        lists: this.getLists(nextProps)
      });
    }
  }

  get campaigns() {
    return this.props.filteredCampaigns;
  }

  getLists(props = this.props) {
    const { processedChannels, filteredCampaigns: campaigns } = props;
    const cards = processedChannels.names.map(name => ({
      id: name,
      status: 'New',
      name,
      budget: processedChannels.budgets[name],
      campaignsBudget: 0,
      title: processedChannels.titles[name],
      icon: processedChannels.icons[name],
      campaigns: [],
      order: initialOrder,
    }));
    cards.splice(0, 1, {
      id: "multi channel",
      status: 'New',
      name: null,
      budget: 0,
      campaignsBudget: 0,
      title: "Multi Channel Campaigns",
      icon: "plan:multiChannel",
      campaigns: []
    });
    const lists = [
      {
        id: 'New',
        name: 'New',
        cards: cards
      },
      {
        id: 'Assigned',
        name: 'Assigned',
        cards: []
      },
      {
        id: 'In Progress',
        name: 'In Progress',
        cards: []
      },
      {
        id: 'In Review',
        name: 'In Review',
        cards: []
      },
      {
        id: 'Approved',
        name: 'Approved',
        cards: []
      },
      {
        id: 'Completed',
        name: 'Completed',
        cards: []
      },
      {
        id: 'On Hold',
        name: 'On Hold',
        cards: []
      },
      {
        id: 'Rejected',
        name: 'Rejected',
        cards: []
      },
    ];

    campaigns.forEach(campaign => {
      const extendedCampaign = { ...campaign, id: `${campaign.index}`};
      const list = lists.find(l => l.name === campaign.status);
      if (campaign.source.length > 1) {
        if (list) {
          const channelInList = list.cards.find(chnl => chnl.name === null);

          if (channelInList) {
            if (channelInList.order === initialOrder) {
              channelInList.order = getCampaignOrder(campaign)
            }
            channelInList.campaignsBudget += campaign.actualSpent || campaign.budget || 0;
            channelInList.campaigns.push(extendedCampaign);
          } else {
            list.cards.push({
              id: "multi channel",
              status: campaign.status,
              name: null,
              title: "Multi Channel Campaigns",
              icon: "plan:multiChannel",
              budget: 0,
              campaignsBudget: campaign.actualSpent || campaign.budget || 0,
              campaigns: [extendedCampaign],
              order: getCampaignOrder(campaign)
            });
          }
        }
      }
      campaign.source.forEach(source => {
        if (list) {
          const channelInList = list.cards.find(chnl => chnl.name === source);

          if (channelInList) {
            if (channelInList.order === initialOrder) {
              channelInList.order = getCampaignOrder(campaign)
            }
            channelInList.campaignsBudget += campaign.actualSpent || campaign.budget || 0;
            channelInList.campaigns.push(extendedCampaign);
          } else {
            list.cards.push({
              id: source,
              status: campaign.status,
              name: source,
              title: processedChannels.titles[source],
              icon: processedChannels.icons[source],
              budget: processedChannels.budgets[source],
              campaignsBudget: campaign.actualSpent || campaign.budget || 0,
              campaigns: [extendedCampaign],
              order: getCampaignOrder(campaign)
            });
          }
        }
      });
    });

    lists.forEach((list) => {
      list.cards
        .sort((a, b) => {
          if (a.campaigns.length && !b.campaigns.length) {
            return -1
          }

          if (!a.campaigns.length && b.campaigns.length) {
            return 1
          }

          return a.order - b.order
        })
        .forEach((card, index) => {
          if (card.order === initialOrder) {
            card.order = index
          }
        })
    })

    return lists
  }

  updateCampaignsTemplates = (templateName, template) => {
    let campaignsTemplates = { ...this.props.campaignsTemplates, [templateName]: template };

    return this.props.updateCampaignsTemplates(campaignsTemplates);
  };

  handleCampaignsOrderChange = (updates) => {
    const newCampaigns = cloneDeep(this.props.filteredCampaigns);

    updates.forEach(({ id, status, order }) => {
      const campaign = newCampaigns.find(cmgn => cmgn.index === parseInt(id));

      if (campaign) {
        if (status !== undefined) {
          campaign.status = status;
        }

        if (order !== undefined) {
          campaign.order = order;
        }
      }
    });

    return this.props.updateCampaigns(newCampaigns);
  };

  render() {
    return (
      <div className={styles.wrap}>
        <Board
          lists={this.state.lists}
          onCampaignsOrderChange={this.handleCampaignsOrderChange}
          showCampaign={this.props.showCampaign}
          addNewCampaign={this.props.addNewCampaign}
          userAccount={this.props.userAccount}
        />
      </div>
    );
  }
}