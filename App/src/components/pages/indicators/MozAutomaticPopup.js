import React from 'react';
import Component from 'components/Component';
import serverCommunication from 'data/serverCommunication';
import SimpleIntegrationPopup from 'components/pages/indicators/SimpleIntegrationPopup';

export default class MozAutomaticPopup extends Component {

  constructor(props) {
    super(props);
    this.state = {
      url: props.defaultUrl || ''
    };
  }

  open() {
    this.refs.simpleIntegrationPopup.open();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.defaultUrl !== nextProps.defaultUrl) {
      this.setState({url: nextProps.defaultUrl});
    }
  }

  handleChange(event) {
    this.setState({url: event.target.value});
  }

  render() {
    return <SimpleIntegrationPopup ref="simpleIntegrationPopup"
                                   getDataSuccess={this.props.setDataAsState}
                                   serverRequest={() => serverCommunication.serverRequest('post',
                                     'mozapi',
                                     JSON.stringify({url: this.state.url}),
                                     localStorage.getItem('region'))}
                                   title='Please enter your website'
                                   placeHolder='http://www.website.com'
                                   onChange={this.handleChange.bind(this)}
                                   value={this.state.url}
                                   affectedIndicators={this.props.affectedIndicators}
                                   actualIndicators={this.props.actualIndicators}
                                   loadingStarted={this.props.loadingStarted}
                                   loadingFinished={this.props.loadingFinished}
                                   closeWhileWaitingForRequest={true}
                                   platformTitle='Moz'
    />;
  }
}