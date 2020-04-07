import React from 'react';
import Component from 'components/Component';
import Select from 'components/controls/Select';
import style from 'styles/onboarding/onboarding.css';
import serverCommunication from 'data/serverCommunication';
import CRMStyle from 'styles/indicators/crm-popup.css';
import Label from 'components/ControlsLabel';
import AuthorizationIntegrationPopup from 'components/common/AuthorizationIntegrationPopup';

export default class GoogleAutomaticPopup extends Component {

  style = style;
  styles = [CRMStyle];

  constructor(props) {
    super(props);
    this.state = {
      accounts: [],
      profiles: [],
      selectedAccount: null,
      selectedProfile: null,
      selectedBlogAccount: null,
      selectedBlogProfile: null,
      isWebsiteEnabled: true,
      isBlogEnabled: false
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data) {
      if (nextProps.data.profileId) {
        this.setState({selectedProfile: nextProps.data.profileId});
      }
      if (nextProps.data.blogProfileId) {
        this.setState({selectedBlogProfile: nextProps.data.blogProfileId});
      }
    }
  }

  open() {
    this.refs.authPopup.open();
  }

  afterDataRetrieved = (data) => {
    return new Promise((resolve, reject) => {
      this.setState({accounts: data.accounts, profiles: data.profiles});
      resolve(true);
    });
  };

  getUserData = () => {
    return new Promise((resolve, reject) => {
      serverCommunication.serverRequest('put',
        'googleapi',
        JSON.stringify({profileId: this.state.selectedProfile, blogProfileId: this.state.selectedBlogProfile}),
        localStorage.getItem('region'))
        .then((response) => {
          if (response.ok) {
            response.json()
              .then((data) => {
                this.props.setDataAsState(data);
                resolve();
              });
          }
          else if (response.status == 401) {
            history.push('/');
          }
          else {
            reject(new Error('Failed getting google analytics data'));
          }
        });
    });
  };

  render() {
    const selects = {
      account: {
        label: 'Account',
        select: {
          name: 'account',
          options: this.state.accounts
            .map(account => {
              return {value: account.id, label: account.name};
            })
        }
      },
      profile: {
        label: 'Profile',
        select: {
          name: 'profile',
          options: this.state.profiles
            .filter(profile => {
              return profile.accountId === this.state.selectedAccount;
            })
            .map(profile => {
              return {value: profile.id, label: profile.name};
            })
        }
      },
      blogProfile: {
        label: 'Profile',
        select: {
          name: 'profile',
          options: this.state.profiles
            .filter(profile => {
              return profile.accountId === this.state.selectedBlogAccount;
            })
            .map(profile => {
              return {value: profile.id, label: profile.name};
            })
        }
      }
    };
    return <AuthorizationIntegrationPopup ref='authPopup'
                                          api='googleapi'
                                          afterDataRetrieved={this.afterDataRetrieved}
                                          makeServerRequest={this.getUserData}
                                          loadingStarted={this.props.loadingStarted}
                                          loadingFinished={this.props.loadingFinished}
                                          width='340px'
                                          affectedIndicators={this.props.affectedIndicators}
                                          actualIndicators={this.props.actualIndicators}
                                          platformTitle='Google Analytics'
    >
      <div className={this.classes.row}>
        <Label style={{fontSize: '16px', color: '#24B10E'}} checkbox={this.state.isWebsiteEnabled} onChange={() => {
          this.setState({isWebsiteEnabled: !this.state.isWebsiteEnabled});
        }}>
          Website
        </Label>
      </div>
      <div className={this.classes.row}>
        <Select {...selects.account} selected={this.state.selectedAccount} disabled={!this.state.isWebsiteEnabled}
                onChange={(e) => {
                  this.setState({selectedAccount: e.value});
                }}/>
      </div>
      <div className={this.classes.row}>
        <Select {...selects.profile} selected={this.state.selectedProfile} disabled={!this.state.isWebsiteEnabled}
                onChange={(e) => {
                  this.setState({selectedProfile: e.value});
                }}/>
      </div>
      <div className={this.classes.row} style={{marginTop: '55px'}}>
        <Label style={{fontSize: '16px', color: '#24B10E'}} checkbox={this.state.isBlogEnabled} onChange={() => {
          this.setState({isBlogEnabled: !this.state.isBlogEnabled});
        }}>
          Blog
        </Label>
      </div>
      <div className={this.classes.row}>
        <Select {...selects.account} selected={this.state.selectedBlogAccount} disabled={!this.state.isBlogEnabled}
                onChange={(e) => {
                  this.setState({selectedBlogAccount: e.value});
                }}/>
      </div>
      <div className={this.classes.row}>
        <Select {...selects.blogProfile} selected={this.state.selectedBlogProfile}
                disabled={!this.state.isBlogEnabled}
                onChange={(e) => {
                  this.setState({selectedBlogProfile: e.value});
                }}/>
      </div>
    </AuthorizationIntegrationPopup>;
  }
}