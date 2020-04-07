import React from 'react';
import Component from 'components/Component';
import Page from 'components/Page';
import Select from 'components/controls/Select';
import Textfield from 'components/controls/Textfield';
import Label from 'components/ControlsLabel';
import ButtonsSet from 'components/pages/profile/ButtonsSet';
import Title from 'components/onboarding/Title';
import ProfileProgress from 'components/pages/profile/Progress';
import BackButton from 'components/pages/profile/BackButton';
import NextButton from 'components/pages/profile/NextButton';
import SaveButton from 'components/pages/profile/SaveButton';
import AudienceTabs from 'components/onboarding/AudienceTabs';
import style from 'styles/onboarding/onboarding.css';
import targeStyle from 'styles/target-audience/target-audience.css';
import {isPopupMode} from 'modules/popup-mode';
import history from 'history';
import preferencesStyle from 'styles/preferences/preferences.css';

const DEFAULT_AUDIENCE_FIELDS = {
  teamSize: null,
  salary: null,
  education: null,
  dailyOnlinePresence: null,
  age: null,
  gender: null
};

export default class TargetAudience extends Component {
  style = style;
  styles = [targeStyle, preferencesStyle];

  static defaultProps = {
    targetAudience: [{
      fields: {...DEFAULT_AUDIENCE_FIELDS},
      info: {
        weight: 100
      }
    }]
  };

  constructor(props) {
    super(props);
    this.state = {
      showAdvancedFields: null
    };
    this.handleChangeSelect = this.handleChangeSelect.bind(this);
    this.handleChangeButton = this.handleChangeButton.bind(this);
  }

  validate() {
    const mandatoryFields = ['companyType',
      'annualRevenue',
      'employees',
      'role',
      'managementLevel',
      'location'];
    return this.props.targetAudience.reduce((isValue, target, index) => {
      const errorFields = mandatoryFields.filter(field => !target.fields[field]);
      // has errors
      if (errorFields && errorFields.length > 0) {
        // change order so user will be focused on first error
        errorFields.reverse().forEach(field =>
          this.refs.tabs.refs[field + index].validationError()
        );
        return false;
      }
      return isValue &&
        target.fields &&
        //target.info.name &&
        target.info.weight;
    }, true);
  }

  handleChangeSelect(parameter, index, event) {
    let update = this.props.targetAudience.slice();
    update[index].fields[parameter] = event.value;
    this.props.updateState({targetAudience: update});
  }

  handleChangeButton(parameter, index, event) {
    let update = this.props.targetAudience.slice();
    update[index].fields[parameter] = event;
    this.props.updateState({targetAudience: update});
  }

  addTab() {
    let update = this.props.targetAudience.slice();
    update.push({fields: {...DEFAULT_AUDIENCE_FIELDS}, info: {weight: 100}});
    this.props.updateState({targetAudience: update});
  }

  removeTab = (index) => {
    const update = [...this.props.targetAudience];
    update.splice(index, 1);
    this.props.updateState({targetAudience: update});
  };

  changeWeight(index, event) {
    let update = this.props.targetAudience.slice();
    const value = parseInt(event.target.value);
    update[index].info.weight = value || 0;
    this.props.updateState({targetAudience: update});
  }

  changeName(index, event) {
    this.refs.tabs.setTabName(index, event.target.value);
    let update = this.props.targetAudience.slice();
    update[index].info.name = event.target.value;
    this.props.updateState({targetAudience: update});
  }

  hasTargetInIndex(index) {
    return this.props.targetAudience[index] && this.props.targetAudience[index].fields;
  }

  selectFieldNotEmpty = (field) => {
    return field && field !== 'Any';
  };

  tabSelected = (index) => {
    const tabData = this.props.targetAudience[index];
    this.setState({
      showAdvancedFields: tabData &&
      (
        this.selectFieldNotEmpty(tabData.fields.teamSize) ||
        this.selectFieldNotEmpty(tabData.fields.salary) ||
        this.selectFieldNotEmpty(tabData.fields.education) ||
        this.selectFieldNotEmpty(tabData.fields.dailyOnlinePresence) ||
        this.selectFieldNotEmpty(tabData.fields.age) ||
        this.selectFieldNotEmpty(tabData.fields.gender)
      )
    });
  };

