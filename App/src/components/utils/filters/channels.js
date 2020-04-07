import * as channelsUtils from 'components/utils/channels'

const directChannel = 'direct'
const directLabel = 'Direct'

export const getChannelsWithNicknames = () =>
  [...channelsUtils.getChannelsWithNicknames(), { value: directChannel, label: directLabel }]
export const getChannelIcon = (channel) => channel === directChannel
    ? `plan:${directChannel}`
    : channelsUtils.getChannelIcon(channel)
export const getChannelNickname = (channel) => channel === directChannel
  ? directLabel
  : channelsUtils.getNickname(channel)
