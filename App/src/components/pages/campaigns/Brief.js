import React from 'react';
import Component from 'components/Component';
import Label from 'components/ControlsLabel';
import Textfield from 'components/controls/Textfield';
import Select from 'components/controls/Select';
import Calendar from 'components/controls/Calendar';
import Button from 'components/controls/Button';
import SaveButton from 'components/pages/profile/SaveButton';
import AssetsPopup from 'components/pages/campaigns/AssetsPopup';
import style from 'styles/onboarding/onboarding.css';
import campaignPopupStyle from 'styles/campaigns/capmaign-popup.css';
import MultiSelect from 'components/controls/MultiSelect';
import {getChannelsWithTitles, getTitle} from 'components/utils/channels';
import Toggle from 'components/controls/Toggle';
import buttonsStyle from 'styles/onboarding/buttons.css';
import {getTeamMembersOptions} from 'components/utils/teamMembers';
import {getNickname} from 'components/utils/indicators';

export default class Brief extends Component {

  style = style;
  styles = [campaignPopupStyle, buttonsStyle];

  constructor(props) {
    super(props);
    this.state = {
      showAdvanced: false
    };
    this.getEmailBody = this.getEmailBody.bind(this);
    this.getEmailHeader = this.getEmailHeader.bind(this);
    this.getEmailTo = this.getEmailTo.bind(this);
  }

  static defaultProps = {
    teamMembers: []
  };

  componentWillReceiveProps(nextProps) {
    // Advanced toggle open?
    if (nextProps.campaign.time.design ||
      nextProps.campaign.time.development ||
      nextProps.campaign.time.marketing ||
      nextProps.campaign.focus ||
      nextProps.campaign.objectives[0].kpi ||
      nextProps.campaign.objectives[1].kpi ||
      nextProps.campaign.objectives[2].kpi ||
      nextProps.campaign.objectives[0].growth ||
      nextProps.campaign.objectives[1].growth ||
      nextProps.campaign.objectives[2].growth ||
      nextProps.campaign.objectives[0].actualGrowth ||
      nextProps.campaign.objectives[1].actualGrowth ||
      nextProps.campaign.objectives[2].actualGrowth ||
      nextProps.campaign.targetAudience ||
      nextProps.campaign.assets.length > 0 ||
      nextProps.campaign.description ||
      nextProps.campaign.referenceProjects ||
      nextProps.campaign.keywords ||
      nextProps.campaign.additionalInformation) {
      this.setState({showAdvanced: true});
    }
    else {
      this.setState({showAdvanced: false});
    }
  }

  handleChangeSource = (event) => {
    let update = Object.assign({}, this.props.campaign);
    update.source = event.map((obj) => {
      return obj.value;
    });
    this.props.updateState({campaign: update});
  };

  handleChangeBudget(parameter, event) {
    let update = Object.assign({}, this.props.campaign);
    update[parameter] = parseInt(event.target.value.replace(/[-$h,]/g, ''));
    this.props.updateState({campaign: update});
  }

  handleChangeBool(bool) {
    let update = Object.assign({}, this.props.campaign);
    update.isOneTime = bool;
    this.props.updateState({campaign: update});
  }

  handleChangeText(parameter, event) {
    let update = Object.assign({}, this.props.campaign);
    update[parameter] = event.target.value;
    this.props.updateState({campaign: update});
  }

  handleChangeTime(parameter, event) {
    let update = Object.assign({}, this.props.campaign);
    update.time[parameter] = parseInt(event.target.value.replace(/[-h.]/g, ''));
    this.props.updateState({campaign: update});
  }

  handleChangeSelect(parameter, event) {
    let update = Object.assign({}, this.props.campaign);
    update[parameter] = event.value;
    this.props.updateState({campaign: update});
  }

  handleChangeObjectives(parameter, index, event) {
    let update = Object.assign({}, this.props.campaign);
    update.objectives[index][parameter] = event.target.value;
    this.props.updateState({campaign: update});
  }

  handleChangeObjectivesSelect(parameter, index, event) {
    let update = Object.assign({}, this.props.campaign);
    update.objectives[index][parameter] = event.value;
    this.props.updateState({campaign: update});
  }

  handleChangeTracking(parameter, event) {
    let update = Object.assign({}, this.props.campaign);
    update.tracking[parameter] = event.target.value;
    this.props.updateState({campaign: update});
  }

