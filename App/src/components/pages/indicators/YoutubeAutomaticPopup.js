import React from 'react';
import Component from 'components/Component';
import serverCommunication from 'data/serverCommunication';
import SimpleIntegrationPopup from 'components/pages/indicators/SimpleIntegrationPopup';

export default class YoutubeAutomaticPopup extends Component {

  constructor(props) {
    super(props);
    this.state = {
      id: '',
      fullIdentifier: '',
      type: '',
      hidden: true
    };
  }

  open() {
    this.refs.simpleIntegrationPopup.open();
  }

  handleChangeIdentifier(event) {
    this.setState({fullIdentifier: event.target.value});
    if (event.target.value.match(/.*youtube.com\/channel\/.*/)) {
      this.setState({
        type: 'channel',
        id: event.target.value.replace(/.*youtube.com\/channel\//, '')
      });
    }
    else if (event.target.value.match(/.*youtube.com\/user\/.*/)) {
      this.setState({
        type: 'user',
        id: event.target.value.replace(/.*youtube.com\/user\//, '')
      });
    }
  }

  render() {
    return <SimpleIntegrationPopup ref="simpleIntegrationPopup"
                                   getDataSuccess={this.props.setDataAsState}
                                   serverRequest={() => serverCommunication.serverRequest('post',
                                     'youtubeapi',
                                     JSON.stringify({type: this.state.type, id: this.state.id}),
                                     localStorage.getItem('region'))}
                                   width='410px'
                                   title='Please enter your youtube channel id/URL'
                                   onChange={this.handleChangeIdentifier.bind(this)}
                                   placeHolder='https://www.youtube.com/channel/channel_id'
                                   value={this.state.fullIdentifier}
                                   affectedIndicators={this.props.affectedIndicators}
                                   actualIndicators={this.props.actualIndicators}
                                   platformTitle='Youtube'
    />;
  }
}