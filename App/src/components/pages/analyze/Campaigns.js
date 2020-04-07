import React from 'react';
import { inject, observer } from 'mobx-react';
import { FeatureToggle } from 'react-feature-toggles';
import history from 'history';
import {sumBy, isEqual} from 'lodash';

import AttributionTable from 'components/pages/analyze/AttributionTable';
import ChannelList from 'components/common/ChannelList';
import Component from 'components/Component';
import ConversionJourney from 'components/pages/analyze/ConversionJourney';
import FiltersPanel from 'components/pages/users/Filters/FiltersPanel';

import { compose } from 'components/utils/utils';
import { timeFrameToDate } from 'components/utils/objective';

import style from 'styles/analyze/analyze.css';

const enhance = compose(
    inject(({
      attributionStore: {
        attributionModel,
        data,
        conversionIndicator,
      },
      analyze: {
        campaignsStore: {
          campaigns,
          navigateToJourneys,
          filtersData: {
            filters,
            setFilters,
            filterConfigs,
            getMetricsData,
          }
        },
      },
    }) => ({
        attributionModel,
        data,
        getMetricDataByMapping: getMetricsData,
        conversionIndicator,
        attributionCampaigns: campaigns,
        filters,
        setFilters,
        filterConfigs,
        navigateToJourneys,
    })),
    observer,
);

class Campaigns extends Component {
  style = style;
  state = {
      channelsContainerWidth: 224
  };

  componentDidMount() {
    if (this.channelContainer && this.channelContainer.clientWidth) {
      this.setState({channelsContainerWidth: this.channelContainer.clientWidth});
    }
  }

  getAttributionCampaign = (platformCampaign) => {
    const {attributionCampaigns} = this.props;

    return attributionCampaigns.find(attributionCampaign =>
      (
        (platformCampaign.name === attributionCampaign.name) ||
        (platformCampaign.tracking && platformCampaign.tracking.campaignUTM === attributionCampaign.name)
      ) && (
        isEqual(platformCampaign.source.sort(), attributionCampaign.channels.sort())
      )
    );
  };

  getPlatformCampaignIndex = (attributionCampaign) => {
    const { calculatedData: { activeCampaigns: platformCampaigns }} = this.props.data;

    return platformCampaigns.findIndex(platformCampaign =>
      (
        (platformCampaign.name === attributionCampaign.name) ||
        (platformCampaign.tracking && platformCampaign.tracking.campaignUTM === attributionCampaign.name)
      ) && (
        isEqual(attributionCampaign.channels.sort(), platformCampaign.source.sort())
      )
    );
  };

  getPlatformCampaign = (campaign) => {
    const { data: { campaigns } } = this.props;

    return campaigns[this.getPlatformCampaignIndex(campaign)];
  };

  getCampaignCost = (campaign) => {
    let budget = 0;
    if (campaign.isOneTime) {
      if (campaign.dueDate &&
        timeFrameToDate(campaign.dueDate).getMonth() ===
        new Date().getMonth()) {
        budget = campaign.actualSpent || campaign.budget || 0;
      }
    }
    else {
      if (!campaign.dueDate ||
        (campaign.dueDate && timeFrameToDate(campaign.dueDate) < new Date())) {
        budget = campaign.actualSpent || campaign.budget || 0;
      }
    }

    return budget;
  };

  getCampaignTitle = (campaign) => {
    const platformCampaignIndex = this.getPlatformCampaignIndex(campaign);
    return {
      text: campaign.name,
      node: (
        <div
          data-link={platformCampaignIndex !== -1 ? true : null}
          onClick={() => {
            if (platformCampaignIndex !== -1) {
              history.push({
                pathname: '/campaigns/by-channel',
                query: {campaign: platformCampaignIndex}
              });
            }
          }}
          style={platformCampaignIndex !== -1 ? {cursor: 'pointer'} : undefined}
          className={this.classes.campaignTitle}
        >
          {campaign.name}
        </div>
      )
    };
  };