  handleChangeDate(parameter, value) {
    let update = Object.assign({}, this.props.campaign);
    update[parameter] = value;
    this.props.updateState({campaign: update});
  }

  archive() {
    let update = Object.assign({}, this.props.campaign);
    update.isArchived = true;
    this.props.updateState({campaign: update, unsaved: false});
    this.props.updateCampaign(update)
      .then(() => {
      })
      .catch((err) => {
        console.log(err);
      });
    this.props.closePopup();
  }

  getEmailTo() {
    return (this.props.campaign.owner ?
      this.props.teamMembers
        .filter(item => item.userId === this.props.campaign.owner)
        .map(item => item.email)
      : '');
  }

  getEmailHeader() {
    return 'InfiniGrow  - New Marketing Campaign - ' + this.props.campaign.name;
  }

  getEmailBody() {
    const newLine = '\r\n';
    const sourceTitles = this.props.campaign.source.map(source => getTitle(source) || source);
    const linksCategories = this.props.campaign.assets ?
      [...new Set(this.props.campaign.assets.map(item => item.category))]
      : [];
    const links = linksCategories.map(category => {
      return category + ':' + newLine +
        this.props.campaign.assets.filter(asset => asset.category === category)
          .map(asset => asset.name ? asset.name + ' - ' + asset.link : asset.link);
    });
    return 'Congrats! you have been assigned to a new marketing campaign through InfiniGrow. Let\'s have a look at the brief:' + newLine +
      newLine +
      '- Sources: ' + sourceTitles.join() + newLine +
      '- Campaign Name: ' + this.props.campaign.name + newLine +
      '- Campaign Budget: ' + (this.props.campaign.actualSpent || this.props.campaign.budget) + newLine +
      '- Status: ' + this.props.campaign.status + newLine +
      newLine +
      (this.props.campaign.startDate ? ('Start date: ' + this.props.campaign.startDate + newLine + newLine) : '') +
      (this.props.campaign.dueDate ? ('Due date: ' + this.props.campaign.dueDate + newLine + newLine) : '') +
      newLine +
      (this.props.campaign.time && this.props.campaign.time.marketing ? ('- Expected marketing time: ' + this.props.campaign.time.marketing + ' hours' + newLine) : '') +
      (this.props.campaign.time && this.props.campaign.time.development ? ('- Expected development time: ' + this.props.campaign.time.development + ' hours' + newLine) : '') +
      (this.props.campaign.time && this.props.campaign.time.design ? ('- Expected design time: ' + this.props.campaign.time.design + ' hours' + newLine) : '') +
      'Campaign objectives:' + newLine +
      (this.props.campaign.focus ? 'Campaign focus: ' + this.props.campaign.focus + newLine : '') +
      (this.props.campaign.objectives && this.props.campaign.objectives.kpi[0] ? ('- KPI: ' + this.props.campaign.objectives.kpi[0] + ', Expected Growth: ' + this.props.campaign.objectives.growth[0] + ', Actual Growth: ' + this.props.campaign.objectives.actualGrowth[0] + newLine) : '') +
      (this.props.campaign.objectives && this.props.campaign.objectives.kpi[1] ? ('- KPI: ' + this.props.campaign.objectives.kpi[1] + ', Expected Growth: ' + this.props.campaign.objectives.growth[1] + ', Actual Growth: ' + this.props.campaign.objectives.actualGrowth[0] + newLine) : '') +
      (this.props.campaign.objectives && this.props.campaign.objectives.kpi[2] ? ('- KPI: ' + this.props.campaign.objectives.kpi[2] + ', Expected Growth: ' + this.props.campaign.objectives.growth[2] + ', Actual Growth: ' + this.props.campaign.objectives.actualGrowth[0] + newLine) : '') +
      newLine +
      (this.props.campaign.targetAudience ? ('Target audience:' + newLine + this.props.campaign.targetAudience + newLine + newLine) : '') +
      (this.props.campaign.description ? ('Campaign description:' + newLine + this.props.campaign.description + newLine + newLine) : '') +
      (this.props.campaign.referenceProjects ? ('Reference projects:' + newLine + this.props.campaign.referenceProjects + newLine + newLine) : '') +
      (this.props.campaign.keywords ? ('Keywords:' + newLine + this.props.campaign.keywords + newLine + newLine) : '') +
      (this.props.campaign.additionalInformation ? ('Notes:' + newLine + this.props.campaign.additionalInformation + newLine + newLine) : '') +
      (links ? ('Links:' + newLine + links.join() + newLine + newLine) : '') +
      newLine +
      'Thanks!';
  }

