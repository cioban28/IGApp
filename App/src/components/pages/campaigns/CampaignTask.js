import React from 'react';
import Component from 'components/Component';
import style from 'styles/campaigns/campaign-task.css';
import Textfield from 'components/controls/Textfield';
import Button from 'components/controls/Button';
import Calendar from 'components/controls/Calendar';
import { formatNumber } from 'components/utils/budget';
import Select from 'components/controls/Select';

export default class CampaignTask extends Component {

  style = style;

  constructor(props) {
    super(props);
    this.state = {
      name: props.name,
      budget: props.budget,
      owner: props.owner,
      priority: props.priority,
      description: props.description,
      dueDate: props.dueDate,
      showAdvanced: !props.isNew
    };
  }

  static defaultProps = {
    name: '',
    budget: '',
    owner: '',
    description: '',
    dueDate: '',
    priority: '',
    isNew: true
  };

  handleChangeName(event) {
    this.setState({name: event.target.value});
  }

  handleChangeBudget(event) {
    this.setState({budget: parseInt(event.target.value.replace(/[-$h,]/g, ''))})
  }

  handleChangeOwner(event) {
    this.setState({owner: event.target.value});
  }

  handleChangeDescription(event) {
    this.setState({description: event.target.value});
  }

  handleChangeDate(value) {
    this.setState({dueDate: value});
  }

  handleChangePriority(event) {
    this.setState({priority: event.value});
  }

  addOrEditTask() {
    this.props.addOrEditTask(this.state.name, this.state.budget, this.state.description, this.state.dueDate, this.state.owner, this.state.priority, this.props.index);
    if (this.props.isNew) {
      this.setState({name: '', budget: '', description: '', dueDate: '', owner: '', priority: ''});
      this.refs.name.focus()
    }
  }

  openAdvancedOption() {
    this.setState({showAdvanced: true});
  }

  handleKeyPress(e) {
    if (e.key == 'Enter') {
      this.addOrEditTask();
    }
  }

  render() {
    const selects = {
      priority: {
        select: {
          name: 'priority',
          options: [
            {value: 1, label: 1},
            {value: 2, label: 2},
            {value: 3, label: 3},
            {value: 4, label: 4},
            {value: 5, label: 5},
          ]
        }
      }
    };
    return <div hidden={ this.props.hidden }>
      <div className={ this.classes.addItem }>
        <Textfield className={ this.classes.textField }value={ this.state.name } onChange={ this.handleChangeName.bind(this) } placeHolder="Add an item..." ref="name" onKeyPress={ this.handleKeyPress.bind(this) }/>
        <div className={ this.classes.advanced } onClick={ this.openAdvancedOption.bind(this) } hidden={ this.state.showAdvanced }>
          Advanced
        </div>
      </div>
      <div hidden={ !this.state.showAdvanced }>
        <Textfield className={ this.classes.textField } value={this.state.budget ? "$" + formatNumber(this.state.budget) : ""} onChange={ this.handleChangeBudget.bind(this) } placeHolder="Add a budget..."/>
        <textarea className={ this.classes.textArea } value={ this.state.description } onChange={ this.handleChangeDescription.bind(this) } placeholder="Add a description..."/>
        <div className={ this.classes.oneLine }>
          <div className={ this.classes.left }>
            <div className={ this.classes.calendar }>
              <Calendar value={ this.state.dueDate } onChange={ this.handleChangeDate.bind(this) } placeholder="Due date?" inputClassName={ this.classes.calendarInput }/>
            </div>
          </div>
          <div className={ this.classes.center }>
            <Select { ... selects.priority } selected={ this.state.priority }
                    onChange={ this.handleChangePriority.bind(this) } innerClassName={ this.classes.priority } placeholder="Priority?"/>
          </div>
          <div className={ this.classes.right }>
            <Textfield style={{ width: '166px' }} className={ this.classes.textField } value={this.state.owner} onChange={ this.handleChangeOwner.bind(this) } placeHolder="Owner?"/>
          </div>
        </div>
      </div>
      <Button className={ this.classes.addOrEdit } type="primary" style={{ width: '80px' }} onClick={ this.addOrEditTask.bind(this) }>
        {this.props.isNew ? "Add" : "Edit"}
      </Button>
    </div>
  }

}