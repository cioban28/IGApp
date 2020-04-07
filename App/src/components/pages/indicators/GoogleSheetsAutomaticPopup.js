import React from 'react';
import Component from 'components/Component';
import Select from 'components/controls/Select';
import style from 'styles/onboarding/onboarding.css';
import serverCommunication from 'data/serverCommunication';
import Label from 'components/ControlsLabel';
import Textfield from 'components/controls/Textfield';
import Title from 'components/onboarding/Title';
import loadTemplateStyle from 'styles/campaigns/load-template-popup.css';
import CRMStyle from 'styles/indicators/crm-popup.css';
import AuthorizationIntegrationPopup from 'components/common/AuthorizationIntegrationPopup';

export default class GoogleSheetsAutomaticPopup extends Component {

  style = style;
  styles = [loadTemplateStyle, CRMStyle];

  constructor(props) {
    super(props);
    this.state = {
      sheets: [],
      mapping: {}
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.data && nextProps.data.mapping) {
      this.setState({mapping: nextProps.data.mapping});
    }
  }

  handleChangeSelect(indicator, event) {
    let mapping = this.state.mapping;
    mapping[indicator].sheet = event.value;
    this.setState({mapping: mapping});
  }

  handleChangeText(indicator, event) {
    let mapping = this.state.mapping;
    mapping[indicator].cell = event.target.value;
    this.setState({mapping: mapping});
  }

  open() {
    this.refs.authPopup.open();
  }

  afterDataRetrieved = (data) => {
    return new Promise((resolve, reject) => {
      this.setState({sheets: data});
      resolve(true);
    });
  };

