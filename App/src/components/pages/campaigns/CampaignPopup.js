import React from 'react';
import merge from 'lodash/merge';
import Component from 'components/Component';
import Page from 'components/Page';
import Title from 'components/onboarding/Title';
import Brief from 'components/pages/campaigns/Brief';
import Checklist from 'components/pages/campaigns/Checklist';
import Updates from 'components/pages/campaigns/Updates';
import Tracking from 'components/pages/campaigns/Tracking';
import Assets from 'components/pages/campaigns/Assets';
import headerStyle from 'styles/header.css';
import style from 'styles/onboarding/onboarding.css';
import campaignPopupStyle from 'styles/campaigns/capmaign-popup.css';
import UnsavedPopup from 'components/UnsavedPopup';
import AddTemplatePopup from 'components/pages/campaigns/AddTemplatePopup';
import SaveButton from 'components/pages/profile/SaveButton';
import buttonsStyle from 'styles/onboarding/buttons.css';
import Button from 'components/controls/Button';
import isEmpty from 'lodash/isEmpty';
import CampaignExpenses from 'components/pages/campaigns/CampaignExpenses';

export default class CampaignPopup extends Component {

  style = style;
  styles = [campaignPopupStyle, headerStyle, buttonsStyle];

  constructor(props) {
    super(props);
    this.close = this.close.bind(this);
    this.state = {
      selectedTab: 0,
      visible: this.props.visible || false,
      campaign: merge({}, CampaignPopup.defaultProps.campaign, this.props.campaign)
    };
    this.setRefName = this.setRefName.bind(this);
    this.setRefSource = this.setRefSource.bind(this);
    this.setRefDueDate = this.setRefDueDate.bind(this);
    this.save = this.save.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (this.props !== nextProps) {
      this.setState({
        visible: nextProps.visible || false,
        campaign: merge({}, CampaignPopup.defaultProps.campaign, nextProps.campaign)
      });
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.handleKeyPress);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.handleKeyPress);
  }

  static defaultProps = {
    teamMembers: [],
    campaign: {
      index: undefined,
      name: '',
      budget: null,
      isOneTime: false,
      owner: '',
      source: [],
      dueDate: '',
      startDate: new Date().toLocaleDateString().replace(/[/]/g, '-'),
      actualSpent: null,
      status: 'New',
      focus: '',
      time: {
        development: 0,
        design: 0,
        marketing: 0
      },
      objectives: [{
        growth: '',
        kpi: '',
        actualGrowth: ''
      }, {
        growth: '',
        kpi: '',
        actualGrowth: ''
      }, {
        growth: '',
        kpi: '',
        actualGrowth: ''
      }],
      tracking: {
        baseUrl: ''
      },
      tasks: [],
      comments: [],
      assets: [],
      targetAudience: '',
      description: '',
      referenceProjects: '',
      keywords: '',
      additionalInformation: ''
    }
  };

  handleKeyPress(e) {
    /**
     if (e.key === 'Enter') {
      this.save();
    }
     **/
    if (e.key === 'Escape') {
      this.close();
    }
  }

  selectTab(selectedIndex) {
    this.setState({
      selectedTab: selectedIndex
    });
  }

  updateState(newState) {
    this.setState(newState);
    this.setState({unsaved: newState.unsaved === undefined ? true : newState.unsaved});
  }

  close() {
    const callback = (userAnswer) => {
      if (userAnswer) {
        this.setState({selectedTab: 0, unsaved: false});
        this.props.closePopup();
      }
      this.setState({showUnsavedPopup: false});
    };
    if (this.state.unsaved) {
      this.setState({showUnsavedPopup: true, callback: callback});
    }
    else {
      this.setState({selectedTab: 0});
      this.props.closePopup();
    }
  }

  openAddTemplatePopup() {
    this.setState({showAddTemplatePopup: true});
  }

  closeAddTemplatePopup() {
    this.setState({showAddTemplatePopup: false});
  }

  createTemplate(templateName) {
    this.props.updateCampaignsTemplates(templateName, this.state.campaign);
    this.closeAddTemplatePopup();
  }

  setRefName(input) {
    if (input) {
      this.nameInput = input;
    }
  }

  setRefSource(input) {
    if (input) {
      this.sourceInput = input;
    }
  }

  setRefDueDate(input) {
    if (input) {
      this.dueDateInput = input;
    }
  }

  validate() {
    return this.state.campaign.name && this.state.campaign.source && this.state.campaign.source.length > 0 && (!this.state.campaign.isOneTime || this.state.campaign.dueDate);
  }

  save() {
    if (this.validate()) {
      this.updateState({unsaved: false});
      this.props.updateCampaign(this.state.campaign)
        .then(() => {
        })
        .catch((err) => {
          console.log(err);
        });
      this.setState({selectedTab: 0});
      this.props.closePopup();
    }
    else {
      this.setState({selectedTab: 0},
        () => {
          if (!this.state.campaign.name) {
            this.nameInput.focus();
          }
          else if (isEmpty(this.state.campaign.source)) {
            this.sourceInput.focus();
          }
          else {
            this.dueDateInput.focus();
          }
        });
    }
  }

  render() {
    const tabs = {
      'Brief': Brief,
      'Items': Checklist,
      'Updates': Updates,
      'Tracking': Tracking,
      'Assets': Assets,
      'Expenses': CampaignExpenses
    };

    const tabNames = Object.keys(tabs);
    const selectedName = tabNames[this.state.selectedTab];
    const selectedTab = tabs[selectedName];

    return <div>
      <Page popup={true} width={'800px'} contentClassName={campaignPopupStyle.locals.content}>
        <div className={campaignPopupStyle.locals.topRight}>
          <div className={campaignPopupStyle.locals.close} onClick={this.close}/>
        </div>
        <Title className={campaignPopupStyle.locals.title} title={this.state.campaign.name || 'Campaign Details'}/>
        <div className={headerStyle.locals.headTabs} style={{height: '85px', margin: '0 38px'}}>
          {
            tabNames.map((name, i) => {
              let className;

              if (i === this.state.selectedTab) {
                className = headerStyle.locals.headTabSelected;
              }
              else {
                className = headerStyle.locals.headTab;
              }

              return <div className={className} key={i} onClick={() => {
                this.selectTab(i);
              }}>{name}</div>;
            })
          }
          <div style={{marginLeft: 'auto', alignSelf: 'center'}}>
            {this.state.campaign.index !== undefined ?
              <SaveButton onClick={this.save}/>
              :
              <Button
                type="primary"
                icon="buttons:save"
                className={buttonsStyle.locals.planButton}
                onClick={this.save}>
                Create
              </Button>
            }
          </div>
        </div>
        <div className={campaignPopupStyle.locals.inner}>
          {selectedTab ? React.createElement(selectedTab, merge({}, this.state, {
            updateState: this.updateState.bind(this),
            close: this.close,
            openAddTemplatePopup: this.openAddTemplatePopup.bind(this),
            updateCampaign: this.props.updateCampaign,
            closePopup: this.props.closePopup,
            teamMembers: this.props.teamMembers,
            processedChannels: this.props.processedChannels,
            setRefName: this.setRefName,
            setRefSource: this.setRefSource,
            setRefDueDate: this.setRefDueDate,
            save: this.save,
            addNotification: this.props.addNotification,
            expenses: this.props.expenses,
            planDate: this.props.planDate
          })) : null}
        </div>
      </Page>
      <UnsavedPopup hidden={!this.state.showUnsavedPopup} callback={this.state.callback}/>
      <AddTemplatePopup hidden={!this.state.showAddTemplatePopup}
                        closeAddTemplatePopup={this.closeAddTemplatePopup.bind(this)}
                        createTemplate={this.createTemplate.bind(this)} campaignName={this.state.campaign.name}/>
    </div>;
  }
}