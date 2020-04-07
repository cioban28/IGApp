import {isNil, slice} from 'lodash';
import moment from 'moment';

export const NUMBER_OF_FUTURE_MONTHS = 12;

export const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function formatDate(dateStr) {
  if (dateStr) {
    const [monthNum, yearNum] = dateStr.split('/');
    return `${monthNames[monthNum - 1]} ${yearNum.substr(2, 2)}`;
  }
  else {
    return null;
  }
}

export function getDates(dateStr, includingPast = false, includingFuture = true) {
  return getDatesSpecific(dateStr,
    includingPast ? NUMBER_OF_FUTURE_MONTHS : 0,
    includingFuture ? NUMBER_OF_FUTURE_MONTHS : 0);
}

function getDateOffset(dates, division) {
  const lastIndexOfFirstQuarter = dates && dates.findIndex(date => {
    const month = date.getMonth();
    return (month + 1) % division === 0;
  });

  return (!isNil(lastIndexOfFirstQuarter) && lastIndexOfFirstQuarter >= 0) ? lastIndexOfFirstQuarter + 1 : null;
}

export function getQuarterOffset(dates) {
  return getDateOffset(dates, 3);
}

export function getAnnualOffset(dates) {
  return getDateOffset(dates, 12);
}

export function formatSpecificDate(date, isSystemDate) {
  const monthStr = isSystemDate ? date.getMonth() + 1 : monthNames[date.getMonth()];
  const yearStr = isSystemDate ? date.getFullYear().toString() : date.getFullYear().toString().substr(2, 2);
  const delimiter = isSystemDate ? '/' : ' ';
  return monthStr + delimiter + yearStr;
}

export function getRawDatesSpecific(dateStr, numberOfPast, numberOfFuture) {
  if (dateStr) {
    const dates = [];
    const planDate = dateStr.split('/');
    for (let i = -numberOfPast; i < numberOfFuture; i++) {
      const date = new Date(planDate[1], planDate[0] - 1);
      date.setMonth(date.getMonth() + i);
      dates.push(new Date(date));
    }
    return dates;
  }
  return [];
}

export function getDatesSpecific(dateStr, numberOfPast, numberOfFuture, isSystemDates = false) {
  const rawDates = getRawDatesSpecific(dateStr, numberOfPast, numberOfFuture);
  return rawDates.map(date => formatSpecificDate(date, isSystemDates));
}

export function getEndOfMonthDate(date) {
  const endOfMonthDate = new Date(date);
  endOfMonthDate.setDate(1);
  endOfMonthDate.setMonth(endOfMonthDate.getMonth() + 1);
  endOfMonthDate.setDate(0);
  return endOfMonthDate;
}

export function getEndOfMonthString(date) {
  const dateStr = formatSpecificDate(date, false);
  const [monthStr, year] = dateStr.split(' ');
  const month = monthNames.indexOf(monthStr);
  const endOfMonthDate = new Date(year, month + 1, 0);
  return `${endOfMonthDate.getDate()} ${monthStr} ${year}`;
}

export function getNumberOfDaysBetweenDates(toDate, fromDate = new Date()) {
  return Math.max(Math.ceil((toDate.getTime() - fromDate.getTime()) / (24 * 60 * 60 * 1000)), 0);
}

export function formatTimestamp(dateString) {
  const date = new Date(dateString);

  const day = date.getDate();
  const monthIndex = date.getMonth();
  const year = date.getFullYear().toString().substr(2, 2);

  return `${day}-${monthNames[monthIndex]}-${year}`;
}

export const customDateFormat = 'MMM D';

export const formatCustomDate = ({startDate, endDate}) => {
  return `${moment(new Date(startDate)).format(customDateFormat)} - ${moment(new Date(endDate)).format(customDateFormat)}`;
};

export const getStartOfMonthTimestamp = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getTime();

export const createCustomMonthlyArray = () => {
  const monthNamesCopy = [...monthNames];

  return [
    // rest of months in the current year
    ...(slice(monthNamesCopy, moment().month())
        .map(month => ({label: month, value: '', year: moment().year()}))
    ),
    // rest of months in the next year
    ...(slice(monthNamesCopy, 0, moment().month())
        .map(month => ({label: month, value: '', year: moment().year() + 1}))
    )
  ];
};

export const createCustomQuarterlyArray = () => ([
  // rest of quarters in the current year
  ...(new Array(4 - moment().quarter() + 1)
      .fill('')
      .map((quarter, index) => ({label: `Q${moment().quarter() + index}`, value: '', year: moment().year()}))
  ),
  // rest of quarters in the next year
  ...(new Array(4 - (4 - moment().quarter() + 1))
      .fill('')
      .map((quarter, index) => ({label: `Q${index + 1}`, value: '', year: moment().year() + 1}))
  )
]);

export const createCustomArrays = () => {
  const monthly = createCustomMonthlyArray();
  const quarterly = createCustomQuarterlyArray();

  return {monthly, quarterly};
};

export const getMonthsBetweenDates = (start, end) => {
  const dateStart = moment(start);
  const dateEnd = moment(end);
  const interim = dateStart.clone();
  const timeValues = [];

  while (dateEnd > interim || interim.format('M') === dateEnd.format('M')) {
    timeValues.push(interim.format('MMM YY'));
    interim.add(1, 'month');
  }
  return timeValues;
};