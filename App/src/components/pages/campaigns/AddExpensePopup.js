import React from 'react';
import Component from 'components/Component';
import PagePopup from 'components/PagePopup';
import style from 'styles/onboarding/onboarding.css';
import campaignPopupStyle from 'styles/campaigns/capmaign-popup.css';
import Title from 'components/onboarding/Title';
import SaveButton from 'components/pages/profile/SaveButton';
import Label from 'components/ControlsLabel';
import Textfield from 'components/controls/Textfield';
import Select from 'components/controls/Select';
import Calendar from 'components/controls/Calendar';
import MultiRow from 'components/MultiRow';
import {getDates, NUMBER_OF_FUTURE_MONTHS} from 'components/utils/date';
import {extractNumberFromBudget, formatBudget} from 'components/utils/budget';
import history from 'history';
import {getTeamMembersOptions} from 'components/utils/teamMembers';
import ChannelsSelect from 'components/common/ChannelsSelect';
import Tags from 'components/controls/Tags';
import {isNil} from 'lodash';

export default class AddExpensePopup extends Component {

  style = style;
  styles = [campaignPopupStyle];

  defaultData = {
    index: null,
    name: '',
    owner: '',
    amount: '',
    type: '',
    dueDate: '',
    status: '',
    timeframe: [],
    assignedTo: {
      entityType: 'campaign',
      entityId: ''
    },
    poNumber: '',
    vendorName: '',
    tags: [],
    notes: '',
    close: history.goBack
  };

  constructor(props) {
    super(props);
    this.state = {
      ...this.defaultData
    };
  }

  componentDidMount() {
    if (this.props.location.state) {
      const {timeframe, ...otherState} = this.props.location.state;
      const parsedTimeframe = timeframe ?
        timeframe
          .filter(item => !isNil(item))
          .map((item, index) => {
            return {
              month: index,
              amount: item
            };
          }) : [];
      this.setState({...this.defaultData, ...otherState, timeframe: parsedTimeframe});
    }
  }

  removeTimeframe = (index) => {
    const timeframe = [...this.state.timeframe];
    timeframe.splice(index, 1);
    this.setState({timeframe: timeframe});
  };

  handleChangeEntityId = (value) => {
    const assignedTo = {...this.state.assignedTo};
    assignedTo.entityId = value;
    this.setState({assignedTo: assignedTo});
  };

  addOrEditExpense = () => {
    const {name, owner, amount, type, dueDate, timeframe, assignedTo, poNumber, vendorName, tags, notes, index} = this.state;
    const timeFrameArray = new Array(NUMBER_OF_FUTURE_MONTHS).fill(null);
    timeframe
      .filter(item => !isNil(item.month))
      .forEach(item => {
        timeFrameArray[item.month] = item.amount;
      });
    const newExpense = {
      name,
      owner,
      amount,
      type,
      dueDate,
      assignedTo,
      poNumber,
      vendorName,
      tags,
      notes,
      lastUpdateTime: new Date(),
      timeframe: timeFrameArray
    };
    const expenses = [...this.props.expenses];
    if (isNil(index)) {
      expenses.push(newExpense);
    }
    else {
      expenses[index] = newExpense;
    }
    this.props.updateUserMonthPlan({expenses}, this.props.region, this.props.planDate);
  };

  close = () => {
    if (this.state.close) {
      this.state.close();
    }
  };

  save = () => {
    this.addOrEditExpense();
    this.close();
  };

  handleChangeTimeframe = (value, index, param) => {
    const newTimeframe = [...this.state.timeframe];
    if (!newTimeframe[index]) {
      newTimeframe[index] = {
        month: '',
        amount: ''
      };
    }
    newTimeframe[index][param] = value;
    this.setState({timeframe: newTimeframe});
  };

  handleTagDelete = (index) => {
    const {tags} = this.state;
    tags.splice(index, 1);
    this.setState({tags});
  };

  handleTagAdd = (tag) => {
    const {tags} = this.state;
    this.setState({tags: [...tags, tag]});
  };

