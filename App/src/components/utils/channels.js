import uniq from 'lodash/uniq';
import icons from 'styles/icons/plan.css';
import { get, mapValues, merge } from 'lodash';

icons.use();

let schema = {properties: {}};
let isInitialized = false;

export function initialize(channelsSchema, userChannelsSchema = {}) {
  schema.properties = merge(schema.properties, channelsSchema.properties, userChannelsSchema);
  schema.properties = mapValues(schema.properties, props => {
    const {category, nickname, isUnknownChannel} = props;
    return {
      department: 'marketing',
      ...props,
      title: `${category} / ${nickname}`,
      isUnknownChannel: !!isUnknownChannel
    };
  });
  isInitialized = true;
}

export function getTitle(channel) {
  if (isInitialized && channel) {
    return schema.properties[channel] && schema.properties[channel].title;
  }
  else {
    console.log(channel);
  }
}

export function getNickname(channel) {
    if (isInitialized && channel) {
        return get(schema, ['properties', channel, 'nickname'], channel);
    } else {
        console.log(channel);
    }
}

export function getChannelIcon(channel) {
  if (isInitialized && channel) {
    if (schema.properties[channel] && !schema.properties[channel].isUnknownChannel) {
      return `plan:${channel}`;
    }
    else {
      return 'plan:other';
    }
  }
  else {
    console.error(channel);
  }
}

export function getMetadata(type, channel) {
  if (isInitialized && channel && type) {
    return schema.properties[channel] && schema.properties[channel][type];
  }
  else {
    console.log(channel);
  }
}

export function isUnknownChannel(channel) {
  return getMetadata('isUnknownChannel', channel);
}

export function getChannelsWithTitles() {
  if (isInitialized) {
    return Object.keys(schema.properties).map(item => {
      return {value: item, label: schema.properties[item].title};
    });
  }
  else return [];
}

export function getChannelsWithNicknames() {
  if (isInitialized) {
    return Object.keys(schema.properties).map(item => {
      return {value: item, label: schema.properties[item].nickname};
    });
  }
  else return [];
}

export function getChannelsWithProps() {
  if (isInitialized) {
    return schema.properties;
  }
}

export function formatChannels(isDisabled = () => false, withOtherChannels = false) {
  let returnObject = [];
  const categories = Object.keys(schema.properties).map(channel => schema.properties[channel].category);
  categories.forEach(category =>
    returnObject.push({label: category, options: []})
  );
  Object.keys(schema.properties)
    .filter(channel => {
      const isUnknownChannel = schema.properties[channel].isUnknownChannel;
      return !isUnknownChannel || withOtherChannels;
    })
    .forEach(channel => {
      const nickname = schema.properties[channel].nickname;
      const category = schema.properties[channel].category;
      const categoryObject = returnObject.find(item => item.label === category);
      categoryObject.options.push({label: nickname, value: channel, disabled: isDisabled(channel)});
    });
  return returnObject;
}

export function output() {
  const channels = schema.properties;
  const result = {
    root: {
      children: []
    }
  };

  result.root.children.push('other?');
  result['other?'] = {
    channelId: 'other?',
    level: 1,
    title: 'Other*',
    path: undefined,
    isLeaf: true,
    isOther: true,
    id: 'other?',
    minBudget: 0,
    children: null
  };


  Object.keys(channels).forEach((key) => {
    const channel = channels[key];
    const pathTitles = (channel.category + ' / ' + channel.nickname)
      .split('/')
      .map(item => item.trim());
    const pathIds = pathTitles.map((item, index) => {
      return pathTitles.slice(0, index + 1)
        .map(it => it.toLowerCase())
        .join('_');
    });


    pathIds.forEach((id, index) => {
      if (index !== 0) {
        result[pathIds[index - 1]].children.push(id);
        result[pathIds[index - 1]].children.push(pathTitles[index - 1] + '_other?');
      } else {
        result.root.children.push(id);
      }

      const isLeaf = index === pathIds.length - 1;

      if (!result[id]) {
        result[id] = {
          channelId: id,
          level: index + 1,
          title: pathTitles[index],
          path: isLeaf ? channel.category + ' / ' + channel.nickname : null,
          isLeaf,
          id: isLeaf ? key : null,
          minBudget: isLeaf ? channel.minMonthBudget : 0,
          children: !isLeaf ? [] : null
        };
      }
      if (!result[pathTitles[index - 1] + '_other?']) {
        const title = pathTitles.slice(1, index).reduce((a, b) => a + ' / ' + b, pathTitles[0]);
        result[pathTitles[index - 1] + '_other?'] = {
          channelId: pathTitles[index - 1] + '_other?',
          level: index + 1,
          title: 'Other*',
          path: title,
          isLeaf: true,
          isOther: true,
          id: pathTitles[index - 1] + '_other?',
          minBudget: 0,
          children: null
        };
      }
    });
  });

  Object.keys(result).forEach((key) => {
    const channel = result[key];

    if (channel.children) {
      channel.children = uniq(channel.children)
        .sort((a, b) => {
          const channelA = result[a];
          const channelB = result[b];

          if (!channelA.isLeaf || channelB.isLeaf) {
            return -1;
          }

          return 1;
        });
    }
  });

  return result;
}

export const isMarketingChannel = (channel) => getMetadata('department', channel) === 'marketing'
