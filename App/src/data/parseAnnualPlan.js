import merge from 'lodash/merge';
import channelDescriptions from 'data/channelDescriptions';
import { getTitle } from 'components/utils/channels';
import { getChannelsWithProps } from 'components/utils/channels';

export function parseBudgets(approvedPlan, unknownChannels, inHouseChannels, projectedPlan) {
  const length = approvedPlan.length;
  const returnJson = {};
  const total = "__TOTAL__";
  returnJson[total] = {
    values : new Array(length).fill(0),
    approvedValues : new Array(length).fill(0)
  };
  const inHouseMonth = {};
  inHouseChannels && inHouseChannels.forEach(channel => { inHouseMonth[channel] = -1 });
  const inHouseAnnual = new Array(length).fill(inHouseMonth);
  const suggestedPlan = projectedPlan ? projectedPlan.map(month => month.plannedChannelBudgets) : new Array(length).fill({});
  const budgets = merge([], inHouseAnnual, suggestedPlan);
  const approvedBudgets = merge([], inHouseAnnual, approvedPlan);
  const props = getChannelsWithProps();
  const channels = approvedBudgets.reduce((total, month, index) => merge(total, month, budgets[index]), {});
  Object.keys(channels).forEach(channel => {
    const channelProps = props[channel];
    const category = channelProps.category;
    const approvedValues = approvedBudgets.map(month => month[channel] || 0);
    const values = budgets.map(month => month[channel] || 0);
    if (!returnJson[category]) {
      returnJson[category] = {
        icon: "plan:" + category,
        disabled: true,
        children: {},
        values: new Array(length).fill(0),
        approvedValues: new Array(length).fill(0)
      }
    }
    returnJson[category].children[channelProps.nickname] = {
      approvedValues: approvedValues,
      values: values,
      icon: "plan:" + channel,
      channel: channel,
      info: channelDescriptions[channel]
    };
    returnJson[category].values = returnJson[category].values.map((item, index) => values[index] > 0 ? item + values[index] : item);
    returnJson[category].approvedValues = returnJson[category].approvedValues.map((item, index) => approvedValues[index] > 0 ? item + approvedValues[index] : item);
    returnJson[total].values = returnJson[total].values.map((item, index) => values[index] > 0 ? item + values[index] : item);
    returnJson[total].approvedValues = returnJson[total].approvedValues.map((item, index) => approvedValues[index] > 0 ? item + approvedValues[index] : item);
  });
  return returnJson;
}

export function parseAnnualPlan(projectedPlan, approvedBudgets, unknownChannels, inHouseChannels) {
  const sum = {
    "__TOTAL__": { values : new Array(12).fill(0) }
  };
  const returnObj = {};
  let budget = 0;
  projectedPlan.forEach((month, index)=> {
    budget+= month.monthBudget || 0;
    const channels = month.plannedChannelBudgets || {};
    Object.keys(channels).forEach((channel) => {
      const title = getTitle(channel)
        .split('/')
        .map(item => item.trim());
      merge(returnObj, parseMonth(title, channels[channel], index, returnObj, channel, approvedBudgets ? approvedBudgets : new Array(projectedPlan.length).fill(null)));
    });
  });
  if (approvedBudgets) {
    approvedBudgets.forEach((channels, month) => {
      if (channels) {
        Object.keys(channels).forEach((channel) => {
          if (channel !== '_id') {
            const title = getTitle(channel)
              .split('/')
              .map(item => item.trim());
            parseActuals(title, returnObj, channels[channel], channel, month, projectedPlan.length, sum["__TOTAL__"]);
          }
        });
      }
    });
  }
  fillZeros(returnObj, approvedBudgets ? approvedBudgets : new Array(projectedPlan.length).fill(null), projectedPlan.length);
  if (unknownChannels && unknownChannels.length > 0) {
    unknownChannels.forEach((channels, month) => {
      if (channels) {
        Object.keys(channels).forEach((channel) => {
          if (channel !== '_id') {
            const title = channel
              .split('/')
              .map(item => item.trim());
            parseUnknownChannels(title, returnObj, channels[channel], month, projectedPlan.length, sum["__TOTAL__"], channel);
          }
        });
      }
    });
  }
  if (inHouseChannels && inHouseChannels.length > 0) {
    inHouseChannels.forEach(channel => {
      const title = getTitle(channel)
        .split('/')
        .map(item => item.trim());
      parseInHouseChannels(title, returnObj, -1, projectedPlan.length, channel);
    });
  }
  merge(returnObj, sum);
  const retJson = {};
  retJson[budget] = returnObj;
  return retJson;
}

