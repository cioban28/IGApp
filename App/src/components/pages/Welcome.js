import React from 'react';
import PayButton from 'components/PayButton';
import Component from 'components/Component';
import Page from 'components/Page';
import NextButton from 'components/pages/profile/NextButton';
import SaveButton from 'components/pages/profile/SaveButton';
import Select from 'components/controls/Select';
import Textfield from 'components/controls/Textfield';
import Button from 'components/controls/Button';
import Label from 'components/ControlsLabel';
import Title from 'components/onboarding/Title';
import style from 'styles/onboarding/onboarding.css';
import welcomeStyle from 'styles/welcome/welcome.css';
import PlannedVsActualstyle from 'styles/plan/planned-actual-tab.css';
import {isPopupMode} from 'modules/popup-mode';
import history from 'history';
import RegionPopup from 'components/RegionPopup';
import ReasonPopup from 'components/ReasonPopup';
import serverCommunication from 'data/serverCommunication';
import ButtonWithSurePopup from 'components/pages/account/ButtonWithSurePopup';
import AddMemberPopup from 'components/pages/account/AddMemberPopup';
import Tabs from 'components/onboarding/Tabs';
import Avatar from 'components/Avatar';
import {getProfileSync} from 'components/utils/AuthService';
import {userPermittedToPage} from 'utils';
import {getMemberFullName} from 'components/utils/teamMembers';
import Table from 'components/controls/Table';
import {isEmpty} from 'lodash';

const MEMBERS_TO_SKIP = 1;

export default class Welcome extends Component {
  style = style;
  styles = [welcomeStyle, PlannedVsActualstyle];

  static defaultProps = {
    userAccount: {
      companyName: '',
      firstName: '',
      lastName: '',
      companyWebsite: 'http://',
      competitorsWebsites: ['http://', 'http://', 'http://'],
      teamMembers: [],
      createNewVisible: false
    }
  };