  getUserData = () => {
    return new Promise((resolve, reject) => {
      serverCommunication.serverRequest('put',
        'googlesheetsapi',
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
            reject(new Error('Failed getting google sheets data'));
          }
        });
    });
  };

  toggleCheckbox(indicator) {
    let mapping = this.state.mapping;
    if (mapping[indicator] !== undefined) {
      delete mapping[indicator];
    }
    else {
      mapping[indicator] = {cell: '', sheet: ''};
    }
    this.setState({mapping: mapping});
  }

  render() {
    const selects = {
      sheets: {
        select: {
          name: 'sheet',
          options: this.state.sheets
            .map(account => {
              return {value: account.id, label: account.name};
            })
        }
      }
    };
    return <AuthorizationIntegrationPopup ref='authPopup'
                                          api='googlesheetsapi'
                                          afterDataRetrieved={this.afterDataRetrieved}
                                          makeServerRequest={this.getUserData}
                                          width='600px'
                                          contentClassName={loadTemplateStyle.locals.content}
                                          loadingStarted={this.props.loadingStarted}
                                          loadingFinished={this.props.loadingFinished}
                                          innerClassName={loadTemplateStyle.locals.inner}
                                          affectedIndicators={this.props.affectedIndicators}
                                          actualIndicators={this.props.actualIndicators}
                                          platformTitle='Google Sheets'
    >

      <Title title="Google Sheets" subTitle="Define which metrics should be taken from Google Sheets"/>
      <div className={this.classes.row}>
        <div className={this.classes.cols}>
          <div className={this.classes.colLeft}>
            <Label checkbox={this.state.mapping.MRR !== undefined} onChange={this.toggleCheckbox.bind(this, 'MRR')}
                   style={{margin: '6px 0', width: '110px'}}>MRR</Label>
          </div>
          <div className={this.classes.colCenter}>
            <Select {...selects.sheets} selected={this.state.mapping.MRR ? this.state.mapping.MRR.sheet : ''}
                    disabled={this.state.mapping.MRR === undefined} style={{width: '210px'}}
                    onChange={this.handleChangeSelect.bind(this, 'MRR')} placeholder="Select spreadsheet"/>
          </div>
          <div className={this.classes.colRight} style={{width: 'initial', display: 'block'}}>
            <Textfield disabled={this.state.mapping.MRR === undefined} style={{width: '130px'}}
                       value={this.state.mapping.MRR ? this.state.mapping.MRR.cell : ''}
                       onChange={this.handleChangeText.bind(this, 'MRR')} placeHolder="sheet1!A1"/>
          </div>
        </div>
      </div>
      <div className={this.classes.row}>
        <div className={this.classes.cols}>
          <div className={this.classes.colLeft}>
            <Label checkbox={this.state.mapping.churnRate !== undefined}
                   onChange={this.toggleCheckbox.bind(this, 'churnRate')} style={{margin: '6px 0', width: '110px'}}>Churn
              Rate</Label>
          </div>
          <div className={this.classes.colCenter}>
            <Select {...selects.sheets}
                    selected={this.state.mapping.churnRate ? this.state.mapping.churnRate.sheet : ''}
                    disabled={this.state.mapping.churnRate === undefined} style={{width: '210px'}}
                    onChange={this.handleChangeSelect.bind(this, 'churnRate')} placeholder="Select spreadsheet"/>
          </div>
          <div className={this.classes.colRight} style={{width: 'initial', display: 'block'}}>
            <Textfield disabled={this.state.mapping.churnRate === undefined} style={{width: '130px'}}
                       value={this.state.mapping.churnRate ? this.state.mapping.churnRate.cell : ''}
                       onChange={this.handleChangeText.bind(this, 'churnRate')} placeHolder="sheet1!A1"/>
          </div>
        </div>
      </div>
      <div className={this.classes.row}>
        <div className={this.classes.cols}>
          <div className={this.classes.colLeft}>
            <Label checkbox={this.state.mapping.LTV !== undefined} onChange={this.toggleCheckbox.bind(this, 'LTV')}
                   style={{margin: '6px 0', width: '110px'}}>LTV</Label>
          </div>
          <div className={this.classes.colCenter}>
            <Select {...selects.sheets} selected={this.state.mapping.LTV ? this.state.mapping.LTV.sheet : ''}
                    disabled={this.state.mapping.LTV === undefined} style={{width: '210px'}}
                    onChange={this.handleChangeSelect.bind(this, 'LTV')} placeholder="Select spreadsheet"/>
          </div>
          <div className={this.classes.colRight} style={{width: 'initial', display: 'block'}}>
            <Textfield disabled={this.state.mapping.LTV === undefined} style={{width: '130px'}}
                       value={this.state.mapping.LTV ? this.state.mapping.LTV.cell : ''}
                       onChange={this.handleChangeText.bind(this, 'LTV')} placeHolder="sheet1!A1"/>
          </div>
        </div>
      </div>
      <div className={this.classes.row}>
        <div className={this.classes.cols}>
          <div className={this.classes.colLeft}>
            <Label checkbox={this.state.mapping.CAC !== undefined} onChange={this.toggleCheckbox.bind(this, 'CAC')}
                   style={{margin: '6px 0', width: '110px'}}>CAC</Label>
          </div>
          <div className={this.classes.colCenter}>
            <Select {...selects.sheets} selected={this.state.mapping.CAC ? this.state.mapping.CAC.sheet : ''}
                    disabled={this.state.mapping.CAC === undefined} style={{width: '210px'}}
                    onChange={this.handleChangeSelect.bind(this, 'CAC')} placeholder="Select spreadsheet"/>
          </div>
          <div className={this.classes.colRight} style={{width: 'initial', display: 'block'}}>
            <Textfield disabled={this.state.mapping.CAC === undefined} style={{width: '130px'}}
                       value={this.state.mapping.CAC ? this.state.mapping.CAC.cell : ''}
                       onChange={this.handleChangeText.bind(this, 'CAC')} placeHolder="sheet1!A1"/>
          </div>
        </div>
      </div>
    </AuthorizationIntegrationPopup>;
  }
}