  exportCampaign() {
    const win = window.open(encodeURI('mailto:' + this.getEmailTo() + '?&subject=' + this.getEmailHeader() + '&body=' + this.getEmailBody()));
    this.props.save();
  }

  addObjectivesRow() {
    let update = Object.assign({}, this.props.campaign);
    update.objectives.push({
      growth: '',
      kpi: '',
      actualGrowth: ''
    });
    this.props.updateState({campaign: update});
  }

  render() {
    const objectivesIndicatorsMap = ['MCL', 'MQL', 'SQL', 'opps', 'users', 'MRR', 'ARR']
      .map(value => {
        return {value, label: getNickname(value)};
      });
    const objectivesOptions = [
      {value: 'impressions', label: 'Impressions'},
      {value: 'clicks', label: 'Clicks'},
      {value: 'ctr', label: 'CTR'},
      {value: 'cpc', label: 'CPC'},
      {value: 'conversions', label: 'Conversions'},
      {value: 'revenue', label: 'Revenue'},
      {value: 'webVisits', label: 'Web Visits'}
    ];
    objectivesIndicatorsMap.forEach(item => objectivesOptions.push(item));

    const selects = {
      owner: {
        label: 'Owner',
        select: {
          name: 'owner',
          options: getTeamMembersOptions(this.props.teamMembers)
        }
      },
      source: {
        label: 'Source*',
        select: {
          name: 'source',
          options: getChannelsWithTitles()
        }
      },
      status: {
        label: 'Status',
        select: {
          name: 'status',
          options: [
            {value: 'New', label: 'New'},
            {value: 'Assigned', label: 'Assigned'},
            {value: 'In Progress', label: 'In Progress'},
            {value: 'In Review', label: 'In Review'},
            {value: 'Approved', label: 'Approved'},
            {value: 'Completed', label: 'Completed'},
            {value: 'On Hold', label: 'On Hold'},
            {value: 'Rejected', label: 'Rejected'}
          ]
        }
      },
      focus: {
        label: 'Focus',
        select: {
          name: 'focus',
          options: [
            {value: 'Acquisition', label: 'Acquisition'},
            {value: 'Activation', label: 'Activation'},
            {value: 'Retention', label: 'Retention'},
            {value: 'Revenue', label: 'Revenue'},
            {value: 'Referral', label: 'Referral'}
          ]
        }
      },
      objectives: {
        select: {
          name: 'objective',
          options: objectivesOptions
        }
      }
    };
    // Handle manual channels
    this.props.processedChannels.names.forEach(source => {
      if (!selects.source.select.options.find(item => item.value === source)) {
        selects.source.select.options.push({value: source, label: source});
      }
    });

    const assetsCategories = this.props.campaign.assets ?
      [...new Set(this.props.campaign.assets.map(item => item.category))]
      : [];
    const assets = assetsCategories.map((category, index) => {
      return <div key={index} className={campaignPopupStyle.locals.categoryAssets}>
        <div className={campaignPopupStyle.locals.assetsCategory}>
          {category}
        </div>
        <div className={campaignPopupStyle.locals.assetsLinks}>
          {this.props.campaign.assets.filter(asset => asset.category === category)
            .map((asset, index) => <a className={campaignPopupStyle.locals.assetsLink} key={index} href={asset.link}
                                      target="_blank">{asset.name || asset.link}</a>)
          }
        </div>
      </div>;
    });

    const objectiveRows = <div className={this.classes.cols}>
      <div className={this.classes.colLeft}>
        <Label style={{
          width: '166px'
        }}>KPI</Label>
        {this.props.campaign.objectives.map((item, index) =>
          <Select key={index} {...selects.objectives} style={{width: '166px', marginTop: '8px'}}
                  selected={item && item.kpi} onChange={this.handleChangeObjectivesSelect.bind(this, 'kpi', index)}/>
        )}
      </div>
      <div className={this.classes.colCenter}>
        <Label style={{
          width: '166px'
        }}>Expected Growth</Label>
        {this.props.campaign.objectives.map((item, index) =>
          <Textfield key={index} value={item && item.growth}
                     onChange={this.handleChangeObjectives.bind(this, 'growth', index)}
                     style={{width: '166px', marginTop: '8px'}}/>
        )}
      </div>
      <div className={this.classes.colRight}>
        <Label style={{
          width: '166px'
        }}>Actual Growth</Label>
        {this.props.campaign.objectives.map((item, index) =>
          <Textfield key={index} value={item && item.actualGrowth}
                     onChange={this.handleChangeObjectives.bind(this, 'actualGrowth', index)} style={{
            width: '166px',
            marginTop: '8px'
          }}/>
        )}
      </div>
    </div>;

    return <div>
      <div className={this.classes.row}>
        <div className={this.classes.cols}>
          <div className={this.classes.colLeft}>
            <Label>Campaign Name*</Label>
            <Textfield value={this.props.campaign.name} required={true}
                       onChange={this.handleChangeText.bind(this, 'name')} ref={this.props.setRefName}
                       style={{width: '428px'}}/>
          </div>
          <div className={this.classes.colRight}>
            <Select {...selects.owner} style={{width: '166px'}} selected={this.props.campaign.owner}
                    onChange={this.handleChangeSelect.bind(this, 'owner')}/>
          </div>
        </div>
      </div>
      <div className={this.classes.row}>
        <div className={this.classes.cols}>
          <div className={this.classes.colLeft}>
            <Label>{this.props.campaign.isOneTime ? 'Budget' : 'Monthly Budget'}</Label>
            <Textfield
              value={'$' + (this.props.campaign.budget ? this.props.campaign.budget.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
              onChange={this.handleChangeBudget.bind(this, 'budget')} style={{
              width: '166px'
            }}/>
          </div>
          <div className={this.classes.colCenter}>
            <Label>Actual Spent</Label>
            <Textfield
              value={'$' + (this.props.campaign.actualSpent ? this.props.campaign.actualSpent.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
              onChange={this.handleChangeBudget.bind(this, 'actualSpent')} style={{
              width: '166px'
            }}/>
          </div>
          <div className={this.classes.colRight}>
            <Label>Budget Type</Label>
            <Toggle
              options={[{
                text: 'Recurrent',
                value: false
              },
                {
                  text: 'One time',
                  value: true
                }
              ]}
              selectedValue={this.props.campaign.isOneTime}
              onClick={(value) => {
                this.handleChangeBool(value);
              }}/>
          </div>
        </div>
      </div>
      <div className={this.classes.row}>
        <div className={this.classes.cols}>
          <div className={this.classes.colLeft}>
            <MultiSelect {...selects.source} style={{width: '428px', textTransform: 'capitalize'}}
                         selected={this.props.campaign.source} onChange={this.handleChangeSource}
                         ref={this.props.setRefSource}/>
          </div>
          <div className={this.classes.colRight}>
            <Select {...selects.status} style={{width: '166px'}} selected={this.props.campaign.status}
                    onChange={this.handleChangeSelect.bind(this, 'status')}/>
          </div>
        </div>
      </div>
      <div className={this.classes.row}>
        <div className={this.classes.cols}>
          <div className={this.classes.colLeft}>
            <div style={{width: '166px'}}>
              <Label>Start Date</Label>
              <Calendar value={this.props.campaign.startDate} onChange={this.handleChangeDate.bind(this, 'startDate')}/>
            </div>
          </div>
          <div className={this.classes.colCenter}>
            <div style={{width: '166px'}}>
              <Label>Due Date</Label>
              <Calendar value={this.props.campaign.dueDate} onChange={this.handleChangeDate.bind(this, 'dueDate')}
                        ref={this.props.setRefDueDate}/>
            </div>
          </div>
          <div className={this.classes.colRight} style={{width: '166px'}}>
          </div>
        </div>
      </div>
      <div className={this.classes.row}>
        <div className={campaignPopupStyle.locals.advanced} onClick={() => {
          this.setState({showAdvanced: !this.state.showAdvanced});
        }}>
          Advanced
        </div>
      </div>
      <div hidden={!this.state.showAdvanced}>
        <div className={this.classes.row}>
          <Label style={{fontSize: '18px', fontWeight: 'bold'}}>Time</Label>
          <div className={this.classes.cols}>
            <div className={this.classes.colLeft}>
              <Label>Marketing</Label>
              <Textfield
                value={this.props.campaign.time && this.props.campaign.time.marketing ? this.props.campaign.time.marketing + 'h' : ''}
                onChange={this.handleChangeTime.bind(this, 'marketing')} style={{
                width: '166px'
              }}/>
            </div>
            <div className={this.classes.colCenter}>
              <Label>Design</Label>
              <Textfield
                value={this.props.campaign.time && this.props.campaign.time.design ? this.props.campaign.time.design + 'h' : ''}
                onChange={this.handleChangeTime.bind(this, 'design')} style={{
                width: '166px'
              }}/>
            </div>
            <div className={this.classes.colRight}>
              <Label>Development</Label>
              <Textfield
                value={this.props.campaign.time && this.props.campaign.time.development ? this.props.campaign.time.development + 'h' : ''}
                onChange={this.handleChangeTime.bind(this, 'development')} style={{
                width: '166px'
              }}/>
            </div>
          </div>
        </div>
        <div className={this.classes.row}>
          <Label style={{fontSize: '18px', fontWeight: 'bold'}}>Campaign Objectives</Label>
          <Select {...selects.focus} selected={this.props.campaign.focus}
                  onChange={this.handleChangeSelect.bind(this, 'focus')}
                  style={{width: '166px', marginBottom: '14px'}}/>
          {objectiveRows}
          <Button type="secondary" style={{width: '100px', marginTop: '8px'}}
                  onClick={this.addObjectivesRow.bind(this)}>
            Add
          </Button>
        </div>
        <div className={this.classes.row}>
          <Label>Links
            <div className={campaignPopupStyle.locals.assetsIcon} onClick={() => {
              this.setState({assetsPopup: true});
            }}/>
          </Label>
          <div className={campaignPopupStyle.locals.assetsBox}>
            {assets}
          </div>
        </div>
        <div className={this.classes.row}>
          <Label>Target Audience</Label>
          <textarea value={this.props.campaign.targetAudience} className={campaignPopupStyle.locals.textArea}
                    onChange={this.handleChangeText.bind(this, 'targetAudience')}/>
        </div>
        <div className={this.classes.row}>
          <Label>Campaign Description</Label>
          <textarea value={this.props.campaign.description} className={campaignPopupStyle.locals.textArea}
                    onChange={this.handleChangeText.bind(this, 'description')}/>
        </div>
        <div className={this.classes.row}>
          <Label>Keywords</Label>
          <textarea value={this.props.campaign.keywords} className={campaignPopupStyle.locals.textArea}
                    onChange={this.handleChangeText.bind(this, 'keywords')}/>
        </div>
        <div className={this.classes.row}>
          <Label>Notes</Label>
          <textarea value={this.props.campaign.additionalInformation} className={campaignPopupStyle.locals.textArea}
                    onChange={this.handleChangeText.bind(this, 'additionalInformation')}/>
        </div>
      </div>
      <div className={this.classes.footer} style={{marginBottom: '1px'}}>
        <div className={this.classes.footerLeft}>
          <Button type="secondary" style={{width: '100px'}} onClick={this.archive.bind(this)}>Archive</Button>
          <Button type="secondary" style={{width: '165px', marginLeft: '30px'}}
                  onClick={this.props.openAddTemplatePopup}>Save
            as a template</Button>
        </div>
        <div className={this.classes.footerRight}>
          <Button type="secondary" style={{width: '100px', marginRight: '30px'}}
                  onClick={this.exportCampaign.bind(this)}>
            Export
          </Button>
          {this.props.campaign.index !== undefined ?
            <SaveButton onClick={this.props.save}/>
            :
            <Button
              type="primary"
              icon="buttons:save"
              className={buttonsStyle.locals.planButton}
              onClick={this.props.save}>
              Create
            </Button>
          }
        </div>
      </div>
      <AssetsPopup hidden={!this.state.assetsPopup} updateCampaign={() => {
        this.props.updateCampaign(this.props.campaign);
      }} updateState={this.props.updateState} campaign={this.props.campaign} close={() => {
        this.setState({assetsPopup: false});
      }}/>
    </div>;
  }
}