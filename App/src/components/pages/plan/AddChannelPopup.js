import React from 'react';
import Component from 'components/Component';
import classnames from 'classnames';
import style from 'styles/plan/add-channel-popup.css';
import Page from 'components/Page';
import Button from 'components/controls/Button';
import Textfield from 'components/controls/Textfield';

export default class AddChannelPopup extends Component {

  style = style;

  initialState = {
    visibleChannels: this.props.channels.root.children,
    expandedChannels: [],
    otherChannel: false,
    otherChannelName: ''
  };

  constructor(props) {
    super(props);
    this.state = {...this.initialState};
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps !== this.props) {
      this.setState({...this.initialState});

      if (nextProps.initialExpandedChannel) {
        this.toggleChannel(nextProps.initialExpandedChannel);
      }
    }
  }

  toggleChannel(channelId) {
    const {channels} = this.props;
    const {visibleChannels, expandedChannels} = this.state;
    const channelExpandedIndex = expandedChannels.indexOf(channelId);
    const channelVisibleIndex = visibleChannels.indexOf(channelId);
    const channel = channels[channelId];

    if (!channel) {
        return;
    }

    let newExpandedChannels;
    let newVisibleChannels;

    if (channelExpandedIndex === -1) {
      newVisibleChannels = visibleChannels.slice();
      newVisibleChannels.splice(channelVisibleIndex + 1, 0, ...channel.children);
      newExpandedChannels = expandedChannels.concat(channelId);
    }
    else {
      newExpandedChannels = expandedChannels.slice();
      newExpandedChannels.splice(channelExpandedIndex, 1);
      newVisibleChannels = visibleChannels.slice();

      const sameOrLowerLevelIndex = visibleChannels
        .slice(channelVisibleIndex + 1)
        .findIndex(chId => channels[chId].level <= channels[channelId].level);
      const hiddenChannels = newVisibleChannels.splice(channelVisibleIndex + 1, sameOrLowerLevelIndex);

      newExpandedChannels = newExpandedChannels.filter(ch => !hiddenChannels.includes(ch));
    }

    this.setState({
      expandedChannels: newExpandedChannels,
      visibleChannels: newVisibleChannels
    });
  }

  handleChannelClick(channelId) {
    const channel = this.props.channels[channelId];

    if (channel.isOther) {
      this.setState({otherChannel: channelId},
        () => {
          this.refs.otherChannelTextbox.focus();
        }
      );
      return;
    }

    if (channel.isLeaf) {
      this.props.onChannelChoose(channel.id, channel.isOther);
      return;
    }

    this.toggleChannel(channelId);
  }

  render() {
    const {visibleChannels, expandedChannels} = this.state;
    return (
      <div hidden={this.props.hidden}>
        <Page popup={true} width={'400px'}>
          <div className={this.classes.title}>
            Add a channel
          </div>
          <ul className={this.classes.channels}>
            {
              visibleChannels
                .filter(channelId => !this.props.planChannels.some(
                  pChannel => pChannel.id === this.props.channels[channelId].id))
                .map((channelId) => {
                  const channel = this.props.channels[channelId];
                  const className = classnames(this.classes.channel, {
                    [this.classes.expandedChannel]: expandedChannels.includes(channelId),
                    [this.classes.leafChannel]: channel.isLeaf
                  });

                  return (
                    <li
                      key={channelId}
                      style={{marginLeft: `${20 * (channel.level - 1)}px`}}
                      className={className}
                      onClick={() => this.handleChannelClick(channelId)}
                    >
                      {channel.title}
                    </li>
                  );
                })
            }
          </ul>
          <Button
            type="secondary"
            style={{width: '72px'}}
            onClick={this.props.close}>
            Cancel
          </Button>
          <div hidden={!this.state.otherChannel}>
            <div style={{display: 'flex', marginTop: '20px'}}>
              <Textfield ref="otherChannelTextbox" value={this.state.otherChannelName} style={{
                width: '292px'
              }} onChange={
                (e) => {
                  this.setState({otherChannelName: e.target.value});
                }
              }/>
              <Button type="primary" style={{
                width: '72px',
                margin: '0 20px'
              }} onClick={
                () => {
                  if (this.state.otherChannelName) {
                    this.props.addUnknownChannel(this.state.otherChannelName,
                      this.props.channels[this.state.otherChannel].path);
                    this.setState({otheChannel: false, otherChannelName: ''});
                  }
                }
              }> Enter
              </Button>
            </div>
          </div>
        </Page>
      </div>
    );
  }
}
