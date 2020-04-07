import React from 'react';
import Component from 'components/Component';
import style from 'styles/onboarding/onboarding.css';
import serverCommunication from 'data/serverCommunication';
import Select from 'components/controls/Select';
import salesForceStyle from 'styles/indicators/salesforce-automatic-popup.css';
import Title from 'components/onboarding/Title';
import Label from 'components/ControlsLabel';
import MultiSelect from 'components/controls/MultiSelect';
import CRMStyle from 'styles/indicators/crm-popup.css';
import AuthorizationIntegrationPopup from 'components/common/AuthorizationIntegrationPopup';
import {getTitle} from 'components/utils/indicators';

export default class HubspotAutomaticPopup extends Component {

  style = style;
  styles = [salesForceStyle, CRMStyle];

  constructor(props) {
    super(props);
    this.state = {
      mapping: {},
      owners: []
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data && nextProps.data.mapping) {
      this.setState({mapping: nextProps.data.mapping});
    }
  }

  open() {
    this.refs.authPopup.open();
  }

  afterDataRetrieved = (data) => {
    return new Promise((resolve, reject) => {
      this.setState({owners: data});
      resolve(true);
    });
  };

  getUserData = () => {
    return new Promise((resolve, reject) => {
      serverCommunication.serverRequest('put',
        'hubspotapi',
        JSON.stringify({mapping: this.state.mapping}),
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
            reject(new Error('Error retrieving Hubspot data'));
          }
        })
        .catch(function (err) {
          reject(new Error('Error retrieving Hubspot data'));
        });
    });
  };

  toggleCheckbox(indicator) {
    let mapping = this.state.mapping;
    if (mapping[indicator] !== undefined) {
      delete mapping[indicator];
    }
    else {
      mapping[indicator] = '';
    }
    this.setState({mapping: mapping});
  }

  toggleCheckboxMulti(key) {
    let mapping = this.state.mapping;
    if (mapping[key]) {
      delete mapping[key];
    }
    else {
      mapping[key] = [];
    }
    this.setState({mapping: mapping});
  }

  handleChange(indicator, event) {
    let mapping = this.state.mapping;
    mapping[indicator] = event.value;
    this.setState({mapping: mapping});
  }

  handleChangeMulti(key, event) {
    let mapping = this.state.mapping;
    mapping[key] = event.map((obj) => {
      return obj.value;
    });
    this.setState({mapping: mapping});
  }

  render() {
    const selects = {
      tables: {
        select: {
          name: 'tables',
          options: [
            {value: 'contacts', label: 'contacts'},
            {value: 'companies', label: 'companies'}
          ]
        }
      },
      owners: {
        select: {
          name: 'owners',
          options: this.state.owners
            .map(owner => {
              return {value: owner.ownerId, label: owner.firstName + ' ' + owner.lastName + ' (' + owner.email + ')'};
            })
        }
      }
    };
    return <AuthorizationIntegrationPopup width={'680px'}
                                          innerClassName={salesForceStyle.locals.inner}
                                          contentClassName={salesForceStyle.locals.content}
                                          afterDataRetrieved={this.afterDataRetrieved}
                                          api='hubspotapi'
                                          makeServerRequest={this.getUserData}
                                          ref='authPopup'
                                          loadingStarted={this.props.loadingStarted}
                                          loadingFinished={this.props.loadingFinished}
                                          affectedIndicators={this.props.affectedIndicators}
                                          actualIndicators={this.props.actualIndicators}
                                          platformTitle='Hubspot'
    >
      <Title title="Hubspot" subTitle="Define which stages should be taken from Hubspot"/>
      <div className={this.classes.row}>
        <div className={this.classes.cols}>
          <div className={this.classes.colLeft} style={{flexGrow: 'initial'}}>
            <Label checkbox={this.state.mapping.blogSubscribers !== undefined}
                   onChange={this.toggleCheckbox.bind(this, 'blogSubscribers')}
                   className={salesForceStyle.locals.label}>{getTitle('blogSubscribers')}</Label>
          </div>
          <div className={this.classes.colCenter} style={{flexGrow: 'initial'}}>
            <div className={salesForceStyle.locals.arrow}/>
          </div>
          <div className={this.classes.colRight}>
            <Select {...selects.tables} selected={this.state.mapping.blogSubscribers}
                    onChange={this.handleChange.bind(this, 'blogSubscribers')}
                    disabled={this.state.mapping.blogSubscribers === undefined} style={{width: '166px'}}
                    placeholder="Group By"/>
          </div>
        </div>
      </div>
      <div className={this.classes.row}>
        <div className={this.classes.cols}>
          <div className={this.classes.colLeft} style={{flexGrow: 'initial'}}>
            <Label checkbox={this.state.mapping.MCL !== undefined} onChange={this.toggleCheckbox.bind(this, 'MCL')}
                   className={salesForceStyle.locals.label}>{getTitle('MCL')}</Label>
          </div>
          <div className={this.classes.colCenter} style={{flexGrow: 'initial'}}>
            <div className={salesForceStyle.locals.arrow}/>
          </div>
          <div className={this.classes.colRight}>
            <Select {...selects.tables} selected={this.state.mapping.MCL}
                    onChange={this.handleChange.bind(this, 'MCL')} disabled={this.state.mapping.MCL === undefined}
                    style={{width: '166px'}} placeholder="Group By"/>
          </div>
        </div>
      </div>
      <div className={this.classes.row}>
        <div className={this.classes.cols}>
          <div className={this.classes.colLeft} style={{flexGrow: 'initial'}}>
            <Label checkbox={this.state.mapping.MQL !== undefined} onChange={this.toggleCheckbox.bind(this, 'MQL')}
                   className={salesForceStyle.locals.label}>{getTitle('MQL')}</Label>
          </div>
          <div className={this.classes.colCenter} style={{flexGrow: 'initial'}}>
            <div className={salesForceStyle.locals.arrow}/>
          </div>
          <div className={this.classes.colRight}>
            <Select {...selects.tables} selected={this.state.mapping.MQL}
                    onChange={this.handleChange.bind(this, 'MQL')} disabled={this.state.mapping.MQL === undefined}
                    style={{width: '166px'}} placeholder="Group By"/>
          </div>
        </div>
      </div>
      <div className={this.classes.row}>
        <div className={this.classes.cols}>
          <div className={this.classes.colLeft} style={{flexGrow: 'initial'}}>
            <Label checkbox={this.state.mapping.SQL !== undefined} onChange={this.toggleCheckbox.bind(this, 'SQL')}
                   className={salesForceStyle.locals.label}>{getTitle('SQL')}</Label>
          </div>
          <div className={this.classes.colCenter} style={{flexGrow: 'initial'}}>
            <div className={salesForceStyle.locals.arrow}/>
          </div>
          <div className={this.classes.colRight}>
            <Select {...selects.tables} selected={this.state.mapping.SQL}
                    onChange={this.handleChange.bind(this, 'SQL')} disabled={this.state.mapping.SQL === undefined}
                    style={{width: '166px'}} placeholder="Group By"/>
          </div>
        </div>
      </div>
      <div className={this.classes.row}>
        <div className={this.classes.cols}>
          <div className={this.classes.colLeft} style={{flexGrow: 'initial'}}>
            <Label checkbox={this.state.mapping.opps !== undefined}
                   onChange={this.toggleCheckbox.bind(this, 'opps')}
                   className={salesForceStyle.locals.label}>{getTitle('opps')}</Label>
          </div>
          <div className={this.classes.colCenter} style={{flexGrow: 'initial'}}>
            <div className={salesForceStyle.locals.arrow}/>
          </div>
          <div className={this.classes.colRight}>
            <Select {...selects.tables} selected={this.state.mapping.opps}
                    onChange={this.handleChange.bind(this, 'opps')} disabled={this.state.mapping.opps === undefined}
                    style={{width: '166px'}} placeholder="Group By"/>
          </div>
        </div>
      </div>
      <div className={this.classes.row}>
        <div className={this.classes.cols}>
          <div className={this.classes.colLeft} style={{flexGrow: 'initial'}}>
            <Label checkbox={this.state.mapping.users !== undefined}
                   onChange={this.toggleCheckbox.bind(this, 'users')}
                   className={salesForceStyle.locals.label}>{getTitle('users')}</Label>
          </div>
          <div className={this.classes.colCenter} style={{flexGrow: 'initial'}}>
            <div className={salesForceStyle.locals.arrow}/>
          </div>
          <div className={this.classes.colRight}>
            <Select {...selects.tables} selected={this.state.mapping.users}
                    onChange={this.handleChange.bind(this, 'users')}
                    disabled={this.state.mapping.users === undefined} style={{width: '166px'}}
                    placeholder="Group By"/>
          </div>
        </div>
      </div>
      <div className={this.classes.row}>
        <Label checkbox={!!this.state.mapping.owners} onChange={this.toggleCheckboxMulti.bind(this, 'owners')}>Filter
          by hubspot owners / regions (optional)</Label>
        <MultiSelect {...selects.owners} selected={this.state.mapping.owners}
                     onChange={this.handleChangeMulti.bind(this, 'owners')} disabled={!this.state.mapping.owners}
                     style={{width: 'initial'}} placeholder="Select your region owners"/>
      </div>
    </AuthorizationIntegrationPopup>;
  }
}