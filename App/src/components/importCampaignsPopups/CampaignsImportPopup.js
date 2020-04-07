import React from 'react';
import PropTypes from 'prop-types';
import Component from 'components/Component';
import Select from 'components/controls/Select';
import style from 'styles/onboarding/onboarding.css';
import serverCommunication from 'data/serverCommunication';
import salesForceStyle from 'styles/indicators/salesforce-automatic-popup.css';
import Title from 'components/onboarding/Title';
import CRMStyle from 'styles/indicators/crm-popup.css';
import AuthorizationIntegrationPopup from 'components/common/AuthorizationIntegrationPopup';

export default class CampaignsImportPopup extends Component {

  style = style;
  styles = [salesForceStyle, CRMStyle];

  static propTypes = {
    accountIdPropertyName: PropTypes.string.isRequired,
    accountLabelPropertyName: PropTypes.string.isRequired,
    serverAccountIDPropertyName: PropTypes.string.isRequired,
    close: PropTypes.func,
    setDataAsState: PropTypes.func.isRequired,
    api: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    loadingStarted: PropTypes.func,
    loadingFinished: PropTypes.func,
    platformTitle: PropTypes.string.isRequired
  };

  static defaultProps = {
    accountIdPropertyName: 'id',
    accountLabelPropertyName: 'name',
    serverAccountIDPropertyName: 'accountId'
  };

  constructor(props) {
    super(props);
    this.state = {
      accounts: []
    };
  }

  getUserData = () => {
    return new Promise((resolve, reject) => {
      const objectToSend = {};
      objectToSend[this.props.serverAccountIDPropertyName] = this.state.selectedAccount;

      serverCommunication.serverRequest('put',
        this.props.api,
        JSON.stringify(objectToSend),
        localStorage.getItem('region'))
        .then((response) => {
          if (response.ok) {
            response.json()
              .then((data) => {
                this.props.setDataAsState(data);
                this.props.close && this.props.close();
                resolve(false);
              });
          }
          else if (response.status == 401) {
            history.push('/');
          }
          else {
            reject(new Error(`Error getting ${this.props.platformTitle} data`));
          }
        });
    });
  };

  open = () => {
    this.refs.authPopup.open();
  };

  afterDataRetrieved = (data) => {
    return new Promise((resolve, reject) => {
      this.setState({accounts: data});
      resolve(true);
    });
  };

  render() {
    const selects = {
      accounts: {
        select: {
          name: 'accounts',
          options: this.state.accounts
            .map(account => {
              const accountId = account[this.props.accountIdPropertyName];
              return {value: accountId, label: `${account[this.props.accountLabelPropertyName]}(${accountId})`};
            })
        }
      }
    };
    return <AuthorizationIntegrationPopup ref='authPopup'
                                          api={this.props.api}
                                          afterDataRetrieved={this.afterDataRetrieved}
                                          makeServerRequest={this.getUserData}
                                          width='680px'
                                          innerClassName={salesForceStyle.locals.inner}
                                          contentClassName={salesForceStyle.locals.content}
                                          loadingStarted={this.props.loadingStarted}
                                          loadingFinished={this.props.loadingFinished}
                                          platformTitle={this.props.platformTitle}
    >
      <Title title={this.props.title}/>
      <div className={this.classes.row}>
        <Select {...selects.accounts} selected={this.state.selectedAccount} onChange={(e) => {
          this.setState({selectedAccount: e.value});
        }}/>
      </div>
    </AuthorizationIntegrationPopup>;
  }
}