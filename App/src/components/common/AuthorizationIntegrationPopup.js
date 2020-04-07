import React from 'react';
import Component from 'components/Component';
import style from 'styles/onboarding/onboarding.css';
import serverCommunication from 'data/serverCommunication';
import IntegrationPopup from 'components/common/IntegrationPopup';

export default class AuthorizationIntegrationPopup extends Component {

  style = style;

  componentDidMount() {
    if (!this.props.data) {
      serverCommunication.serverRequest('get', this.props.api)
        .then((response) => {
          if (response.ok) {
            response.json()
              .then((data) => {
                this.setState({url: data});
              });
          }
          else if (response.status == 401) {
            history.push('/');
          }
          else {
            console.log('error getting data for api: ' + api);
          }
        });
    }
  }

  open() {
    this.getAuthorization();
  }

  getAuthorization = () => {
    if (!this.props.data) {
      const win = window.open(this.state.url);
      const timer = setInterval(() => {
        if (win.closed) {
          clearInterval(timer);
          const code = localStorage.getItem('code');
          if (code) {
            localStorage.removeItem('code');
            this.afterAuthorization(code);
          }
        }
      }, 1000);
    }
    else {
      this.afterAuthorization();
    }
  };

  loadingStarted = () => {
    this.props.loadingStarted && this.props.loadingStarted();
  };

  loadingFinished = () => {
    this.props.loadingFinished && this.props.loadingFinished();
  };

  afterAuthorization = (code) => {
    this.loadingStarted();
    serverCommunication.serverRequest('post',
      this.props.afterAuthorizationApi || this.props.api,
      JSON.stringify({code: code}),
      localStorage.getItem('region'))
      .then((response) => {
        if (response.ok) {
          response.json()
            .then((data) => {
              this.props.afterDataRetrieved(data)
                .then((showPopup) => {
                  this.loadingFinished();
                  this.refs.integrationPopup.propogateStep(!showPopup);
                })
                .catch((error) => {
                  this.loadingFinished();
                  window.alert(error.message);
                });
            });
        }
        else if (response.status == 401) {
          this.loadingFinished();
          history.push('/');
        }
        else {
          this.loadingFinished();
          window.alert(`Error authorizing connection to ${this.props.platformTitle}`);
        }
      });
  };

  render() {
    return <div style={{width: '100%'}}>
      <IntegrationPopup {...this.props}
                        makeServerRequest={this.props.makeServerRequest}
                        ref="integrationPopup"
                        closeWhileWaitingForRequest={true}
                        platformTitle={this.props.platformTitle}
      >
        {this.props.children}
      </IntegrationPopup>
    </div>;
  }
}