  render() {
    const selects = {
      reportsTo: {
        label: 'Reports To',
        select: {
          name: 'reportsTo',
          onChange: () => {
          },
          options: [
            {value: 'Coming Soon', label: 'Coming Soon'}
          ]
        }
      },
      teamSize: {
        label: 'Team Size',
        select: {
          name: 'teamSize',
          onChange: () => {
          },
          options: [
            {value: '1', label: '1'},
            {value: '2-5', label: '2-5'},
            {value: '6-15', label: '6-15'},
            {value: '16-50', label: '16-50'},
            {value: '51-100', label: '51-100'},
            {value: '>100', label: 'More than 100'},
            {value: 'Any', label: 'Any'}
          ]
        }
      },
      annualRevenue: {
        label: 'Company\'s Annual Revenue',
        select: {
          name: 'annualRevenue',
          onChange: () => {
          },
          options: [
            {value: '<$500K', label: 'Less than $500K'},
            {value: '$500K-$1M', label: '$500K-$1M'},
            {value: '$1M-$5M', label: '$1M-$5M'},
            {value: '$5M-$10M', label: '$5M-$10M'},
            {value: '$10M-$50M', label: '$10M-$50M'},
            {value: '$50M-$100M', label: '$50M-$100M'},
            {value: '>$100M', label: 'More than $100M'}
          ]
        }
      },
      employees: {
        label: 'Number Of Employees',
        select: {
          name: 'employees',
          onChange: () => {
          },
          options: [
            {value: '1-10', label: '1-10'},
            {value: '11-100', label: '11-100'},
            {value: '101-1000', label: '101-1,000'},
            {value: '1001-10000', label: '1,001-10,000'},
            {value: '>10000', label: 'More than 10,000'}
          ]
        }
      },
      age: {
        label: 'Age',
        select: {
          name: 'age',
          onChange: () => {
          },
          options: [
            {value: '20-25', label: '20-25'},
            {value: '26-30', label: '26-30'},
            {value: '31-35', label: '31-35'},
            {value: '36-40', label: '36-40'},
            {value: '41-45', label: '41-45'},
            {value: '46-50', label: '46-50'},
            {value: '>50', label: 'More than 50'}

          ]
        }
      },
      salary: {
        label: 'Salary',
        select: {
          name: 'salary',
          onChange: () => {
          },
          options: [
            {value: '<$49,999', label: 'Less than $49,999'},
            {value: '$50,000 to $74,999', label: '$50,000 to $74,999'},
            {value: '$75,000 to $99,999', label: '$75,000 to $99,999'},
            {value: '$100,000 to $149,999', label: '$100,000 to $149,999'},
            {value: '$150,000 to $199,999', label: '$150,000 to $199,999'},
            {value: '$200,000 to $499,999', label: '$200,000 to $499,999'},
            {value: '>$500,000', label: '$500,000 or more'},
            {value: 'Any', label: 'Any'}
          ]
        }
      },
      education: {
        label: 'Education',
        select: {
          name: 'education',
          onChange: () => {
          },
          options: [
            {value: 'Less than high school degree', label: 'Less than high school degree'},
            {value: 'High school degree or equivalent', label: 'High school degree or equivalent'},
            {value: 'Some college but no degree', label: 'Some college but no degree'},
            {value: 'Associate degree', label: 'Associate degree'},
            {value: 'Bachelor degree', label: 'Bachelor degree'},
            {value: 'Graduate degree', label: 'Graduate degree'},
            {value: 'Any', label: 'Any'}
          ]
        }
      },
      location: {
        label: 'Location',
        select: {
          name: 'location',
          onChange: () => {
          },
          options: [
            {value: 'USA', label: 'USA'},
            {value: 'Canada', label: 'Canada'},
            {value: 'Western Europe', label: 'Western Europe'},
            {value: 'Eastern Europe', label: 'Eastern Europe'},
            {value: 'Australia', label: 'Australia'},
            {value: 'Any', label: 'Any'}
          ]
        }
      },
      dailyOnlinePresence: {
        label: 'Daily Online Presence',
        labelQuestion: [''],
        description: ['How much of his/her day, your target persona is online?'],
        select: {
          name: 'dailyOnlinePresence',
          onChange: () => {
          },
          options: [
            {value: '<10%', label: 'Less than 10%'},
            {value: '10%-30%', label: '10%-30%'},
            {value: '31%-50%', label: '31%-50%'},
            {value: '51%-75%', label: '51%-75%'},
            {value: '>75%', label: 'More than 75%'},
            {value: 'Any', label: 'Any'}
          ]
        }
      }
    };
    const defaultTabs = this.props.targetAudience.map(target => target.info.name || null);
    return <div>
      <Page popup={isPopupMode()}
            className={!isPopupMode() ? this.classes.static : null}
            contentClassName={this.classes.content}
            innerClassName={this.classes.pageInner}
            width='100%'>
        <Title title="Target Audience"
               subTitle='Who is your target audience? Who is your buyer persona? The best marketing strategies are always based on the people you want to reach'/>
        <div className={this.classes.error}>
          <label hidden={!this.state.serverDown}>Something is wrong... Let us check what is it and fix it for you
            :)</label>
        </div>
        <div className={this.classes.cols}>
          <div className={this.classes.colLeft}>
            <AudienceTabs
              ref="tabs"
              defaultSelected={0}
              getTabName={(index) => `Persona ${index + 1}`}
              defaultTabs={defaultTabs.length > 0 ? defaultTabs : [null]}
              addTab={this.addTab.bind(this)}
              removeTab={this.removeTab}
              tabSelected={this.tabSelected}
            >
              {({name, index}) => {
                return <div>
                  <div className={this.classes.row}>
                    <div className={targeStyle.locals.personaCell}>
                      <Label style={{
                        marginRight: '10px',
                        marginTop: '12px'
                      }}>Name</Label>
                      <Textfield value={name} onChange={this.changeName.bind(this, index)}/>
                      <div style={{margin: '0 20px'}}/>
                      <Label style={{
                        marginRight: '10px',
                        marginTop: '12px'
                      }}>Weight (%)</Label>
                      <Textfield
                        value={this.props.targetAudience[index] && this.props.targetAudience[index].info.weight}
                        style={{
                          width: '70px'
                        }} onChange={this.changeWeight.bind(this, index)}/>
                    </div>
                  </div>
                  <div className={this.classes.row}>
                    <Label>Company Type</Label>
                    <ButtonsSet buttons={[
                      {key: 'B2B Software', text: 'B2B Software', icon: 'buttons:b2bSoftware'},
                      {key: 'B2C Software', text: 'B2C Software', icon: 'buttons:b2cSoftware'},
                      {key: 'Consumer Services & Retail', text: 'Retailer', icon: 'buttons:retailer'},
                      {key: 'CPG', text: 'CPG', icon: 'buttons:cpg'},
                      {key: 'E-commerce', text: 'E-commerce', icon: 'buttons:ecommerce'},
                      {key: 'Food & Beverage', text: 'Food', icon: 'buttons:foodAndBeverage'},
                      {key: 'Entertainment', text: 'Entertainment', icon: 'buttons:entertainment'},
                      {key: 'Professional Services', text: 'Pro Services', icon: 'buttons:professional'},
                      {key: 'Finance', text: 'Finance', icon: 'buttons:finance'},
                      {key: 'Healthcare', text: 'Healthcare', icon: 'buttons:healthcare'},
                      {key: 'Any', text: 'Any', icon: 'buttons:companyServiceAll'}
                    ]} selectedKey={this.hasTargetInIndex(index) && this.props.targetAudience[index].fields.companyType}
                                onChange={this.handleChangeButton.bind(this, 'companyType', index)}
                                ref={'companyType' + index}/>
                  </div>
                  <div className={this.classes.row} style={{
                    width: '258px'
                  }}>
                    <Select {...selects.annualRevenue}
                            selected={this.hasTargetInIndex(index) &&
                            this.props.targetAudience[index].fields.annualRevenue}
                            onChange={this.handleChangeSelect.bind(this, 'annualRevenue', index)}
                            ref={'annualRevenue' + index}/>
                  </div>
                  <div className={this.classes.row} style={{
                    width: '258px'
                  }}>
                    <Select {...selects.employees}
                            selected={this.hasTargetInIndex(index) && this.props.targetAudience[index].fields.employees}
                            onChange={this.handleChangeSelect.bind(this, 'employees', index)}
                            ref={'employees' + index}/>
                  </div>
                  <div className={this.classes.row}>
                    <Label>Role</Label>
                    <ButtonsSet buttons={[
                      {key: 'General', text: 'General', icon: 'buttons:general'},
                      {key: 'Sales', text: 'Sales', icon: 'buttons:sales-role'},
                      {key: 'Marketing', text: 'Marketing', icon: 'buttons:marketing'},
                      {key: 'R&D', text: 'R&D', icon: 'buttons:rd'},
                      {key: 'IT', text: 'IT', icon: 'buttons:it-role'},
                      {key: 'Security', text: 'Security', icon: 'buttons:security-role'},
                      {key: 'Finance', text: 'Finance', icon: 'buttons:finance-role'},
                      {key: 'HR', text: 'HR', icon: 'buttons:hr'},
                      {key: 'Design', text: 'Design', icon: 'buttons:design'},
                      {key: 'BizDev', text: 'BizDev', icon: 'buttons:bizdev'},
                      {key: 'Product', text: 'Product', icon: 'buttons:product'},
                      {key: 'Other', text: 'Other', icon: 'buttons:other'}
                    ]} selectedKey={this.hasTargetInIndex(index) && this.props.targetAudience[index].fields.role}
                                onChange={this.handleChangeButton.bind(this, 'role', index)} ref={'role' + index}/>
                  </div>
                  <div className={this.classes.row}>
                    <Label>Management Level</Label>
                    <ButtonsSet buttons={[
                      {key: 'C-Level', text: 'CXO', icon: 'buttons:cxo'},
                      {key: 'VP', text: 'VP', icon: 'buttons:vp'},
                      {key: 'Director', text: 'Director', icon: 'buttons:director'},
                      {key: 'Management', text: 'Manager', icon: 'buttons:manager'},
                      {key: 'Employee', text: 'Other', icon: 'buttons:employee'}
                    ]}
                                selectedKey={this.hasTargetInIndex(index) &&
                                this.props.targetAudience[index].fields.managementLevel}
                                onChange={this.handleChangeButton.bind(this, 'managementLevel', index)}
                                ref={'managementLevel' + index}/>
                  </div>
                  {/**  <div className={ this.classes.row }>
                   <Label question>{ selects.loyalty.label }</Label>
                   <div className={ this.classes.cell }>
                   <Select { ... selects.loyalty } label={ null } style={{
                        width: '258px'
                      }} />
                   <NotSure style={{
                        marginLeft: '10px'
                      }} />
                   </div>
                   </div>**/}
                  <div className={this.classes.row} style={{
                    width: '258px'
                  }}>
                    <Select {...selects.location}
                            selected={this.hasTargetInIndex(index) && this.props.targetAudience[index].fields.location}
                            onChange={this.handleChangeSelect.bind(this, 'location', index)} ref={'location' + index}/>
                  </div>
                  <div className={preferencesStyle.locals.advancedButton} onClick={() => {
                    this.setState({showAdvancedFields: !this.state.showAdvancedFields});
                  }}>
                    Advanced
                  </div>
                  <div hidden={!this.state.showAdvancedFields}>
                    <div className={this.classes.row}>
                      <Label>Gender</Label>
                      <ButtonsSet buttons={[
                        {key: 'Male', text: 'Male', icon: 'buttons:male'},
                        {key: 'Female', text: 'Female', icon: 'buttons:female'},
                        {key: 'Any', text: 'Both', icon: 'buttons:both'}
                      ]} selectedKey={this.hasTargetInIndex(index) && this.props.targetAudience[index].fields.gender}
                                  onChange={this.handleChangeButton.bind(this, 'gender', index)} ref={'gender' + index}/>
                    </div>
                    <div className={this.classes.row} style={{
                      width: '258px'
                    }}>
                      <Select {...selects.age}
                              selected={this.hasTargetInIndex(index) && this.props.targetAudience[index].fields.age}
                              onChange={this.handleChangeSelect.bind(this, 'age', index)} ref={'age' + index}/>
                    </div>
                    <div className={this.classes.row} style={{
                      width: '258px'
                    }}>
                      <Select {...selects.reportsTo} selected="Coming Soon" onChange={() => {
                      }}/>
                    </div>
                    <div className={this.classes.row} style={{
                      width: '258px'
                    }}>
                      <Select {...selects.teamSize}
                              selected={this.hasTargetInIndex(index) &&
                              this.props.targetAudience[index].fields.teamSize}
                              onChange={this.handleChangeSelect.bind(this, 'teamSize', index)}
                              ref={'teamSize' + index}/>
                    </div>
                    <div className={this.classes.row} style={{
                      width: '258px'
                    }}>
                      <Select {...selects.salary}
                              selected={this.hasTargetInIndex(index) && this.props.targetAudience[index].fields.salary}
                              onChange={this.handleChangeSelect.bind(this, 'salary', index)} ref={'salary' + index}/>
                    </div>
                    <div className={this.classes.row} style={{
                      width: '258px'
                    }}>
                      <Select {...selects.education}
                              selected={this.hasTargetInIndex(index) &&
                              this.props.targetAudience[index].fields.education}
                              onChange={this.handleChangeSelect.bind(this, 'education', index)}
                              ref={'education' + index}/>
                    </div>
                    <div className={this.classes.row} style={{
                      marginBottom: '200px',
                      width: '258px'
                    }}>
                      <Select {...selects.dailyOnlinePresence}
                              selected={this.hasTargetInIndex(index) &&
                              this.props.targetAudience[index].fields.dailyOnlinePresence}
                              onChange={this.handleChangeSelect.bind(this, 'dailyOnlinePresence', index)}
                              ref={'dailyOnlinePresence' + index}/>
                    </div>
                  </div>
                </div>;
              }}
            </AudienceTabs>
          </div>