  render() {
    const {name, owner, amount, type, dueDate, timeframe, assignedTo: {entityType, entityId}, poNumber, vendorName, tags, notes} = this.state;
    const {calculatedData: {activeCampaigns}} = this.props;
    const selects = {
      owner: {
        label: 'Owner',
        select: {
          name: 'owner',
          options: getTeamMembersOptions(this.props.teamMembers)
        }
      },
      type: {
        label: 'Type',
        select: {
          name: 'type',
          options: [
            {value: 'Advertising', label: 'Advertising'},
            {value: 'Analyst Relations', label: 'Analyst Relations'},
            {value: 'Consultants/Agencies', label: 'Consultants/Agencies'},
            {value: 'Creative Services', label: 'Creative Services'},
            {value: 'Data', label: 'Data'},
            {value: 'Employee compensation', label: 'Employee compensation'},
            {value: 'Events', label: 'Events'},
            {value: 'Hospitality/Travel', label: 'Hospitality/Travel'},
            {value: 'Print', label: 'Print'},
            {value: 'Promotional Items', label: 'Promotional Items'},
            {value: 'Postage/Shipping', label: 'Postage/Shipping'},
            {value: 'Public Relations', label: 'Public Relations'},
            {value: 'Research', label: 'Research'},
            {value: 'Sponsorships', label: 'Sponsorships'},
            {value: 'Technical Services', label: 'Technical Services'},
            {value: 'Technology/Tools', label: 'Technology/Tools'},
            {value: 'Writing/Editing', label: 'Writing/Editing'},
            {value: 'Other', label: 'Other'}
          ]
        }
      }
    };

    const dates = getDates(this.props.planDate);
    const datesOptions = dates.map((item, index) => {
      return {label: item, value: index};
    });

    const entityIdProps = {
      style: {width: '230px'},
      selected: entityId,
      onChange: (e) => {
        this.handleChangeEntityId(e.value);
      }
    };

    return <div>
      <PagePopup width={'700px'} onClose={this.close}>
        <Title className={campaignPopupStyle.locals.title} title='Add Expense'/>
        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
          <SaveButton onClick={this.save}/>
        </div>
        <div>
          <div className={this.classes.flexRow}>
            <div className={this.classes.leftHalf}>
              <Label>Expense Name*</Label>
              <Textfield value={name}
                         required={true}
                         onChange={(e) => {
                           this.setState({name: e.target.value});
                         }}/>
            </div>
            <div className={this.classes.rightHalf}>
              <Select {...selects.owner}
                      selected={owner}
                      onChange={(e) => {
                        this.setState({owner: e.value});
                      }}/>
            </div>
          </div>
          <div className={this.classes.flexRow}>
            <div className={this.classes.leftHalf}>
              <Label>Total Amount</Label>
              <Textfield value={formatBudget(amount)}
                         onChange={(e) => {
                           this.setState({amount: extractNumberFromBudget(e.target.value)});
                         }}/>
            </div>
            <div className={this.classes.rightHalf}>
              <Select {...selects.type}
                      selected={type}
                      onChange={(e) => {
                        this.setState({type: e.value});
                      }}/>
            </div>
          </div>
          <div className={this.classes.flexRow}>
            <div className={this.classes.leftHalf}>
              <Label>Assign the expense’s timeframe</Label>
              <MultiRow numOfRows={timeframe.length || 1} rowRemoved={this.removeTimeframe}>
                {({index, data, update, removeButton}) => {
                  return <div style={{display: 'flex', marginBottom: '10px'}}>
                    <Select
                      style={{width: '90px'}}
                      selected={timeframe[index] && timeframe[index].month}
                      select={{
                        options: datesOptions
                      }}
                      onChange={e => this.handleChangeTimeframe(e.value, index, 'month')}
                    />
                    <Textfield value={formatBudget(timeframe[index] && timeframe[index].amount)}
                               placeHolder='$'
                               onChange={e => this.handleChangeTimeframe(extractNumberFromBudget(e.target.value), index, 'amount')}
                               style={{width: '90px', marginLeft: '20px'}}/>
                    <div style={{marginLeft: '25px', alignSelf: 'center'}}>
                      {removeButton}
                    </div>
                  </div>;
                }}
              </MultiRow>
            </div>
            <div className={this.classes.rightHalf}>
              <Label>Due Date</Label>
              <Calendar value={dueDate} onChange={(v) => {
                this.setState({dueDate: v});
              }}/>
            </div>
          </div>
          <div>
            <Label>Assign the expense’s father-object</Label>
          </div>
          <div className={this.classes.flexRow}>
            <Select select={{options: [{value: 'campaign', label: 'Campaign'}, {value: 'channel', label: 'Channel'}]}}
                    style={{width: '111px', marginRight: '19px'}}
                    selected={entityType}
                    onChange={(e) => {
                      const assignedTo = {...this.state.assignedTo};
                      assignedTo.entityType = e.value;
                      this.setState({assignedTo: assignedTo});
                    }}/>
            {
              entityType === 'campaign' ?
                <Select select={{
                  options: activeCampaigns.map(item => {
                    return {value: item.index, label: item.name};
                  })
                }}
                        {...entityIdProps}/>
                :
                <ChannelsSelect {...entityIdProps}/>
            }

          </div>
          <div className={this.classes.flexRow}>
            <div className={this.classes.leftHalf}>
              <Label>PO Number</Label>
              <Textfield value={poNumber} onChange={(e) => this.setState({poNumber: e.target.value})}/>
            </div>
            <div className={this.classes.rightHalf}>
              <Label>Vendor Name</Label>
              <Textfield value={vendorName} onChange={(e) => this.setState({vendorName: e.target.value})}/>
            </div>
          </div>
          <div className={this.classes.row}>
            <Label>Tags</Label>
            <Tags tags={tags}
                  handleDelete={this.handleTagDelete}
                  handleAddition={this.handleTagAdd}/>
          </div>
          <div className={this.classes.row}>
            <Label>Notes</Label>
            <textarea value={notes} className={campaignPopupStyle.locals.textArea}
                      onChange={(e) => this.setState({notes: e.target.value})}/>
          </div>
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
          <SaveButton onClick={this.save}/>
        </div>
      </PagePopup>
    </div>;
  }
}
