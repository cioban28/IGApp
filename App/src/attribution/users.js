import {flatten, uniq, merge} from 'lodash';
import {getNickname} from 'components/utils/indicators';
import {getFormName, getMarketingVsSalesTitle} from 'components/utils/users';

const stagesOrder = {
  blogSubscribers: 0,
  MCL: 1,
  MQL: 2,
  SQL: 3,
  opps: 4,
  users: 5
};

const mode = (array) => {
  if (array.length === 0) {
    return null;
  }

  let maxEl = array[0];
  let maxCount = 1;

  array.reduce((res, el) => {
    res[el] = res[el] ? res[el] + 1 : 1;

    if (res[el] > maxCount) {
      maxEl = el;
      maxCount = res[el];
    }

    return res;
  }, {});

  return maxEl;
};

const timeSince = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000);
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) {
    return interval + ' years ago';
  }
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) {
    return interval + ' months ago';
  }
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) {
    return interval + ' days ago';
  }
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) {
    return interval + ' hours ago';
  }
  interval = Math.floor(seconds / 60);
  if (interval >= 1) {
    return interval + ' minutes ago';
  }
  return Math.floor(seconds) + ' seconds ago';
};

export const formatUsers = (usersData, startDateTS, endDateTS) =>
  usersData.map((user) => {
    // const getLastOrEmpty = field => user.sessions.reverse().map(item => item[field]).find(item => !!item);
    const getUniqNotEmpty = field => uniq(user.sessions.map(item => item[field]).filter(item => !!item));
    const getUniqAsString = field => uniq(user.sessions.map(item => String(item[field])));
    const firstTouchPoint = new Date(user.sessions[0].startTime);
    const lastTouchPoint = new Date(user.sessions[user.sessions.length - 1].endTime);
    const timeSinceFirst = timeSince(firstTouchPoint);
    const timeSinceLast = timeSince(lastTouchPoint);
    const uniqChannels = uniq(user.sessions.map(item => item.channel));
    const uniqCampaigns = uniq(user.sessions.map(item => item.campaign)).filter((c) => !!c);
    const emails = getUniqNotEmpty('email');
    const domain = mode(user.sessions.map(item => {
      const domain = item.email && item.email.match('(?<=@).+');
      return domain && domain[0];
    }));
    const devices = getUniqNotEmpty('device');
    const countries = getUniqNotEmpty('country');
    const displayName = user.accountName
      ? user.accountName
      : domain && domain.match('[^.]+(?=\\.)') && domain.match('[^.]+(?=\\.)')[0];
    const domainIcon = domain ? 'https://logo.clearbit.com/' + domain : undefined;
    const maxFunnelStageIndex = Math.max(...Object.keys(user.funnelStages).map(stage => stagesOrder[stage]));
    const funnelStage = Object.keys(stagesOrder)[maxFunnelStageIndex];
    const stageNickname = getNickname(funnelStage, true);
    const uniqCustom1 = getUniqAsString('custom1');
    const uniqCustom2 = getUniqAsString('custom2');
    const externalLeadSource = getUniqNotEmpty('external_lead_source');
    const externalLeadSourceData1 = getUniqNotEmpty('external_lead_source_data1');
    const externalLeadSourceData2 = getUniqNotEmpty('external_lead_source_data2');
    const platforms = getUniqNotEmpty('crm_platform');
    const isOpp = getUniqNotEmpty('is_opp');
    const region = getUniqNotEmpty('region');
    const product = getUniqNotEmpty('product');
    const emailToLinkProps = merge({}, ...user.sessions.map(item => ({
      [item.email]: {
        externalId: item.external_id,
        email: item.email,
        isOpp: item.is_opp,
        platform: item.crm_platform
      }
    })));
    const formNames = (user.forms || []).map(getFormName);
    const marketingVsSales = getMarketingVsSalesTitle(user);

    const getUniqContent = (pages) => uniq(pages.map((page) => page.title));
    const getUniqContentPath = (pages) => uniq(pages.map((page) => page.path));
    const getUniqContentChannel = (pages) => uniq(pages.map((page) => page.contentChannel));

    const pages = flatten(getUniqNotEmpty('pages'));
    const uniqContent = getUniqContent(pages);
    const uniqContentPath = getUniqContentPath(pages);
    const uniqContentTypes = getUniqContentChannel(pages);
    const funnelStagesInDateRange =
      Object.keys(user.funnelStages).filter((key) => {
        const funnelStageDate = new Date(user.funnelStages[key]).getTime();

        return funnelStageDate >= startDateTS && funnelStageDate <= endDateTS;
      });
    const channelBeforeStages =
      user.sessions
        .filter(({startTime}) => {
          const startDate = new Date(startTime).getTime();

          return startDate >= startDateTS && startDate <= endDateTS;
        })
        .map(({channel, pages, campaign, startTime}) => {
          const notReachedFunnelStages = [];
          const startDate = new Date(startTime);

          Object.keys(user.funnelStages).forEach((key) => {
            if (funnelStagesInDateRange.includes(key) && new Date(user.funnelStages[key]) >= startDate) {
              notReachedFunnelStages.push(key);
            }
          });

          return {
            channel,
            campaign,
            contentType: getUniqContentChannel(pages),
            content: getUniqContentPath(pages),
            funnelStages: notReachedFunnelStages
          };
        });

    return {
      ...user,
      devices,
      countries,
      timeSinceFirst,
      timeSinceLast,
      firstTouchPoint,
      lastTouchPoint,
      emails,
      displayName,
      domainIcon,
      uniqChannels,
      uniqCampaigns,
      funnelStage,
      stageNickname,
      uniqCustom1,
      uniqCustom2,
      externalLeadSource,
      externalLeadSourceData1,
      externalLeadSourceData2,
      platforms,
      isOpp,
      emailToLinkProps,
      uniqContent,
      uniqContentPath,
      uniqContentTypes,
      channelBeforeStages,
      funnelStagesInDateRange,
      formNames,
      marketingVsSales,
      region,
      product
    };
  });
