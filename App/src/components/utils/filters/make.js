import {filterKinds, funnelStagesVariants, VARIANTS} from 'components/utils/filters';

export {VARIANTS};

/**
 example of creating filters:

 history.push({
    pathname: '/analyze/journeys',
    state: {
      filters: [
        makeChannelsFilter(VARIANTS.INCLUDE_ANY_OF, [
          'advertising_searchMarketing_SEO',
          'social_twitterAccount',
        ]),
        makeFunnelStagesFilter(['MCL'])
      ]
    }
  })
 */

export const makeChannelsFilter = (variant, channels) => ({
  kind: filterKinds.CHANNELS,
  data: {
    variant,
    selectedOptions: channels
  }
});

export const makeFunnelStagesFilter = (variant, funnelStages) => ({
  kind: filterKinds.FUNNEL_STAGES,
  data: {
    variant,
    fieldIndex: funnelStagesVariants.findIndex((vrnt) => vrnt.value === variant),
    selectedOptions: funnelStages
  }
});

export const makeCampaignsFilter = (variant, campaigns) => ({
  kind: filterKinds.CAMPAIGNS,
  data: {
    variant,
    selectedOptions: campaigns
  }
});

// fieldIndex - custom field index, e.g for 'custom1' field fieldIndex === 0
export const makeCustomFieldsFilter = (fieldIndex, variant, customFieldsData) => ({
  kind: filterKinds.CUSTOM_FIELDS,
  data: {
    fieldIndex,
    variant,
    selectedOptions: customFieldsData
  }
});

export const makeContentFilter = (fieldIndex, variant, contentData) => ({
  kind: filterKinds.CONTENT,
  data: {
    fieldIndex,
    variant,
    selectedOptions: contentData
  }
});

export const makeCRMSourceFilter = (fieldIndex, variant, sources) => {
  return {
    kind: filterKinds.CRMSource,
    data: {
      fieldIndex,
      variant,
      selectedOptions: sources
    }
  };
};

export const makeChannelBeforeStageFilter = (channel, funnelStage) => {
  return {
    kind: filterKinds.CHANNELS_BEFORE_STAGES,
    data: {
      selectedOptions: [channel, funnelStage]
    }
  };
};

export const makeCampaignBeforeStageFilter = (campaign, funnelStage) => {
  return {
    kind: filterKinds.CAMPAIGN_BEFORE_STAGES,
    data: {
      selectedOptions: [campaign, funnelStage]
    }
  };
};

export const makeContentBeforeStageFilter = (content, funnelStage) => {
  return {
    kind: filterKinds.CONTENT_BEFORE_STAGES,
    data: {
      selectedOptions: [content, funnelStage]
    }
  };
};

export const makeContentChannelBeforeStageFilter = (contentType, funnelStage) => {
  return {
    kind: filterKinds.CONTENT_CHANNEL_BEFORE_STAGES,
    data: {
      selectedOptions: [contentType, funnelStage]
    }
  };
};