  constructor(props) {
    super(props);
    this.state = {
      inviteMessage: null,
      showAddMemberPopup: false,
      validationError: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleChangeSelect = this.handleChangeSelect.bind(this);
    this.handleChangeArray = this.handleChangeArray.bind(this);
    this.addMember = this.addMember.bind(this);
    this.removeMember = this.removeMember.bind(this);
  }

  componentDidMount() {
    if (this.props.location.query.new) {
      const teamMembers = [{
        email: getProfileSync().email,
        firstName: '',
        lastName: '',
        role: '',
        userId: getProfileSync().user_id
      }];
      this.props.createUserAccount({teamMembers: teamMembers})
        .then(() => {
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  handleChange(parameter, event) {
    let update = Object.assign({}, this.props.userAccount);
    update[parameter] = event.target.value;
    this.props.updateState({userAccount: update});
  }

  updateSiteStructureIfNeeded = () => {
    if (isEmpty(this.props.siteStructure)) {
      const companyWebsite = this.props.userAccount.companyWebsite;

      let landingPageURL;
      if (companyWebsite) {
        const websiteWithOutWWW = companyWebsite.replace('www.', '');
        const indexOfProtocol = websiteWithOutWWW.indexOf('://');
        if (indexOfProtocol > -1) {
          const endIndexOfProtocol = indexOfProtocol + 3;
          landingPageURL =
            websiteWithOutWWW.slice(0, endIndexOfProtocol) + 'lp.' + websiteWithOutWWW.slice(endIndexOfProtocol);
        }
        else {
          landingPageURL = 'lp.' + websiteWithOutWWW;
        }

        this.props.updateUserMonthPlan({
          'siteStructure': {
            homepage: companyWebsite + '/',
            pricing: companyWebsite + '/pricing',
            blog: companyWebsite + '/blog',
            caseStudies: companyWebsite + '/case-studies',
            contact: companyWebsite + '/contact',
            aboutUs: companyWebsite + '/company',
            presentations: companyWebsite + '/presentations',
            eBooks: companyWebsite + '/e-books',
            whitepapers: companyWebsite + '/whitepapers',
            videos: companyWebsite + '/videos',
            landingPages: landingPageURL
          }
        });
      }
    }
  };

  handleChangeName(property, index, event) {
    let update = Object.assign({}, this.props.userAccount);
    update.teamMembers[index][property] = event.target.value;
    this.props.updateState({userAccount: update});
  }

  handleChangeNumber(parameter, event) {
    let number = parseInt(event.target.value);
    if (isNaN(number)) {
      number = -1;
    }
    let update = Object.assign({}, this.props.userAccount);
    update[parameter] = number;
    this.props.updateState({userAccount: update});
  }

  handleChangeSelect(parameter, event) {
    let update = Object.assign({}, this.props.userAccount);
    update[parameter] = event.value;
    this.props.updateState({userAccount: update});
  }

  handleChangeRole(index, event) {
    let update = Object.assign({}, this.props.userAccount);
    update.teamMembers[index].role = event.value;
    this.props.updateState({userAccount: update});
  }

  handleChangePhone(index, event) {
    let update = Object.assign({}, this.props.userAccount);
    update.teamMembers[index].phone = event.target.value;
    this.props.updateState({userAccount: update});
  }

  handleChangeArray(parameter, index, event) {
    let update = Object.assign({}, this.props.userAccount);
    update[parameter][index] = event.target.value;
    this.props.updateState({userAccount: update});
  }

  addMember() {
    let update = Object.assign({}, this.props.userAccount);
    update.teamMembers.push({firstName: '', lastName: '', email: '', role: ''});
    this.props.updateState({userAccount: update});
  }

  validate(mainTeamMemeber) {
    const errorFields = [];

    if (!mainTeamMemeber.firstName) {
      errorFields.push('firstName');
    }
    if (!mainTeamMemeber.lastName) {
      errorFields.push('lastName');
    }
    if (!this.props.userAccount.companyName) {
      errorFields.push('companyName');
    }
    if (!this.props.userAccount.companyWebsite) {
      errorFields.push('companyWebsite');
    }
    // has errors
    if (errorFields && errorFields.length > 0) {
      // change order so user will be focused on first error
      errorFields.reverse().forEach(field =>
        this.refs[field].validationError()
      );
      return false;
    }
    else {
      return true;
    }
  }

  removeMember(index) {
    let update = Object.assign({}, this.props.userAccount);
    const member = update.teamMembers.splice(index + MEMBERS_TO_SKIP, 1);
    this.props.updateState({userAccount: update});
    serverCommunication.serverRequest('DELETE', 'members', JSON.stringify(member[0]))
      .then((response) => {
        if (response.ok) {
          this.setState({inviteMessage: 'user has been removed successfully!'});
        }
        else {
          this.setState({inviteMessage: 'failed to remove user'});
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  inviteMember(newMember) {
    serverCommunication.serverRequest('PUT', 'members', JSON.stringify({
      newMember,
      admin: {
        name: getMemberFullName(this.props.userAccount.teamMembers[0]),
        company: this.props.userAccount.companyName
      }
    }))
      .then((response) => {
        if (response.ok) {
          this.setState({inviteMessage: 'user has been invited successfully!', showAddMemberPopup: false});
          response.json()
            .then((data) => {
              const userAccount = this.props.userAccount;
              userAccount.teamMembers = data.teamMembers;
              this.props.updateState({unsaved: false, teamMembers: data.teamMembers, userAccount: userAccount});
            });
        }
        else {
          this.setState({inviteMessage: 'failed to invite user'});
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  getUserAccountFields = () => {
    return {
      companyName: this.props.userAccount.companyName,
      teamMembers: this.props.userAccount.teamMembers,
      companyWebsite: this.props.userAccount.companyWebsite,
      competitorsWebsites: this.props.userAccount.competitorsWebsites
    };
  };

  render() {
    const userPermittedToSettings = userPermittedToPage('settings');
    const tableData = this.props.userAccount.teamMembers.slice(MEMBERS_TO_SKIP);
    const selects = {
      role: {
        label: 'Role',
        labelQuestion: false,
        select: {
          menuTop: true,
          name: 'role',
          onChange: () => {
          },
          options: [
            {value: 'CMO', label: 'CMO'},
            {value: 'VP Marketing', label: 'VP Marketing'},
            {value: 'VP Growth', label: 'VP Growth'},
            {value: 'Chief Marketing Technologist', label: 'Chief Marketing Technologist'},
            {value: 'Head of Marketing', label: 'Head of Marketing'},
            {value: 'Marketing Director', label: 'Marketing Director'},
            {value: 'Marketing Manager', label: 'Marketing Manager'},
            {value: 'Channel Manager', label: 'Channel Manager'},
            {value: 'Region Manager', label: 'Region Manager'},
            {value: 'Marketer', label: 'Marketer'},
            {value: 'Growth Hacker', label: 'Growth Hacker'},
            {value: 'Marketing Ops', label: 'Marketing Ops'},
            {value: 'Analyst', label: 'Analyst'},
            {value: 'Data Scientist', label: 'Data Scientist'},
            {value: 'CEO', label: 'CEO'},
            {value: 'CRO', label: 'CRO'},
            {value: 'CFO', label: 'CFO'},
            {value: 'COO', label: 'COO'},
            {value: 'Sales', label: 'Sales'},
            {value: 'Consultant', label: 'Consultant'},
            {value: 'Designer', label: 'Designer'},
            {value: 'Product Manager', label: 'Product Manager'},
            {value: 'Other', label: 'Other'}
          ]
        }
      }
    };
    const title = isPopupMode() ? 'Welcome! Let\'s get you started' : 'Account';
    const member = this.props.userAccount.teamMembers.find(member => member.userId === getProfileSync().user_id);
    const memberIndex = this.props.userAccount.teamMembers.findIndex(
      member => member.userId === getProfileSync().user_id);
    const userAccount = <div>
      <div className={this.classes.row}>
        <Label>First Name</Label>
        <Textfield value={member && member.firstName}
                   onChange={this.handleChangeName.bind(this, 'firstName', memberIndex)} ref={'firstName'}
                   withValidationError={true}/>
      </div>
      <div className={this.classes.row}>
        <Label>Last Name</Label>
        <Textfield value={member && member.lastName}
                   onChange={this.handleChangeName.bind(this, 'lastName', memberIndex)} ref={'lastName'}
                   withValidationError={true}/>
      </div>
      <div className={this.classes.row}>
        <Select {...selects.role} className={welcomeStyle.locals.select} selected={member && member.role}
                onChange={this.handleChangeRole.bind(this, memberIndex)}/>
      </div>
      <div className={this.classes.row}>
        <Label>Phone</Label>
        <Textfield value={member && member.phone} onChange={this.handleChangePhone.bind(this, memberIndex)}
                   style={{width: '283px'}} withValidationError={true}/>
      </div>
      <div className={this.classes.row}>
        <Label>Email</Label>
        <Textfield value={member && member.email} readOnly={true} withValidationError={true}/>
      </div>
      <div className={this.classes.row}>
        <Label>Picture</Label>
        <Avatar member={member} className={welcomeStyle.locals.userPicture}/>
      </div>
    </div>;
    const companyAccount = <div>
      <div className={this.classes.row}>
        <Label>Enter your brand/company name</Label>
        <Textfield value={this.props.userAccount.companyName} onChange={this.handleChange.bind(this, 'companyName')}
                   ref={'companyName'} withValidationError={true}/>
      </div>
      <div className={this.classes.row}>
        <Label>Company Website</Label>
        <Textfield value={this.props.userAccount.companyWebsite}
                   ref={'companyWebsite'}
                   onChange={this.handleChange.bind(this, 'companyWebsite')}
                   withValidationError={true}/>
      </div>
      {!isPopupMode() ?
        <div className={this.classes.row}>
          <Label>Team Members</Label>
          <div className={welcomeStyle.locals.innerBox}>
            <Table
              noPadding
              data={tableData}
              columns={[
                {
                  id: 'firstName',
                  header: 'First Name',
                  cell: 'firstName',
                  minWidth: 80
                },
                {
                  id: 'lastName',
                  header: 'Last Name',
                  cell: 'lastName',
                  minWidth: 80
                },
                {
                  id: 'email',
                  header: 'Email',
                  cell: 'email'
                },
                {
                  id: 'role',
                  header: 'Role',
                  cell: 'role'
                },
                {
                  id: 'admin',
                  header: 'Admin',
                  cell: (member) => (
                    <input type="checkbox" checked={!!member.isAdmin} readOnly/>
                  ),
                  className: welcomeStyle.locals.center,
                  minWidth: 60
                },
                {
                  id: 'remove',
                  header: '',
                  cell: (_, {index}) => (
                    <ButtonWithSurePopup
                      style={{background: '#e50000'}}
                      onClick={() => this.removeMember(index)}
                      buttonText="Remove"
                    />
                  ),
                  style: {overflow: 'visible'},
                  minWidth: 180
                }
              ]}
            />
          </div>
          <div>
            <div className={welcomeStyle.locals.center}>
              <Button
                type="primary"
                style={{width: '75px', marginTop: '20px'}}
                onClick={() => {
                  this.setState({showAddMemberPopup: true});
                }}>+Add
              </Button>
            </div>
            <div className={welcomeStyle.locals.inviteMessage}>
              {this.state.inviteMessage}
            </div>
          </div>
        </div>
        : null
      }
      <div className={this.classes.row}>
        <Label>Enter your main competitors' website (up to 3)</Label>
        <Textfield value={this.props.userAccount.competitorsWebsites[0]} style={{marginBottom: '16px'}}
                   onChange={this.handleChangeArray.bind(this, 'competitorsWebsites', 0)} withValidationError={true}/>
        <Textfield value={this.props.userAccount.competitorsWebsites[1]} style={{marginBottom: '16px'}}
                   onChange={this.handleChangeArray.bind(this, 'competitorsWebsites', 1)} withValidationError={true}/>
        <Textfield value={this.props.userAccount.competitorsWebsites[2]} style={{marginBottom: '16px'}}
                   onChange={this.handleChangeArray.bind(this, 'competitorsWebsites', 2)} withValidationError={true}/>
      </div>
      <PayButton isPaid={this.props.userAccount && this.props.userAccount.isPaid} pay={this.props.pay}
                 trialEnd={this.props.userAccount && this.props.userAccount.trialEnd}/>
    </div>;

    const pageClass = !isPopupMode()
      ? (userPermittedToSettings
        ? this.classes.static
        : welcomeStyle.locals.staticNoSideBar)
      : null;

    return <div>
      <Page popup={isPopupMode()} className={pageClass} contentClassName={this.classes.content} innerClassName={this.classes.pageInner} width='100%'>
        <Title title={title}
               subTitle="InfiniGrow is looking to better understand who you are so that it can adjust its recommendations to fit you"/>

        {isPopupMode() ?
          <div className={this.classes.cols}>
            <div className={this.classes.colCenter} style={{maxWidth: '707px'}}>
              {userAccount}
              {companyAccount}
            </div>
          </div>
          :
          userPermittedToSettings
            ? <Tabs
              ref="tabs"
              defaultSelected={0}
              defaultTabs={['Company Account', 'User Account']}
            >
              {({name, index}) => {
                return <div className={this.classes.cols}>
                  <div className={this.classes.colCenter} style={{maxWidth: '807px'}}>
                    {index ?
                      userAccount
                      :
                      companyAccount
                    }
                  </div>
                </div>;
              }}
            </Tabs>
            : <div>{userAccount}</div>
        }

        <div style={{
          height: '30px'
        }}/>

        {isPopupMode() ?

          <div className={this.classes.footerCols}>
            <div className={this.classes.footerLeft}>
            </div>
            <div className={this.classes.footerRight}>
              <div style={{width: '30px'}}/>
              <div className={this.classes.almostFooter}>
                <label hidden={!this.state.validationError} style={{color: 'red'}}>Please fill all the required
                  fields</label>
              </div>
              <NextButton onClick={() => {
                if (this.validate(member)) {
                  this.props.updateUserAccount(this.getUserAccountFields())
                    .then(() => {
                      if (this.props.region) {
                        history.push('/settings/profile/product');
                      }
                      else {
                        if (!this.props.userAccount.reasonForUse) {
                          this.setState({showReasonPopup: true});
                        }
                        else {
                          this.setState({createNewVisible: true});
                        }
                      }
                    });
                }
                else {
                  this.setState({validationError: true});
                }
              }}/>
            </div>
          </div>

          :
          <div className={this.classes.footer}>
            <SaveButton onClick={() => {
              this.setState({saveFail: false, saveSuccess: false});
              this.props.updateUserAccount(this.getUserAccountFields());
              this.updateSiteStructureIfNeeded();
              this.setState({saveSuccess: true});
            }} success={this.state.saveSuccess} fail={this.state.saveFail}/>
          </div>
        }
      </Page>
      <RegionPopup hidden={!this.state.createNewVisible}
                   close={() => {
                     this.setState({createNewVisible: false});
                   }}
                   createUserMonthPlan={this.props.createUserMonthPlan}
                   created={this.updateSiteStructureIfNeeded}
      />
      <ReasonPopup hidden={!this.state.showReasonPopup} updateUserAccount={this.props.updateUserAccount}
                   userAccount={this.props.userAccount} close={() => {
        this.setState({showReasonPopup: false, createNewVisible: true});
      }}/>
      <AddMemberPopup hidden={!this.state.showAddMemberPopup}
                      roleOptions={selects.role}
                      close={() => {
                        this.setState({showAddMemberPopup: false});
                      }}
                      inviteMember={this.inviteMember.bind(this)}/>
    </div>;
  }
}
