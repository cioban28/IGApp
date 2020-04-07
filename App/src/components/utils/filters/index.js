import intersection from 'lodash/intersection';
import PropTypes from 'prop-types';
import {getChannelNickname} from 'components/utils/filters/channels';
import {getNickname as getStageNickname} from 'components/utils/indicators';
import {isContentTypeField} from 'components/utils/filters/content';

export const filterKinds = {
  CHANNELS: 'channels',
  FUNNEL_STAGES: 'funnelStages',
  CAMPAIGNS: 'campaigns',
  CUSTOM_FIELDS: 'custom',
  CONTENT: 'content',
  FORMS: 'forms',
  CRMSource: 'CRMSource',
  CHANNELS_BEFORE_STAGES: 'channelsBeforeStages',
  CONTENT_BEFORE_STAGES: 'contentBeforeStages',
  CONTENT_CHANNEL_BEFORE_STAGES: 'contentChannelBeforeStages',
  CAMPAIGN_BEFORE_STAGES: 'campaignBeforeStages',
  MARKETING_VS_SALES: 'marketingVsSales',
  PRODUCT: 'product',
  REGION: 'region'
};

export const ConfigPropType = PropTypes.shape({
  kind: PropTypes.oneOf(Object.values(filterKinds)).isRequired,
  options: PropTypes.any.isRequired,
  fieldKey: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).isRequired
});

export const FilterPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  assert: PropTypes.func.isRequired,
  config: ConfigPropType.isRequired,
  data: PropTypes.any.isRequired
});

export const VARIANTS = {
  INCLUDE_ANY_OF: 0,
  INCLUDE_ALL: 1,
  DONT_INCLUDE: 2,
  BECAME_ONE_OF: 3
};

const provideArray = (items) => Array.isArray(items) ? items : [items];

const VARIANTS_CONFIGS = {
  [VARIANTS.INCLUDE_ANY_OF]: {
    // label and value for Select option (see example in ChannelsFilter)
    label: 'Include any of',
    value: VARIANTS.INCLUDE_ANY_OF,
    // prefix for filter's label
    prefix: (count) => count === 1 ? 'Include' : 'Include any of',
    // assert function
    assert: (items, selectedItems) =>
      intersection(provideArray(items), selectedItems).length > 0
  },
  [VARIANTS.INCLUDE_ALL]: {
    label: 'Include all',
    value: VARIANTS.INCLUDE_ALL,
    prefix: () => 'Include',
    assert: (items, selectedItems) =>
      intersection(provideArray(items), selectedItems).length === selectedItems.length
  },
  [VARIANTS.DONT_INCLUDE]: {
    label: 'Don\'t include',
    value: VARIANTS.DONT_INCLUDE,
    prefix: () => 'Don\'t Include',
    assert: (items, selectedItems) =>
      intersection(provideArray(items), selectedItems).length === 0
  },
  [VARIANTS.BECAME_ONE_OF]: {
    label: 'Became one of',
    value: VARIANTS.BECAME_ONE_OF,
    prefix: (count) => count === 1 ? 'Became' : 'Became one of',
    assert: (items, selectedItems) =>
      intersection(provideArray(items), selectedItems).length > 0
  }
};

// configuration of options for INCLUDE filter type
export const includeVariants = [
  VARIANTS_CONFIGS[VARIANTS.INCLUDE_ANY_OF],
  VARIANTS_CONFIGS[VARIANTS.INCLUDE_ALL],
  VARIANTS_CONFIGS[VARIANTS.DONT_INCLUDE]
];

export const funnelStagesVariants = [
  VARIANTS_CONFIGS[VARIANTS.BECAME_ONE_OF],
  VARIANTS_CONFIGS[VARIANTS.INCLUDE_ANY_OF]
];

export const getFieldKey = ({config, data}) => {
  if (Array.isArray(config.fieldKey)) {
    return config.fieldKey[data.fieldIndex];
  }

  return config.fieldKey;
};

// get filter function by it's type
export const getFilterFn = ({config, data}) => {
  switch (config.kind) {
    case filterKinds.CHANNELS:
    case filterKinds.CAMPAIGNS:
    case filterKinds.CONTENT:
    case filterKinds.FORMS:
    case filterKinds.CUSTOM_FIELDS:
    case filterKinds.FUNNEL_STAGES:
    case filterKinds.MARKETING_VS_SALES:
    case filterKinds.PRODUCT:
    case filterKinds.REGION:
    case filterKinds.CRMSource: {
      const variantAssert = VARIANTS_CONFIGS[data.variant].assert;

      return (item) => {
        const itemData = item[getFieldKey({config, data})];

        return itemData && variantAssert(itemData, data.selectedOptions, config);
      };
    }
    case filterKinds.CHANNELS_BEFORE_STAGES:
    case filterKinds.CONTENT_BEFORE_STAGES:
    case filterKinds.CONTENT_CHANNEL_BEFORE_STAGES:
    case filterKinds.CAMPAIGN_BEFORE_STAGES: {
      return (item) => {
        const [elementKey, dataKey] = config.fieldKey;
        const itemData = item[dataKey];
        const [element, funnelStage] = data.selectedOptions;

        return itemData.some((sessionData) =>
          provideArray(sessionData[elementKey]).includes(element) && sessionData.funnelStages.includes(funnelStage)
        );
      };
    }
    default:
      return () => true;
  }
};