          {isPopupMode() ?

            <div className={this.classes.colRight}>
              <div className={this.classes.row}>
                <ProfileProgress progress={51} image={
                  require('assets/flower/3.png')
                }
                                 text="You are starting to GROW"/>
              </div>
              {/*
               <div className={ this.classes.row }>
               <ProfileInsights />
               </div>
               */}
            </div>

            : null}
        </div>

        <div className={this.classes.footer}>
          <div className={this.classes.almostFooter}>
            <label hidden={!this.state.validationError} style={{color: 'red'}}>Please fill all the required
              fields</label>
          </div>
          {isPopupMode() ?
            <div style={{display: 'flex'}}>
              <BackButton onClick={() => {
                this.props.updateUserMonthPlan({
                  targetAudience: this.props.targetAudience,
                  planNeedsUpdate: true
                }, this.props.region, this.props.planDate)
                  .then(() => {
                    history.push('/settings/profile/product');
                  });
              }}/>
              < div style={{width: '30px'}}/>
              <NextButton onClick={() => {
                if (this.validate()) {
                  this.props.updateUserMonthPlan({
                    targetAudience: this.props.targetAudience,
                    planNeedsUpdate: true
                  }, this.props.region, this.props.planDate)
                    .then(() => {
                      history.push('/profile/technology-stack');
                    });
                }
                else {
                  this.setState({validationError: true});
                }
              }}/>
            </div>
            :
            <SaveButton onClick={() => {
              if (this.validate()) {
                this.setState({saveFail: false, saveSuccess: false});
                this.props.updateUserMonthPlan({
                  targetAudience: this.props.targetAudience,
                  planNeedsUpdate: true
                }, this.props.region, this.props.planDate);
                this.setState({saveSuccess: true});
              }
              else {
                this.setState({validationError: true});
              }
            }} success={this.state.saveSuccess} fail={this.state.saveFail}/>
          }
        </div>
      </Page>
    </div>;
  }
}