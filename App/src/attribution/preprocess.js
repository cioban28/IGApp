import {rbs} from '../utils';
import {mapValues} from 'lodash';

function preprocess(dataByGroupByUnfiltered, startDateUnixTS, endDateUnixTS) {  
  // filter out irrelevant users
  // convert funnel stages

  // then for each relevant user, convert session timestamps
  // and sort sessions to filterredSessions

  // convert timestamps to unix epoch format

  const rangeLow = startDateUnixTS;
  const rangeHigh = endDateUnixTS;

  const res = mapValues(dataByGroupByUnfiltered, data =>
    // all data that has a funnel change since start date
    filterArrayForRelevantDates(data, rangeLow, rangeHigh, user => preprocessUser(user, startDateUnixTS * 1000, endDateUnixTS * 1000))
  );
  return res;
}

/**
 * @param {any[]} data
 * @param {number} rl rl-> range low, the minimum date in unix epoch to include records since
 * @param {number} rh rh-> range high, the maximun date in unix epoch to include records until
 */
function filterArrayForRelevantDates(data, rl, rh, filterredInCallback) {
  const startIdx =
    (data.length > 0 && data[0].tidx.h - rl > 0) ?
      0 :
      rbs(data, rl, ({tidx}, needle) => tidx.h - needle);
  if (false === startIdx) {
    return [];
  }

  const filtered = data.slice(startIdx).filter((user) => {
    const {tidx, funnelStages} = user;
    const {h, l} = tidx;
    if (l > rh) {
      return false;
    }
    if (h < rh || l > rl || (h >= rh && l <= rl) || (funnelStages && !!Object.values(funnelStages).find(stageChange => stageChange > rl && stageChange < rh))) {
      filterredInCallback(user);
      return true;
    }
    else {
      return false;
    }
  });

  return filtered;
}

function preprocessUser(user, startDateTS, endDateTS) {
  // convert funnelStages
  // delete tidx
  // create filterred sessions

  if (user.preprocessed) {
    return;
  }

  convertFunnelStagesAndDeleteTidx(user);
  user.filterredSessions = {};
  user.sessions.forEach(session => {
    preprocessSession(user, session, startDateTS, endDateTS);
  });

  user.preprocessed = true;
}

const convertStartTimeTimestamp = item => {
  if (item.startTime) {
    item.startTime = convertTimestamp(item.startTime);
  }
  if (item.timestamp) {
    item.timestamp = convertTimestamp(item.timestamp);
  }
};

function addToFilteredSessions(user, startDateTS, endDateTS, session) {
  user.funnelStages && Object.keys(user.funnelStages).forEach(indicator => {
    const funnelStage = user.funnelStages[indicator];
    const isIn = (startDateTS ? funnelStage > startDateTS : true) && (endDateTS ? funnelStage < endDateTS : true) && session.startTime <= funnelStage;
    if (isIn) {
      const arr = user.filterredSessions[indicator] || (user.filterredSessions[indicator] = []);
      arr.push(session);
    }
  });
}

function preprocessSession(user, session, startDateTS, endDateTS) {
  convertStartTimeTimestamp(session);
  if (session.pages) {
    session.pages.forEach(convertStartTimeTimestamp);
  }

  convertFunnelStagesAndDeleteTidx(session);
  addToFilteredSessions(user, startDateTS, endDateTS, session);

}

function addFilteredSessions(users, startDateTS, endDateTS) {
  return users.map(user => {
    preprocessUser(user, startDateTS, endDateTS);
    return user;
  });
}

const convertTimestamp = timestamp => {
  const newTimestamp = timestamp * 1000;
   return newTimestamp <= Date.now() ? newTimestamp : timestamp;
};

const funnelStageConvertor = (funnelStages, key) => funnelStages[key] = convertTimestamp(funnelStages[key]);

/**
 * Call this function after records have been filterred, otherwise filterring will miss the index (tidx)
 * @param {{funnelStages:{}}} item
 */
function convertFunnelStagesAndDeleteTidx(item, funnelStageCallback = null) {

  const compute = funnelStageCallback ?
    key => {
      funnelStageConvertor(item.funnelStages, key);
      funnelStageCallback(key);
    }
    : key => funnelStageConvertor(item.funnelStages, key);

  Object.keys(item.funnelStages).forEach(compute);

  // this index has served its purpose and can be deleted
  delete item.tidx;
}

export {
  addFilteredSessions,
  preprocess,
  filterArrayForRelevantDates
};