  getData = () => {
    const {
      attributionCampaigns,
      data: {
        calculatedData: {
            activeCampaigns: platformCampaigns,
        },
      }
    } = this.props;

    const campaigns = attributionCampaigns.map(this.getPlatformCampaign);
    const formattedAttributionCampaigns = attributionCampaigns.map((campaign, index) => {
      const platformCampaign = campaigns[index];
      let platformProps = {
        cost: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0
      };
      if (platformCampaign) {
        platformProps.cost = this.getCampaignCost(platformCampaign);
        platformCampaign.objectives.forEach(objective => {
          if (objective.kpi) {
            platformProps[objective.kpi] = parseInt(objective.actualGrowth);
          }
        });
      }
      return {
        ...campaign,
        ...platformProps
      };
    });

    const formattedPlatformCampaigns = platformCampaigns.reduce((result, campaign) => {
      // only process platform campaign which is not included in the attribution campaigns
      if (!this.getAttributionCampaign(campaign) && campaign.name) {
        const attributionProps = {
          webVisits: 0,
          LTV: 0,
          MCL: 0,
          MQL: 0,
          SQL: 0,
          channels: campaign.source,
          conversion: 0,
          opps: 0,
          pipeline: 0,
          revenue: 0,
          users: 0
        };
        let platformProps = {
          cost: 0,
          impressions: 0,
          clicks: 0,
          conversions: 0
        };
        platformProps.cost = this.getCampaignCost(campaign);
        campaign.objectives.forEach(objective => {
          if (objective.kpi) {
            platformProps[objective.kpi] = parseInt(objective.actualGrowth);
          }
        });

        result.push({
          name: campaign.name,
          ...attributionProps,
          ...platformProps
        });
      }
      return result;
    }, []);

    return formattedAttributionCampaigns.concat(formattedPlatformCampaigns);
  };

  onRowClick = ({name: campaignName}, funnelStage) => {
    this.props.navigateToJourneys(funnelStage, campaignName);
  };

  render() {
    const {
        attributionModel,
        data,
        getMetricDataByMapping,
        attributionCampaigns,
        filters,
        setFilters,
        filterConfigs,
        conversionIndicator,
    } = this.props;
    const { channelsContainerWidth } = this.state;

    if (!Object.keys(data).length) {
        return null;
    }

    let journeyCampaignsSum = 0;
    const journeyCampaigns = attributionCampaigns
      .filter(campaign => campaign[conversionIndicator])
      .map(campaign => {
        const value = campaign[conversionIndicator];
        journeyCampaignsSum += value;
        return {name: campaign.name, value: value};
      });

    return (
      <div>
        <div className={this.classes.filtersPanel}>
          <FiltersPanel
            filters={filters}
            filterConfigs={filterConfigs}
            onFiltersChange={setFilters}
          />
        </div>
        <FeatureToggle featureName="attribution">
          <AttributionTable
            key={conversionIndicator}
            defaultStageKey={conversionIndicator}
            title='Campaigns Impacts Analysis'
            data={this.getData(attributionCampaigns)}
            getItemTitle={this.getCampaignTitle}
            getItemCost={item => item.cost}
            dataNickname='Campaign'
            webVisitsColumns={[
              {
                id: 'impressions',
                header: 'Impressions',
                accessor: 'impressions',
                footer: (data) => sumBy(data, 'impressions')
              },
              {
                id: 'clicks',
                header: 'Clicks',
                accessor: 'clicks',
                footer: (data) => sumBy(data, 'clicks')
              },
              {
                id: 'conversions',
                header: 'Ad Conversions',
                accessor: 'conversions',
                footer: (data) => sumBy(data, 'conversions')
              }
            ]}
            columnsAfter={[{
              id: 'channels',
              header: 'Channels',
              accessor: 'channels',
              cell: (channels) => (
                <div
                  className={this.classes.cellWithIcon}
                  ref={el => this.channelContainer = el}
                >
                  <ChannelList
                    channels={channels}
                    width={channelsContainerWidth}
                  />
                </div>
              ),
              footer: '',
              minWidth: 224,
              minResizeWidth: 192
            }]}
            attributionModel={attributionModel.label}
            TableProps={{
              onResizedChange: (newResized) => {
                const resizedChannel = newResized.find(item => item.id === 'channels');
                if (resizedChannel) {
                  // set new channels column width - padding size
                  this.setState({channelsContainerWidth: resizedChannel.value - 48});
                }
              }
            }}
            onClick={this.onRowClick}
          />
        </FeatureToggle>
        <FeatureToggle featureName="attribution">
          <ConversionJourney
            conversionIndicator={conversionIndicator}
            chartData={journeyCampaigns}
            chartDataSum={journeyCampaignsSum}
            getMetricDataByMapping={getMetricDataByMapping}
          />
        </FeatureToggle>
      </div>
    );
  }
}

export default enhance(Campaigns);
