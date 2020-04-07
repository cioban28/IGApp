import {uniq, flatten} from 'lodash';
import {
  sortMarketingVsSalesOptions,
  EXTERNAL_LEAD_SOURCE,
  EXTERNAL_LEAD_SOURCE_DATA1,
  EXTERNAL_LEAD_SOURCE_DATA2
} from 'components/utils/users';
import {filterKinds} from 'components/utils/filters';

export const getFilterOptions = (data, key) => uniq(data.reduce((res, curr) => [...res, ...curr[key]], []));
export const getFunnelStagesByDateOptions = (data) => uniq(flatten(data.map((item) => item.funnelStagesInDateRange)))
export const getContentOptions = (data) => getFilterOptions(data, 'uniqContent').filter(Boolean);
export const getContentTypeOptions = (data) => getFilterOptions(data, 'uniqContentTypes').filter(Boolean);

const channelsConfig = {
  kind: filterKinds.CHANNELS,
  fieldKey: 'uniqChannels'
}

const customFieldsConfig = {
  kind: filterKinds.CUSTOM_FIELDS,
}

const campaignsConfig = {
  kind: filterKinds.CAMPAIGNS,
  fieldKey: 'uniqCampaigns'
}

const contentConfig = {
  kind: filterKinds.CONTENT,
  fieldKey: ['uniqContent', 'uniqContentPath', 'uniqContentTypes'],
  fieldNames: ['Content', 'Content URL', 'Content Type'],
  getOptions: (data) => [
    getContentOptions(data),
    getFilterOptions(data, 'uniqContentPath').filter(Boolean),
    getContentTypeOptions(data),
  ]
}

const funnelStagesConfig = {
  kind: filterKinds.FUNNEL_STAGES,
  fieldKey: ['funnelStage', 'funnelStagesInDateRange'],
  getOptions: (data) => [
    uniq(data.map((item) => item.funnelStage)),
    getFunnelStagesByDateOptions(data),
  ]
}

const channelBeforeStagesConfig = {
  kind: filterKinds.CHANNELS_BEFORE_STAGES,
  fieldKey: ['channel', 'channelBeforeStages'],
  getOptions: (data) => [
    getFilterOptions(data, 'uniqChannels'),
    getFunnelStagesByDateOptions(data),
  ]
}

const campaignBeforeStagesConfig = {
  kind: filterKinds.CAMPAIGN_BEFORE_STAGES,
  fieldKey: ['campaign', 'channelBeforeStages'],
  getOptions: (data) => [
    getFilterOptions(data, 'uniqCampaigns'),
    getFunnelStagesByDateOptions(data),
  ]
}

const contentBeforeStagesConfig = {
  kind: filterKinds.CONTENT_BEFORE_STAGES,
  fieldKey: ['content', 'channelBeforeStages'],
  getOptions: (data) => [
    getContentOptions(data),
    getFunnelStagesByDateOptions(data),
  ]
}

const contentChannelBeforeStagesConfig = {
  kind: filterKinds.CONTENT_CHANNEL_BEFORE_STAGES,
  fieldKey: ['contentType', 'channelBeforeStages'],
  getOptions: (data) => [
    getContentTypeOptions(data),
    getFunnelStagesByDateOptions(data),
  ]
}

const formsConfig = {
  kind: filterKinds.FORMS,
  fieldKey: 'formNames',
  getOptions: (data) => getFilterOptions(data, 'formNames').sort(),
}

const marketingVsSalesConfig = {
  kind: filterKinds.MARKETING_VS_SALES,
  fieldKey: 'marketingVsSales',
  getOptions: (data) => sortMarketingVsSalesOptions(uniq(data.map((item) => item.marketingVsSales))),
}

const crmSourceConfig = {
  kind: filterKinds.CRMSource,
  fieldKey: ['externalLeadSource', 'externalLeadSourceData1', 'externalLeadSourceData2'],
  fieldNames: [EXTERNAL_LEAD_SOURCE, EXTERNAL_LEAD_SOURCE_DATA1, EXTERNAL_LEAD_SOURCE_DATA2],
  getOptions: (data) => [
    getFilterOptions(data, 'externalLeadSource'),
    getFilterOptions(data, 'externalLeadSourceData1'),
    getFilterOptions(data, 'externalLeadSourceData2')
  ],
}

const productConfig = {
  kind: filterKinds.PRODUCT,
  fieldKey: 'product',
  getOptions: (data) => getFilterOptions(data, 'product').sort(),
}

const regionConfig = {
  kind: filterKinds.REGION,
  fieldKey: 'region',
  getOptions: (data) => getFilterOptions(data, 'region').sort(),
}

export const channelsPageConfig = [channelsConfig, customFieldsConfig, productConfig, regionConfig]
export const campaignsPageConfig = [channelsConfig, campaignsConfig, customFieldsConfig, productConfig, regionConfig]
export const contentPageConfig = [contentConfig, customFieldsConfig, productConfig, regionConfig]
export const usersPageConfig = [
  channelsConfig,
  funnelStagesConfig,
  channelBeforeStagesConfig,
  campaignBeforeStagesConfig,
  contentBeforeStagesConfig,
  contentChannelBeforeStagesConfig,
  campaignsConfig,
  contentConfig,
  formsConfig,
  marketingVsSalesConfig,
  customFieldsConfig,
  crmSourceConfig,
  productConfig,
  regionConfig
]
