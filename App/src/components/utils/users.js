import get from 'lodash/get';
import {isMarketingChannel} from 'components/utils/channels';
import moment from 'moment';
import { formatNumberWithDecimalPoint } from 'components/utils/budget';

export const getFormName = (form) => {
  const classes = JSON.parse(form.classes);

  return `#${form.id} ${classes.map((c) => `.${c}`).join(' ')}`;
};

export const EXTERNAL_LEAD_SOURCE = 'CRM lead source';
export const EXTERNAL_LEAD_SOURCE_DATA1 = 'CRM lead source details 1';
export const EXTERNAL_LEAD_SOURCE_DATA2 = 'CRM lead source details 2';

export const MARKETING_GENERATED = 'Marketing generated';
export const MARKETING_ASSISTED = 'Marketing assisted';
export const NO_MARKETING = 'Sales only';

const MARKETING_VS_SALES_ORDER = [MARKETING_GENERATED, MARKETING_ASSISTED, NO_MARKETING];

export const sortMarketingVsSalesOptions = (options) =>
  options.slice().sort((a, b) => MARKETING_VS_SALES_ORDER.indexOf(a) - MARKETING_VS_SALES_ORDER.indexOf(b));

export const getMarketingVsSales = (user) => {
  const firstSession = get(user, ['sessions', 0], {});
  const isMarketingGenerated = isMarketingChannel(firstSession.channel);
  const isMarketingAssisted = !isMarketingGenerated && user.sessions.some(item => isMarketingChannel(item.channel));

  return {
    isMarketingGenerated,
    isMarketingAssisted
  };
};

export const getMarketingVsSalesTitle = (user) => {
  const {isMarketingGenerated, isMarketingAssisted} = getMarketingVsSales(user);

  if (isMarketingGenerated) {
    return MARKETING_GENERATED;
  }

  if (isMarketingAssisted) {
    return MARKETING_ASSISTED;
  }

  return NO_MARKETING;
};

export const GROUP_BY = {
  USERS: 0,
  ACCOUNT: 1
};

export const LABELS = {
  ACCOUNTS: 'Accounts',
  USERS: 'People'
};

export const SINGULAR_LABELS = {
  ACCOUNTS: 'account',
  USERS: 'person'
};

const filterBySearch = ({displayName, emails}, search) => {
  const dp = (displayName || '').toLowerCase();

  return !search
    || dp.includes(search)
    || emails.some((email) => email.includes(search));
};

export const filter = (users, filters, search) => users
  .filter((item) => filters.every((filter) => filter.assert(item)))
  .filter((item) => filterBySearch(item, search));

export const COLUMNS = [
    {
        label: 'Channels',
        value: 'Channels'
    },
    {
        label: 'Stage',
        value: 'Stage'
    },
    {
        label: '# of sessions',
        value: 'Sessions'
    },
    {
        label: 'Country',
        value: 'Country'
    },
    {
        label: 'First Touch',
        value: 'FirstTouch'
    },
    {
        label: 'Last Touch',
        value: 'LastTouch'
    },
    {
        label: 'Device',
        value: 'Device'
    },
    {
        label: 'Product',
        value: 'Product'
    },
    {
        label: 'Region',
        value: 'Region'
    },
];

export const CRM_LEAD_SOURCE_COLUMNS = [
    {
        label: EXTERNAL_LEAD_SOURCE,
        value: 'ExternalLeadSource'
    },
    {
        label: EXTERNAL_LEAD_SOURCE_DATA1,
        value: 'ExternalLeadSourceData1'
    },
    {
        label: EXTERNAL_LEAD_SOURCE_DATA2,
        value: 'ExternalLeadSourceData2'
    }
];

export const HUBSPOT_LINK_PREFIX = 'https://app.hubspot.com/contacts/';

export function getDateRange(startDate, endDate, monthsExceptThisMonth) {
    const start = startDate
        ? new Date(startDate)
        : moment()
            .subtract(monthsExceptThisMonth, 'months')
            .startOf('month')
            .toDate();
    const end = endDate
        ? new Date(endDate)
        : moment()
            .endOf('month')
            .toDate();

    return { start, end };
}

export function averageFormatter(data, length) {
    if (!length) {
        return 0;
    }
    return formatNumberWithDecimalPoint(data / length);
}
