import React from 'react';
import Component from 'components/Component';
import style from 'styles/campaigns/online-campaigns.css';
import {formatNumber} from 'components/utils/budget';
import Select from 'components/controls/Select';
import {getNickname as getChannelNickname} from 'components/utils/channels';
import {getNickname as getIndicatorNickname} from 'components/utils/indicators';
import Avatar from 'components/Avatar';
import Table from 'components/controls/Table';

export default class OnlineCampaigns extends Component {

  style = style;

  constructor(props) {
    super(props);
    this.state = {
      editMetric: false,
      selectedAttributionMetric: 'MCL'
    };
  }

  render() {
    const {filteredCampaigns: campaigns, attribution: {campaigns: attributionCampaigns}} = this.props;
    const {selectedAttributionMetric, editMetric} = this.state;

    const metrics = [
      {value: 'conversion', label: 'Conversions'},
      {value: 'webVisits', label: 'Web Visits'},
      {value: 'MCL', label: getIndicatorNickname('MCL')},
      {value: 'MQL', label: getIndicatorNickname('MQL')},
      {value: 'SQL', label: getIndicatorNickname('SQL')},
      {value: 'opps', label: getIndicatorNickname('opps')},
      {value: 'users', label: getIndicatorNickname('users')},
      {value: 'pipeline', label: 'Pipeline'},
      {value: 'revenue', label: 'Revenue'}
    ];

    const campaignsWithAttribution = campaigns
      .map((campaign, index) => {
        const attributionData = attributionCampaigns && attributionCampaigns.find(item =>
          item.name === campaign.name || (campaign.tracking && campaign.tracking.campaignUTM && item.name === campaign.tracking.campaignUTM)
        );
        const user = campaign.owner && this.props.teamMembers.find(user => user.userId === campaign.owner);
        const clicksObj = campaign.objectives.find(objective => objective.kpi.toLowerCase() === 'clicks');
        const impressionsObj = campaign.objectives.find(objective => objective.kpi.toLowerCase() === 'impressions');
        const conversionsObj = campaign.objectives.find(objective => objective.kpi.toLowerCase() === 'conversions');
        return {
          impressions: impressionsObj ? Number(impressionsObj.actualGrowth) : 0,
          clicks: clicksObj ? Number(clicksObj.actualGrowth) : 0,
          conversions: conversionsObj ? Number(conversionsObj.actualGrowth) : 0,
          ...attributionData,
          ...campaign,
          user: user,
          platformIndex: index
        };
      })
      .filter((campaign) =>
        campaign.adwordsId
        || campaign.facebookadsId
        || campaign.linkedinadsId
        || campaign.twitteradsId
        || campaign.bingadsId
        || campaign.quoraadsId
        || campaign.salesforceId
      );

    return (
      <Table
        data={campaignsWithAttribution}
        defaultSorted={[{id: 'impressions', desc: true}]}
        onRowClick={(campaign) => this.props.openCampaign(campaign.platformIndex)}
        columns={[
          {
            id: 'status',
            header: 'Status',
            cell: ({status}) => (
              <div
                className={this.classes.statusIcon}
                data-icon={'status:' + status}
                title={status}
              />
            ),
            minWidth: 80
          },
          {
            id: 'channel',
            header: 'Channel',
            cell: ({source}) => source.map((channel) => (
              <div
                key={channel} className={this.classes.channelIcon}
                data-icon={'plan:' + channel}
                title={getChannelNickname(channel)}
              />
            )),
            minWidth: 100
          },
          {
            id: 'name',
            header: 'Campaign Name',
            cell: 'name',
            sortable: true,
            minWidth: 240
          },
          {
            id: 'owner',
            header: 'Owner',
            cell: ({user}) => (
              <div title={user && user.name}>
                <Avatar member={user} className={this.classes.icon}/>
              </div>
            ),
            minWidth: 80
          },
          {
            id: 'impressions',
            header: 'Impressions',
            cell: 'impressions',
            sortable: true
          },
          {
            id: 'clicks',
            header: 'Clicks',
            cell: 'clicks',
            sortable: true,
            minWidth: 80
          },
          {
            id: 'conversions',
            header: 'Conv.',
            cell: 'conversions',
            sortable: true,
            minWidth: 80
          },
          {
            id: 'actualSpent',
            header: 'Ad Spend',
            cell: ({actualSpent}) => '$' + formatNumber(actualSpent || 0),
            sortable: true,
            sortMethod: (a, b) => a.actualSpent - b.actualSpent,
            minWidth: 80
          },
          {
            id: 'edit',
            header: (
              <div style={{display: 'inline-flex'}}>
                {editMetric ?
                  <Select
                    selected={selectedAttributionMetric}
                    select={{
                      options: metrics
                    }}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      this.setState({selectedAttributionMetric: e.value});
                    }}
                    style={{
                      width: '160px',
                      fontWeight: 'initial',
                      fontSize: 'initial',
                      color: 'initial',
                      textAlign: 'initial'
                    }}
                  />
                  : metrics.find(item => item.value === selectedAttributionMetric).label
                }
                <div className={this.classes.metricEdit} onClick={(e) => {
                  e.stopPropagation();
                  this.setState({editMetric: !editMetric});
                }}>
                  {editMetric ? 'Done' : 'Edit'}
                </div>
              </div>
            ),
            cell: (campaign) => campaign[selectedAttributionMetric] || 0,
            sortMethod: (a, b) => a[selectedAttributionMetric] - b[selectedAttributionMetric],
            headerClassName: this.classes.metricHeader,
            minWidth: editMetric ? 220 : 140,
            sortable: true,
            resizable: false
          }
        ]}
      />
    );
  }
}
