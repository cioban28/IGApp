import React from 'react';
import Component from 'components/Component';
import style from 'styles/campaigns/task.css';
import { formatNumber } from 'components/utils/budget';
import CampaignTask from 'components/pages/campaigns/CampaignTask';

export default class Task extends Component {

  style = style;

  constructor(props) {
    super(props);
    this.state = {
      editMode: false,
      descriptionVisible: false
    };
    this.toggleMode = this.toggleMode.bind(this);
    this.toggleDescription = this.toggleDescription.bind(this);
  }

  addOrEditTask(name, budget, description, dueDate, owner, priority, index) {
    this.props.addOrEditTask(name, budget, description, dueDate, owner, priority, index);
    this.toggleMode();
  }

  toggleMode() {
    this.setState({editMode: !this.state.editMode});
  }

  toggleDescription(){
    this.setState({descriptionVisible: !this.state.descriptionVisible});
  }

  getNumberOfDaysLeft() {
    const today = new Date();
    const dueDate = new Date(this.props.dueDate);
    const oneDay=1000*60*60*24;
    return Math.ceil((dueDate.getTime()-today.getTime())/(oneDay))+ " Days";
  }

  render() {
    return <div className={ this.classes.taskItem}>
      <div className={ this.classes.task } data-state={ this.props.completed }>
        <div className={ this.classes.start }>
          <div className={ this.classes.circle } onClick={ this.props.toggleCompletion.bind(this, this.props.index) }/>
          <div className={ this.classes.taskName }>
            { this.props.name }
          </div>
          { this.props.description ?
            <div className={ this.classes.content } onClick={ this.toggleDescription }/>
            : null }
          <div className={ this.classes.budget }>
            {this.props.budget ? '$' + formatNumber(this.props.budget)  : '' }
          </div>
          <div className={ this.classes.dueDate }>
            { this.props.dueDate ? '(' + this.getNumberOfDaysLeft() + ')' : '' }
          </div>
          <div className={ this.classes.owner }>
            { this.props.owner }
          </div>
          { this.props.priority ?
            <div className={ this.classes.priority }>{this.props.priority}</div>
            : null }
        </div>
        <div className={ this.classes.delete } onClick={ this.toggleMode }>
          <div className={ this.classes.editIcon }/>
        </div>
        <div className={ this.classes.delete } onClick={ this.props.deleteTask.bind(this, this.props.index) }>
          <div className={ this.classes.deleteIcon }/>
        </div>
      </div>
      <div className={ this.classes.description } hidden={ !this.state.descriptionVisible }>
        { this.props.description }
      </div>
      <div style={{ marginLeft: '50px' }} hidden={ !this.state.editMode }>
        <CampaignTask {... this.props} isNew={ false } addOrEditTask={ this.addOrEditTask.bind(this) }/>
      </div>
    </div>
  }

}