function parseMonth(title, budget, month, current, channel, approvedBudgets){
  if (title.length === 1) {
    if (current && current[title[0]]){
      for(let i=current[title[0]].values.length; i< month ; i++){
        current[title[0]].values.push(0);
        current[title[0]].approvedValues[i] = approvedBudgets[i] && approvedBudgets[i][channel];
      }
      current[title[0]].values.push(budget);
      current[title[0]].approvedValues[month] = approvedBudgets[month] && approvedBudgets[month][channel];
      return {};
    }
    else {
      const obj = {};
      obj[title[0]] = { values : [] };
      obj[title[0]].approvedValues = new Array(approvedBudgets.length).fill(null);
      for (let i = 0; i < month; i++) {
        obj[title[0]].values.push(0);
        obj[title[0]].approvedValues[i] = approvedBudgets[i] && approvedBudgets[i][channel];
      }
      obj[title[0]].values.push(budget);
      obj[title[0]].icon = "plan:" + channel;
      obj[title[0]].channel = channel;
      obj[title[0]].info = channelDescriptions[channel];
      obj[title[0]].approvedValues[month] = approvedBudgets[month] && approvedBudgets[month][channel];
      return obj;
    }
  }
  else {
    if (current && current[title[0]]) {
      if (current[title[0]].values[month] != null){
        current[title[0]].values[month]+= budget;
      }
      else {
        for(let i=current[title[0]].values.length; i< month ; i++){
          current[title[0]].values.push(0);
        }
        current[title[0]].values.push(budget);
      }
      const obj = {};
      obj[title[0]] = {children: parseMonth(title.splice(1, title.length - 1), budget, month, current ? (current[title[0]] ? current[title[0]].children : undefined) : undefined, channel, approvedBudgets)};
      return obj;
    }
    else {
      const obj = {};
      obj[title[0]] = {values: [], children: parseMonth(title.splice(1, title.length - 1), budget, month, current ? (current[title[0]] ? current[title[0]].children : undefined) : undefined, channel, approvedBudgets)};
      for (let i = 0; i < month; i++) {
        obj[title[0]].values.push(0);
      }
      obj[title[0]].values.push(budget);
      obj[title[0]].icon = "plan:" + title[0];
      obj[title[0]].disabled= true;
      obj[title[0]].approvedValues = new Array(approvedBudgets.length).fill(0);
      return obj;
    }

  }
}

function fillZeros(json, approvedBudgets, length){
  Object.keys(json).forEach((key) => {
    if (json[key].values) {
      if (json[key].values.length < length) {
        for (let i = 0; i < length; i++) {
          if (json[key].values[i] === undefined) {
            json[key].values.push(0);
            if (json[key].channel) {
              json[key].approvedValues[i] = approvedBudgets[i] && approvedBudgets[i][json[key].channel];
            }
          }
        }
      }
    }
    if (json[key].children) {
      fillZeros(json[key].children, approvedBudgets, length);
    }
  })
}

function parseActuals(title, current, actualBudget, channel, month, length, sum) {
  if (title.length === 1) {
    if (!current[title[0]]) {
      current[title[0]] = {};
      current[title[0]].values = new Array(length).fill(0);
      current[title[0]].icon = "plan:" + channel;
      current[title[0]].channel = channel;
      current[title[0]].approvedValues = new Array(length).fill(0);
    }
    current[title[0]].approvedValues[month] = actualBudget;
    sum.values[month] += actualBudget;

  }
  else {
    if (current && current[title[0]]) {
      current[title[0]].approvedValues[month] += actualBudget;
      return parseActuals(title.splice(1, title.length - 1), current ? (current[title[0]] ? current[title[0]].children : undefined) : undefined, actualBudget, channel, month, length, sum);
    }
    else {
      current[title[0]] = {};
      current[title[0]] = {children: parseActuals(title.splice(1, title.length - 1), current[title[0]], actualBudget, channel, month, length, sum)};
      current[title[0]].values = new Array(length).fill(0);
      current[title[0]].icon = "plan:" + title[0];
      current[title[0]].disabled= true;
      current[title[0]].approvedValues = new Array(length).fill(0);
      current[title[0]].approvedValues[month] += actualBudget;
    }
  }
  return current;
}

function parseUnknownChannels(title, current, budget, month, length, sum, originalTitle) {
  if (title.length === 1) {
    if (!current[title[0]]) {
      current[title[0]] = {};
      current[title[0]].values = new Array(length).fill(0);
      current[title[0]].approvedValues = new Array(length).fill(0);
      current[title[0]].icon = "plan:other";
      current[title[0]].channel = originalTitle;
      current[title[0]].isOtherChannel = true;
    }
    current[title[0]].values[month] += budget;
    current[title[0]].approvedValues[month] += budget;
    sum.values[month] += budget;
  }
  else {
    if (current && current[title[0]]) {
      current[title[0]].values[month] += budget;
      current[title[0]].approvedValues[month] += budget;
      return parseUnknownChannels(title.splice(1, title.length - 1), current[title[0]].children , budget, month, length, sum, originalTitle);
    }
    else {
      current[title[0]] = {};
      current[title[0]] = {children: parseUnknownChannels(title.splice(1, title.length - 1), current[title[0]], budget, month, length, sum, originalTitle)};
      current[title[0]].values = new Array(length).fill(0);
      current[title[0]].approvedValues = new Array(length).fill(0);
      current[title[0]].icon = "plan:" + title[0];
      current[title[0]].disabled= true;
      current[title[0]].values[month] += budget;
      current[title[0]].approvedValues[month] += budget;
    }
  }
  return current;
}

function parseInHouseChannels(title, current, budget, length, channel) {
  if (title.length === 1) {
    if (!current[title[0]]) {
      current[title[0]] = {};
      current[title[0]].values = new Array(length).fill(budget);
      current[title[0]].icon = "plan:" + channel;
      current[title[0]].channel = channel;
      current[title[0]].info = channelDescriptions[channel];
    }
  }
  else {
    if (current && current[title[0]]) {
      return parseInHouseChannels(title.splice(1, title.length - 1), current[title[0]].children , budget, length, channel);
    }
    else {
      current[title[0]] = {};
      current[title[0]] = {children: parseInHouseChannels(title.splice(1, title.length - 1), current[title[0]], budget, length, channel)};
      current[title[0]].values = new Array(length).fill(budget);
      current[title[0]].icon = "plan:" + title[0];
      current[title[0]].disabled= true;
    }
  }
  return current;
}