export const getLabelPrefix = ({config, data}) => {
  switch (config.kind) {
    case filterKinds.CHANNELS:
    case filterKinds.CAMPAIGNS:
    case filterKinds.CONTENT:
    case filterKinds.FORMS:
    case filterKinds.CUSTOM_FIELDS:
    case filterKinds.FUNNEL_STAGES:
    case filterKinds.MARKETING_VS_SALES:
    case filterKinds.PRODUCT:
    case filterKinds.REGION:
    case filterKinds.CRMSource: {
      const variantPrefix = VARIANTS_CONFIGS[data.variant].prefix;

      return variantPrefix(data.selectedOptions.length) + ' ';
    }
    default:
      return '';
  }
};

export const getFilterLabel = ({config, data}) => {
  const prefix = getLabelPrefix({config, data});

  switch (config.kind) {
    case filterKinds.CHANNELS: {
      const {selectedOptions} = data;

      if (selectedOptions.length === 1) {
        return `${prefix}${getChannelNickname(selectedOptions[0])}`;
      }

      return `${prefix}${data.selectedOptions.length} channels`;
    }
    case filterKinds.CAMPAIGNS: {
      const {selectedOptions} = data;

      if (selectedOptions.length === 1) {
        return `${prefix}${selectedOptions[0]}`;
      }

      return `${prefix}${data.selectedOptions.length} campaigns`;
    }
    case filterKinds.FUNNEL_STAGES: {
      const {selectedOptions} = data;

      if (selectedOptions.length === 1) {
        return `${prefix}${getStageNickname(selectedOptions[0], true)}`;
      }

      return `${prefix}${data.selectedOptions.length} stages`;
    }
    case filterKinds.CONTENT_CHANNEL_BEFORE_STAGES:
    case filterKinds.CHANNELS_BEFORE_STAGES: {
      const {selectedOptions} = data;

      return `${getChannelNickname(selectedOptions[0])} before ${getStageNickname(selectedOptions[1], true)}`;
    }
    case filterKinds.CAMPAIGN_BEFORE_STAGES:
    case filterKinds.CONTENT_BEFORE_STAGES: {
      const {selectedOptions} = data;

      return `${selectedOptions[0]} before ${getStageNickname(selectedOptions[1], true)}`;
    }
    case filterKinds.CUSTOM_FIELDS: {
      const {selectedOptions} = data;

      if (selectedOptions.length === 1) {
        return `${prefix}${selectedOptions[0]}`;
      }

      return `${prefix}${data.selectedOptions.length} ${config.fieldNames[data.fieldIndex] || ''}`;
    }
    case filterKinds.CONTENT: {
      const {selectedOptions, fieldIndex} = data;
      const isContentType = isContentTypeField(config.fieldKey[fieldIndex]);

      if (selectedOptions.length === 1) {
        const selectedOption = selectedOptions[0];

        if (isContentType) {
          return `${prefix}${getChannelNickname(selectedOption)} content`;
        }

        return `${prefix}${selectedOption}`;
      }

      return `${prefix}${data.selectedOptions.length} ${config.fieldNames[data.fieldIndex] || ''}`;
    }
    case filterKinds.FORMS: {
      const {selectedOptions} = data;

      if (selectedOptions.length === 1) {
        return `${prefix}${selectedOptions[0]}`;
      }

      return `${prefix}${data.selectedOptions.length} forms`;
    }
    case filterKinds.CRMSource: {
      const {selectedOptions, fieldIndex} = data;

      if (selectedOptions.length === 1) {
        return `${prefix}${selectedOptions[0]}`;
      }

      return `${prefix}${selectedOptions.length} CRM sources`;
    }
    case filterKinds.MARKETING_VS_SALES: {
      return `${prefix}${data.selectedOptions.join(', ')}`;
    }
    case filterKinds.PRODUCT: {
      return `${prefix}${data.selectedOptions.join(', ')}`;
    }
    case filterKinds.REGION: {
      return `${prefix}${data.selectedOptions.join(', ')}`;
    }
    default:
      return '';
  }
};

// generate filter uniq id based on it's kind, type and selected data
const getFilterId = ({config, data}) => {
  const idParts = [config.kind];

  if (Array.isArray(config.fieldKey)) {
    idParts.push(config.fieldKey[data.fieldIndex]);
  }

  if ('variant' in data) {
    idParts.push(data.variant);
  }

  idParts.push(...data.selectedOptions.slice().sort());

  return idParts.join('-');
};

export const getFilter = ({config, data}) => ({
  id: getFilterId({config, data}),
  label: getFilterLabel({config, data}),
  assert: getFilterFn({config, data}),
  config,
  data
});

export const makeFilter = ({ kind, data }, filterConfigs) => {
  const config = filterConfigs.find((c) => c.kind === kind)

  if (!config) {
    return null
  }

  return getFilter({ config, data })
}

export const makeFilters = (filtersData, filterConfigs) =>
  filtersData.map((data) => makeFilter(data, filterConfigs)).filter(Boolean)
