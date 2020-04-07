import React from 'react';
import Component from 'components/Component';
import Button from 'components/controls/Button';
import Page from 'components/Page';
import Label from 'components/ControlsLabel';
import Textfield from 'components/controls/Textfield';
import MultiSelect from 'components/controls/MultiSelect';
import {formatChannels} from 'components/utils/channels';
import Toggle from 'components/controls/Toggle';
import style from 'styles/onboarding/onboarding.css';
import popupStyle from 'styles/welcome/add-member-popup.css';
import Select from 'components/controls/Select';

export default class AddMemberPopup extends Component {

  style = style;
  styles = [popupStyle];

  pagePermissions = [
    {
      key: 'settings',
      label: 'Account Settings',
      isDisabled: false
    },
    {
      key: 'dashboard',
      label: 'Dashboard',
      isDisabled: false
    },
    {
      key: 'analyze',
      label: 'Analyze',
      isDisabled: false
    },
    {
      key: 'plan',
      label: 'Plan',
      isDisabled: false
    },
    {
      key: 'campaigns',
      label: 'Campaigns',
      isDisabled: true
    }
  ];

  getInitialPermissions = () => {
    const initialPermissions = {};
    this.pagePermissions.forEach(item => initialPermissions[item.key] = true);

    return initialPermissions;
  };

  initialState = {
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    isAdmin: true,
    specificChannels: [],
    isSpecificChannels: false,
    pagePermissions: this.getInitialPermissions()
  };

  constructor(props) {
    super(props);

    this.state = {...this.initialState};
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.hidden !== this.props.hidden) {
      this.setState({...this.initialState});
    }
  }

  handleChangeChannels(event) {
    let update = event.map((obj) => {
      return obj.value;
    });
    this.setState({specificChannels: update});
  }

  inviteMember = () => {
    const blockedPages = Object.keys(this.state.pagePermissions)
      .filter(pageKey => !this.state.pagePermissions[pageKey]);

    this.props.inviteMember({...this.state, pagePermissions: null, blockedPages});
  };

  render() {

    const pagePermissionsLabels = this.pagePermissions.map((permissionItem) => {
      return <Label key={permissionItem.key}
                    checkboxDisabled={permissionItem.isDisabled}
                    checkbox={this.state.pagePermissions[permissionItem.key]}
                    style={{textTransform: 'capitalize'}}
                    onChange={() => {

                      const newPermissions = {...this.state.pagePermissions};
                      newPermissions[permissionItem.key] = !newPermissions[permissionItem.key];
                      this.setState({pagePermissions: newPermissions});

                    }}>{permissionItem.label}</Label>;
    });

    const channels = {
      select: {
        name: 'channels',
        options: formatChannels()
      }
    };
    return <div hidden={this.props.hidden}>
      <Page popup={true} width={'410px'} contentClassName={popupStyle.locals.content}
            innerClassName={popupStyle.locals.inner}>
        <div className={popupStyle.locals.title}>
          Invite Users
        </div>
        <div className={this.classes.row}>
          <Label>First Name</Label>
          <Textfield
            value={this.state.firstName}
            onChange={(e) => {
              this.setState({firstName: e.target.value});
            }}
          />
        </div>
        <div className={this.classes.row}>
          <Label>Last Name</Label>
          <Textfield
            value={this.state.lastName}
            onChange={(e) => {
              this.setState({lastName: e.target.value});
            }}
          />
        </div>
        <div className={this.classes.row}>
          <Label>Email</Label>
          <Textfield
            value={this.state.email}
            onChange={(e) => {
              this.setState({email: e.target.value});
            }}
          />
        </div>
        <div className={this.classes.row}>
          <Label>Role</Label>
          <Select select={this.props.roleOptions.select} selected={this.state.role}
                  onChange={e => this.setState({role: e.value})}/>
        </div>
        <div className={this.classes.row} style={{display: 'inline-block'}}>
          <Label>Permissions</Label>
          <Toggle
            options={[{
              text: 'Admin',
              value: true
            },
              {
                text: 'User',
                value: false
              }
            ]}
            selectedValue={this.state.isAdmin}
            onClick={(value) => {
              this.setState({isAdmin: value});
            }}/>
        </div>
        {!this.state.isAdmin ?
          <div className={this.classes.row}>
            <Label>Page Permissions</Label>
            {pagePermissionsLabels}
            <Label checkbox={this.state.isSpecificChannels} onChange={() => {
              this.setState({isSpecificChannels: !this.state.isSpecificChannels});
            }}>
              choose specific channels to view/edit
            </Label>
            <MultiSelect {...channels} selected={this.state.specificChannels}
                         onChange={this.handleChangeChannels.bind(this)} style={{width: 'initial'}}
                         disabled={!this.state.isSpecificChannels}/>
          </div>
          : null
        }
        <div className={this.classes.footerCols}>
          <div className={this.classes.footerLeft}>
            <Button
              type="secondary"
              style={{width: '72px'}}
              onClick={this.props.close}>Cancel
            </Button>
            <Button
              type="primary"
              style={{width: '110px', marginLeft: '20px'}}
              onClick={() => {
                this.inviteMember();
              }}>Invite User
            </Button>
          </div>
        </div>
      </Page>
    </div>;
  }
}