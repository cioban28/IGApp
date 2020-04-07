import React from 'react';
import Component from 'components/Component';
import MultiSelect from 'components/controls/MultiSelect';
import Select from 'components/controls/Select';
import style from 'styles/onboarding/onboarding.css';
import serverCommunication from 'data/serverCommunication';
import Label from 'components/ControlsLabel';
import salesForceStyle from 'styles/indicators/salesforce-automatic-popup.css';
import Title from 'components/onboarding/Title';
import CRMStyle from 'styles/indicators/crm-popup.css';
import Textfield from 'components/controls/Textfield';
import {formatNumber} from 'components/utils/budget';
import AuthorizationIntegrationPopup from 'components/common/AuthorizationIntegrationPopup';
import {getTitle} from 'components/utils/indicators';

export default class SalesforceAutomaticPopup extends Component {

  style = style;
  styles = [salesForceStyle, CRMStyle];

  constructor(props) {
    super(props);
    this.state = {
      statuses: [],
      stages: [],
      owners: [],
      fields: [],
      mapping: {
        MCL: [],
        MQL: [],
        SQL: [],
        opps: [
          'Prospecting',
          'Qualification',
          'Needs Analysis',
          'Id. Decision Makers',
          'Value Proposition',
          'Perception Analysis',
          'Proposal/Price Quote',
          'Negotiation/Review'
        ],
        users: [
          'Closed Won'
        ],
        CAC: [],
        MRR: {
          defaultMonths: 12
        }
      }
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
      this.setState({
        statuses: data.statuses,
        stages: data.stages,
        owners: data.owners,
        fields: data.fields
      });
      resolve(true);
    });
  };

  getUserData = () => {
    let valid = true;
    if (this.state.mapping.CAC) {
      if (!this.state.mapping.CAC[0]) {
        valid = false;
        this.refs.month1.focus();
      }
      if (!this.state.mapping.CAC[1]) {
        valid = false;
        this.refs.month2.focus();
      }
      if (!this.state.mapping.CAC[2]) {
        valid = false;
        this.refs.month3.focus();
      }
    }

    return new Promise((resolve, reject) => {
      if (valid) {
        serverCommunication.serverRequest('put',
          'salesforceapi',
          JSON.stringify(this.state.mapping),
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
              reject(new Error('Error retrieving salesforce data'));
            }
          });
      }
      else {
        reject(new Error('Values are not valid'));
      }
    });
  };

  toggleCheckbox(indicator) {
    let mapping = this.state.mapping;
    if (mapping[indicator]) {
      delete mapping[indicator];
    }
    else {
      mapping[indicator] = [];
    }
    this.setState({mapping: mapping});
  }

  toggleCheckboxObject(indicator) {
    let mapping = this.state.mapping;
    if (mapping[indicator]) {
      delete mapping[indicator];
    }
    else {
      mapping[indicator] = {};
    }
    this.setState({mapping: mapping});
  }

  handleChange(indicator, event) {
    let mapping = this.state.mapping;
    mapping[indicator] = event.map((obj) => {
      return obj.value;
    });
    this.setState({mapping: mapping});
  }

  handleChangeCAC(index, event) {
    let mapping = this.state.mapping;
    mapping.CAC[index] = parseInt(event.target.value.replace(/[-$,]/g, ''));
    this.setState({mapping: mapping});
  }

  handleChangeField(event) {
    let mapping = this.state.mapping;
    const fieldName = event.value;
    mapping.MRR.field = fieldName;
    const fieldWithProps = this.state.fields.find(field => field.name === fieldName);
    mapping.MRR.type = fieldWithProps.type === 'date' ? 'date' : 'number';
    this.setState({mapping: mapping});
  }

  handleChangeDefault(event) {
    let mapping = this.state.mapping;
    mapping.MRR.defaultMonths = parseInt(event.target.value) || '';
    this.setState({mapping: mapping});
  }

  render() {
    const selects = {
      statuses: {
        select: {
          name: 'statuses',
          options: this.state.statuses
            .map(status => {
              return {value: status.Status, label: status.Status};
            })
        }
      },
      stages: {
        select: {
          name: 'stages',
          options: this.state.stages
            .map(stage => {
              return {value: stage.StageName, label: stage.StageName};
            })
        }
      },
      owners: {
        select: {
          name: 'owners',
          options: this.state.owners
            .map(owner => {
              return {value: owner.Id, label: owner.Name};
            })
        }
      },
      fields: {
        select: {
          name: 'fields',
          options: this.state.fields
            .map(field => {
              return {value: field.name, label: field.label};
            })
        }
      },
      types: {
        select: {
          name: 'types',
          options: [
            {value: 'number', label: 'number'},
            {value: 'date', label: 'date'}
          ]
        }
      }
    };
    return <AuthorizationIntegrationPopup width='680px'
                                          innerClassName={salesForceStyle.locals.inner}
                                          contentClassName={salesForceStyle.locals.content}
                                          afterDataRetrieved={this.afterDataRetrieved}
                                          api='salesforceapi'
                                          makeServerRequest={this.getUserData}
                                          ref='authPopup'
                                          loadingStarted={this.props.loadingStarted}
                                          loadingFinished={this.props.loadingFinished}
                                          affectedIndicators={this.props.affectedIndicators}
                                          actualIndicators={this.props.actualIndicators}
                                          platformTitle='Salesforce'
    >
      <Title title="SalesForce"
             subTitle="Define your pipeline stages"/>
      <div className={this.classes.row}>
        <div className={this.classes.cols}>
          <div className={this.classes.colLeft} style={{flexGrow: 'initial'}}>
            <Label checkbox={!!this.state.mapping.MCL} onChange={this.toggleCheckbox.bind(this, 'MCL')}
                   className={salesForceStyle.locals.label}>{getTitle('MCL')}</Label>
          </div>
          <div className={this.classes.colCenter} style={{flexGrow: 'initial', margin: 'initial'}}>
            <div className={salesForceStyle.locals.arrow}/>
          </div>
          <div className={this.classes.colRight}>
            <MultiSelect {...selects.statuses} selected={this.state.mapping.MCL}
                         onChange={this.handleChange.bind(this, 'MCL')} disabled={!this.state.mapping.MCL}
                         style={{width: '270px'}} placeholder="Select Lead Status"/>
          </div>
        </div>
      </div>
      <div className={this.classes.row}>
        <div className={this.classes.cols}>
          <div className={this.classes.colLeft} style={{flexGrow: 'initial'}}>
            <Label checkbox={!!this.state.mapping.MQL} onChange={this.toggleCheckbox.bind(this, 'MQL')}
                   className={salesForceStyle.locals.label}>{getTitle('MQL')}</Label>
          </div>
          <div className={this.classes.colCenter} style={{flexGrow: 'initial', margin: 'initial'}}>
            <div className={salesForceStyle.locals.arrow}/>
          </div>
          <div className={this.classes.colRight}>
            <MultiSelect {...selects.statuses} selected={this.state.mapping.MQL}
                         onChange={this.handleChange.bind(this, 'MQL')} disabled={!this.state.mapping.MQL}
                         style={{width: '270px'}} placeholder="Select Lead Status"/>
          </div>
        </div>
      </div>
      <div className={this.classes.row}>
        <div className={this.classes.cols}>
          <div className={this.classes.colLeft} style={{flexGrow: 'initial'}}>
            <Label checkbox={!!this.state.mapping.SQL} onChange={this.toggleCheckbox.bind(this, 'SQL')}
                   className={salesForceStyle.locals.label}>{getTitle('SQL')}</Label>
          </div>
          <div className={this.classes.colCenter} style={{flexGrow: 'initial', margin: 'initial'}}>
            <div className={salesForceStyle.locals.arrow}/>
          </div>
          <div className={this.classes.colRight}>
            <MultiSelect {...selects.statuses} selected={this.state.mapping.SQL}
                         onChange={this.handleChange.bind(this, 'SQL')} disabled={!this.state.mapping.SQL}
                         style={{width: '270px'}} placeholder="Select Lead Status"/>
          </div>
        </div>
      </div>
      <div className={this.classes.row}>
        <div className={this.classes.cols}>
          <div className={this.classes.colLeft} style={{flexGrow: 'initial'}}>
            <Label checkbox={!!this.state.mapping.opps} onChange={this.toggleCheckbox.bind(this, 'opps')}
                   className={salesForceStyle.locals.label}>{getTitle('opps')}</Label>
          </div>
          <div className={this.classes.colCenter} style={{flexGrow: 'initial', margin: 'initial'}}>
            <div className={salesForceStyle.locals.arrow}/>
          </div>
          <div className={this.classes.colRight}>
            <MultiSelect {...selects.stages} selected={this.state.mapping.opps}
                         onChange={this.handleChange.bind(this, 'opps')} disabled={!this.state.mapping.opps}
                         style={{width: '270px'}} placeholder="Select Opportunity Stage"/>
          </div>
        </div>
      </div>
      <div className={this.classes.row}>
        <div className={this.classes.cols}>
          <div className={this.classes.colLeft} style={{flexGrow: 'initial'}}>
            <Label checkbox={!!this.state.mapping.users} onChange={this.toggleCheckbox.bind(this, 'users')}
                   className={salesForceStyle.locals.label}>{getTitle('users')}</Label>
          </div>
          <div className={this.classes.colCenter} style={{flexGrow: 'initial', margin: 'initial'}}>
            <div className={salesForceStyle.locals.arrow}/>
          </div>
          <div className={this.classes.colRight}>
            <MultiSelect {...selects.stages} selected={this.state.mapping.users}
                         onChange={this.handleChange.bind(this, 'users')} disabled={!this.state.mapping.users}
                         style={{width: '270px'}} placeholder="Select Opportunity Stage"/>
          </div>
        </div>
      </div>
      <div className={this.classes.row}>
        <Label checkbox={!!this.state.mapping.owners} onChange={this.toggleCheckbox.bind(this, 'owners')}
               className={salesForceStyle.locals.ownersLabel}>Filter by salesforce owners / regions (optional)</Label>
        <MultiSelect {...selects.owners} selected={this.state.mapping.owners}
                     onChange={this.handleChange.bind(this, 'owners')} disabled={!this.state.mapping.owners}
                     style={{width: 'initial'}} placeholder="Select your region owners"/>
      </div>
      <div className={this.classes.row}>
        <div className={this.classes.row}>
          <Label checkbox={this.state.mapping.MRR !== undefined} onChange={this.toggleCheckboxObject.bind(this, 'MRR')}
                 className={salesForceStyle.locals.label}>Calculate {getTitle('MRR')}</Label>
        </div>
        <div hidden={this.state.mapping.MRR === undefined}>
          <div className={this.classes.row}>
            <div className={this.classes.cols}>
              <div className={this.classes.colLeft} style={{flexGrow: 'initial'}}>
                <Label className={salesForceStyle.locals.label}>Default licensing period (months)</Label>
              </div>
              <div className={this.classes.colCenter} style={{flexGrow: 'initial', margin: 'initial'}}>
                <div className={salesForceStyle.locals.arrow}/>
              </div>
              <div className={this.classes.colRight}>
                <Textfield value={this.state.mapping.MRR && this.state.mapping.MRR.defaultMonths}
                           onChange={this.handleChangeDefault.bind(this)} style={{width: '270px'}}/>
              </div>
            </div>
          </div>
          <div className={this.classes.row}>
            <div className={this.classes.cols}>
              <div className={this.classes.colLeft} style={{flexGrow: 'initial'}}>
                <Label className={salesForceStyle.locals.label} question={['']}
                       description={['* If relevant, which custom field indicates how the amount of each deal should be divided. Choose a number (each deal amount will be divided by this number, which indicates # of months per deal) or a date (the amount will be divided to all months between close date and this date).']}>Divide
                  deal amounts by</Label>
              </div>
              <div className={this.classes.colCenter} style={{flexGrow: 'initial', margin: 'initial'}}>
                <div className={salesForceStyle.locals.arrow}/>
              </div>
              <div className={this.classes.colRight}>
                <Select {...selects.fields} selected={this.state.mapping.MRR && this.state.mapping.MRR.field}
                        onChange={this.handleChangeField.bind(this)} style={{width: '270px'}}
                        placeholder="choose if relevant"/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={this.classes.row} hidden={this.props.data && this.props.data.isCACAuto}>
        <Label checkbox={!!this.state.mapping.CAC} onChange={this.toggleCheckbox.bind(this, 'CAC')}
               className={salesForceStyle.locals.label}>Calculate {getTitle('CAC')}</Label>
        <div hidden={!this.state.mapping.CAC}>
          <div className={this.classes.row}>
            How much did you invest on all marketing activities over the last 3 months?
          </div>
          <div className={this.classes.row}>
            <div className={this.classes.cols}>
              <div className={this.classes.colLeft} style={{flexGrow: 'initial'}}>
                <Label className={salesForceStyle.locals.label}>3 months ago</Label>
              </div>
              <div className={this.classes.colCenter} style={{flexGrow: 'initial', margin: 'initial'}}>
                <div className={salesForceStyle.locals.arrow}/>
              </div>
              <div className={this.classes.colRight}>
                <Textfield value={'$' + (formatNumber(this.state.mapping.CAC && this.state.mapping.CAC[0]) || '')}
                           onChange={this.handleChangeCAC.bind(this, 0)} ref="month1"/>
              </div>
            </div>
          </div>
          <div className={this.classes.row}>
            <div className={this.classes.cols}>
              <div className={this.classes.colLeft} style={{flexGrow: 'initial'}}>
                <Label className={salesForceStyle.locals.label}>2 months ago</Label>
              </div>
              <div className={this.classes.colCenter} style={{flexGrow: 'initial', margin: 'initial'}}>
                <div className={salesForceStyle.locals.arrow}/>
              </div>
              <div className={this.classes.colRight}>
                <Textfield value={'$' + (formatNumber(this.state.mapping.CAC && this.state.mapping.CAC[1]) || '')}
                           onChange={this.handleChangeCAC.bind(this, 1)} ref="month2"/>
              </div>
            </div>
          </div>
          <div className={this.classes.row}>
            <div className={this.classes.cols}>
              <div className={this.classes.colLeft} style={{flexGrow: 'initial'}}>
                <Label className={salesForceStyle.locals.label}>last month</Label>
              </div>
              <div className={this.classes.colCenter} style={{flexGrow: 'initial', margin: 'initial'}}>
                <div className={salesForceStyle.locals.arrow}/>
              </div>
              <div className={this.classes.colRight}>
                <Textfield value={'$' + (formatNumber(this.state.mapping.CAC && this.state.mapping.CAC[2]) || '')}
                           onChange={this.handleChangeCAC.bind(this, 2)} ref="month3"/>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={this.classes.row}>
        <Label checkbox={this.state.mapping.ARPA !== undefined} onChange={this.toggleCheckboxObject.bind(this, 'ARPA')}
               className={salesForceStyle.locals.label}>Calculate {getTitle('ARPA')}</Label>
      </div>
      <div className={this.classes.row}>
        <Label checkbox={this.state.mapping.churnRate !== undefined}
               onChange={this.toggleCheckboxObject.bind(this, 'churnRate')} className={salesForceStyle.locals.label}>Calculate
          Churn Rate</Label>
      </div>
      <div className={this.classes.row}>
        <Label checkbox={this.state.mapping.LTV !== undefined} onChange={this.toggleCheckboxObject.bind(this, 'LTV')}
               className={salesForceStyle.locals.label}>Calculate {getTitle('LTV')}</Label>
      </div>
    </AuthorizationIntegrationPopup>;
  }
}