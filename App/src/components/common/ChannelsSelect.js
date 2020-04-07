import React from 'react';
import PropTypes from 'prop-types';
import {formatChannels, getChannelIcon} from 'components/utils/channels';
import Component from 'components/Component';
import Select from 'components/controls/Select';

export default class ChannelsSelect extends Component {

  static propTypes = {
    isChannelDisabled: PropTypes.func,
    withOtherChannels: PropTypes.bool
  };

  static defaultProps = {
    withOtherChannels: false
  };

  focus() {
    this.refs.input.focus();
  }

  render() {
    const {isChannelDisabled, withOtherChannels, ...otherProps} = this.props;

    const channelOptions = formatChannels(isChannelDisabled, withOtherChannels);

    const channels = {
      select: {
        name: 'channels',
        options: channelOptions
      }
    };

    return <Select
      {...otherProps}
      select={{
        menuTop: true,
        name: 'channels',
        onChange: (selected) => {
          update({
            selected: selected
          });
        },
        options: channels.select.options
      }}
      iconRendererOnValue={true}
      iconRendererOnOptions={true}
      iconFromValue={getChannelIcon}
      allowCreate={withOtherChannels}
      ref='input'
      promptTextCreator={value => `Add ${value} as a channel`}
    />;
  }
}