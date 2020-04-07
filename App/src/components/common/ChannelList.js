import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import {throttle, uniqueId} from 'lodash';
import classnames from 'classnames';
import Component from 'components/Component';
import style from 'styles/common/channel-list.css';
import Tooltip from 'components/controls/Tooltip';
import {getNickname as getChannelNickname} from 'components/utils/channels';
import {getChannelIcon} from 'components/utils/filters/channels';

export default class Campaigns extends Component {

  style = style;

  static propTypes = {
    channels: PropTypes.arrayOf(PropTypes.string).isRequired,
    width: PropTypes.number.isRequired,
    defaultChannelShown: PropTypes.number,
    min: PropTypes.number,
    max: PropTypes.number
  }

  static defaultProps = {
    defaultChannelShown: 5,
    min: 3,
    max: 6
  }

  constructor(props) {
    super(props);

    this.state = {
      channelShown: props.defaultChannelShown
    };
    this.setChannelShown = throttle(this.setChannelShown, 300);
  }

  componentDidMount() {
    this.setChannelShown();
  }

  componentDidUpdate(prevProps) {
    const {width} = this.props;

    if (prevProps.width !== width) {
      this.setChannelShown();
    }
  }

  setChannelShown = () => {
    const {width, min, max} = this.props;

    const CHANNEL_ICON_WIDTH = 44;
    const availableSlot = Math.floor(width / CHANNEL_ICON_WIDTH);
    const channelShown = Math.max(min, Math.min(availableSlot, max));
    this.setState({channelShown});
  }

  getChannelNicknameWithDirect = (channel) => {
    return channel === 'direct' ? 'Direct' : getChannelNickname(channel);
  }

  getChannelNode = (channel, index) => {
    return (
      <Tooltip
        key={index}
        tip={this.getChannelNicknameWithDirect(channel)}
        className={this.classes.channelIcon}
        data-icon={getChannelIcon(channel)}
        id={uniqueId('channel-')}
      />
    );
  }

  render() {
    const {channels} = this.props;
    const {channelShown} = this.state;

    if (channels.length <= channelShown) {
      // show channel list normally
      return (
        <Fragment>
          {channels.map(this.getChannelNode)}
        </Fragment>
      );
    }

    // show some of the channel list with
    // '+X' icons to show the rest on tooltip
    return (
      <Fragment>
        {channels.slice(0, channelShown - 1).map(this.getChannelNode)}
        <Tooltip
          id={uniqueId('channel-')}
          html={false}
          tip='Other channels'
          TooltipProps={{
            type: 'light',
            className: this.classes.tooltip,
            children: channels.slice(channelShown - 1, channels.length).map((item, index) => (
              <div key={index} className={this.classes.tooltipContent}>
                <div className={this.classes.channelIcon} data-icon={getChannelIcon(item)}/>
                {this.getChannelNicknameWithDirect(item)}
              </div>
            ))
          }}
        >
          <div className={classnames(this.classes.channelIcon, this.classes.otherIcon)}>
            +{channels.length - channelShown + 1}
          </div>
        </Tooltip>
      </Fragment>
    );
  }
}
