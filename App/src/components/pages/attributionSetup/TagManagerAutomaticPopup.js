import serverCommunication from 'data/serverCommunication';
import React from 'react';
import Component from 'components/Component';
import AuthorizationIntegrationPopup from 'components/common/AuthorizationIntegrationPopup';
import Select from 'components/controls/Select';
import salesForceStyle from 'styles/indicators/salesforce-automatic-popup.css';
import style from 'styles/onboarding/onboarding.css';

export default class TagManagerAutomaticPopup extends Component {

  style = style;
  styles = [salesForceStyle];

  constructor(props) {
    super(props);

    this.state = {
      accounts: [],
      selectedAccount: null,
      containers: [],
      selectedContainer: null,
      workspaces: [],
      selectedWorkspace: null,
      code: null
    };
  }

  getContainersForUser = () => {
    serverCommunication.serverRequest('put',
      'tagmanager',
      JSON.stringify({type: 'containers', parent: this.state.selectedAccount}),
      localStorage.getItem('region'))
      .then((response) => {
        if (response.ok) {
          response.json()
            .then((data) => {
              this.setState({containers: data});
            });
        }
        else if (response.status == 401) {
          history.push('/');
        }
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  getWorkspacesForUser = () => {
    serverCommunication.serverRequest('put',
      'tagmanager',
      JSON.stringify({type: 'workspaces', parent: this.state.selectedContainer}),
      localStorage.getItem('region'))
      .then((response) => {
        if (response.ok) {
          response.json()
            .then((data) => {
              this.setState({workspaces: data});
            });
        }
        else if (response.status == 401) {
          history.push('/');
        }
      })
      .catch(function (err) {
        console.log(err);
      });
  };

  open() {
    this.refs.popup.open();
  }

  makeServerRequest = () => {
    return new Promise((resolve, reject) => {
      serverCommunication.serverRequest('put',
        'tagmanager',
        JSON.stringify({
          type: 'tag',
          parent: this.state.selectedWorkspace,
          tagCode: this.props.snippetScript
        }),
        localStorage.getItem('region'))
        .then((response) => {
          if (response.ok) {
            window.alert('Tag was created and published successfully');
            resolve(false);
          }
          else if (response.status == 401) {
            history.push('/');
          }
          else {
            reject(new Error('Error creating tag in Tag Manager'));
          }
        })
        .catch(function (err) {
          reject(new Error('Error creating tag in Tag manager'));
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
              return {value: account.path, label: account.name};
            })
        }
      },
      container: {
        label: 'Container',
        select: {
          name: 'container',
          options: this.state.containers
            .map(container => {
              return {value: container.path, label: container.name};
            })
        }
      },
      workspace: {
        label: 'Workspace',
        select: {
          name: 'workspace',
          options: this.state.workspaces
            .map(workspace => {
              return {value: workspace.path, label: workspace.name};
            })
        }
      }
    };

    return <AuthorizationIntegrationPopup
      ref='popup'
      api='tagmanager'
      width={'680px'}
      innerClassName={salesForceStyle.locals.inner}
      contentClassName={salesForceStyle.locals.content}
      afterDataRetrieved={(data) => {
        return new Promise((resolve, reject) => {
          this.setState({accounts: data});
          resolve(true);
        });
      }}
      makeServerRequest={this.makeServerRequest}
      platformTitle='Tag Manager'
    >

      <div className={this.classes.row}>
        <Select {...selects.account} selected={this.state.selectedAccount}
                onChange={(e) => {
                  this.setState({selectedAccount: e.value}, this.getContainersForUser);
                }}/>
      </div>
      <div className={this.classes.row}>
        <Select {...selects.container} selected={this.state.selectedContainer}
                onChange={(e) => {
                  this.setState({selectedContainer: e.value}, this.getWorkspacesForUser);
                }}/>
      </div>
      <div className={this.classes.row}>
        <Select {...selects.workspace} selected={this.state.selectedWorkspace}
                onChange={(e) => {
                  this.setState({selectedWorkspace: e.value});
                }}/>
      </div>
    </AuthorizationIntegrationPopup>;
  }
}