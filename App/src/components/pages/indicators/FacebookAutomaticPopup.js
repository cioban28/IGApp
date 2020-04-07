import React from 'react';
import Component from 'components/Component';
import serverCommunication from 'data/serverCommunication';
import SimpleIntegrationPopup from 'components/pages/indicators/SimpleIntegrationPopup';

export default class FacebookAutomaticPopup extends Component {

  constructor(props) {
    super(props);
    this.state = {
      identifier: ''
    };
  }

  open() {
    this.refs.simpleIntegrationPopup.open();
  }

  handleChangeIdentifier(event) {
    this.setState({identifier: event.target.value});
  }

  render() {
    return <SimpleIntegrationPopup ref="simpleIntegrationPopup"
                                   getDataSuccess={this.props.setDataAsState}
                                   serverRequest={() => serverCommunication.serverRequest('post',
                                     'facebookapi',
                                     JSON.stringify({identifier: this.state.identifier}),
                                     localStorage.getItem('region'))}
                                   onChange={this.handleChangeIdentifier.bind(this)}
                                   title='Please enter your Facebook company page name/URL'
                                   placeHolder='https://www.facebook.com/ExamplePage'
                                   value={this.state.identifier}
                                   affectedIndicators={this.props.affectedIndicators}
                                   actualIndicators={this.props.actualIndicators}
                                   platformTitle='Facebook'
    />;
  }
}