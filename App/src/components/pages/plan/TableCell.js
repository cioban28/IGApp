import React from 'react';
import PropTypes from 'prop-types';
import Component from 'components/Component';
import style from 'styles/plan/table-cell.css';
import budgetsTableStyle from 'styles/plan/budget-table.css';
import StateSelection from 'components/pages/plan/StateSelection';
import {formatBudget} from 'components/utils/budget';
import {extractNumber} from 'components/utils/utils';
import isNil from 'lodash/isNil';
import {findDOMNode} from 'react-dom';

const CONSTRAINT_MAPPING = {
  'none': {
    constraintData: {isConstraint: false},
    displayOptions: {text: 'Feel free to optimize', icon: 'plan:none'}
  },
  'soft': {
    constraintData: {isConstraint: true, isSoft: true},
    displayOptions: {text: 'I like the direction', icon: 'plan:like'}
  },
  'hard': {
    constraintData: {isConstraint: true, isSoft: false},
    displayOptions: {text: 'Lock budget', icon: 'plan:lock'}
  }
};

const EDIT_MODE = {
  ANY: 0,
  NONE: 1,
  FROM_STATE: 2,
  FROM_PROP: 3
};

export default class TableCell extends Component {

  style = style;
  styles = [budgetsTableStyle];

  static propTypes = {
    primaryValue: PropTypes.number.isRequired,
    secondaryValue: PropTypes.number,
    isConstraitsEnabled: PropTypes.bool,
    constraintChange: PropTypes.func,
    isConstraint: PropTypes.bool,
    isSoft: PropTypes.bool,
    isEditMode: PropTypes.bool,
    onChange: PropTypes.func,
    dragEnter: PropTypes.func,
    commitDrag: PropTypes.func,
    dragStart: PropTypes.func,
    isDragging: PropTypes.bool,
    approveSuggestion: PropTypes.func,
    enableActionButtons: PropTypes.bool,
    cellKey: PropTypes.string
  };

  static defaultProps = {
    secondaryValue: null,
    isConstraitsEnabled: false,
    isEditMode: false,
    isDragging: false,
    enableActionButtons: false
  };

  constructor(props) {
    super(props);

    this.state = {
      constraintsBoxOpen: false,
      hoverCell: false,
      isCellEditing: false,
      editValue: this.props.primaryValue
    };
  }

  componentDidMount() {
    document.addEventListener('click', this.onOutsideClick, true);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.onOutsideClick, true);
  }

  onOutsideClick = (e) => {
    const domElement = this.refs.cellRef;
    if (domElement && e.target !== domElement && !domElement.contains(e.target) && this.state.isCellEditing) {
      if (this.state.editValue === this.props.primaryValue) {
        this.declineEdit();
      }
      else {
        e.preventDefault();
        e.stopImmediatePropagation();
        this.refs.inputField.scrollIntoView({});
        this.refs.inputField.focus();
      }
    }
  };

  componentWillReceiveProps(newProps) {
    if (!isNil(newProps.primaryValue) && newProps.primaryValue !== this.props.primaryValue) {
      this.setState({
        editValue: newProps.primaryValue
      });
    }
  }

  getConstraint = () => {
    return !this.props.isConstraint ? 'none'
      : (this.props.isSoft ? 'soft' : 'hard');
  };

  changeConstraint = (changeTo) => {
    const typeOptions = CONSTRAINT_MAPPING[changeTo].constraintData;
    this.props.constraintChange(typeOptions.isConstraint, typeOptions.isSoft);
  };

  changeConstraintsBoxOpen = (isOpen) => {
    this.setState({constraintsBoxOpen: isOpen});
  };

  getConstraintsDisplayInfo = () => {
    const displayInfo = {};

    Object.keys(CONSTRAINT_MAPPING).forEach(key => {
      displayInfo[key] = CONSTRAINT_MAPPING[key].displayOptions;
    });

    return displayInfo;
  };

  isCellActive = () => {
    return this.state.hoverCell || this.state.constraintsBoxOpen;
  };

  isEditModeType = (editModeType) => {
    switch (editModeType) {
      case(EDIT_MODE.ANY):
        return this.state.isCellEditing || this.props.isEditMode;
      case(EDIT_MODE.FROM_STATE):
        return this.state.isCellEditing;
      case(EDIT_MODE.FROM_PROP):
        return this.props.isEditMode;
      case(EDIT_MODE.NONE):
        return !this.state.isCellEditing && !this.props.isEditMode;
    }
  };

  showSuggestion = () => {
    return !isNil(this.props.secondaryValue)
      && (this.isCellActive() || this.isEditModeType(EDIT_MODE.FROM_PROP))
      && (this.props.secondaryValue !== this.props.primaryValue);
  };

  approveEdit = () => {
    this.props.onChange(this.state.editValue);
    this.setState({editValue: null, isCellEditing: false});
  };

  declineEdit = () => {
    this.setState({editValue: this.props.primaryValue, isCellEditing: false});
  };

  onInputValueChange = (e) => {
    const value = extractNumber(e.target.value);
    this.setState({editValue: value});
  };

  onBlur = () => {
    const value = this.state.editValue;
    if (!isNil(value) && this.isEditModeType(EDIT_MODE.FROM_PROP)) {
      this.props.onChange(value);
    }
  };

  getActionButtons = () => {
    return <div className={this.classes.buttons}>
      {this.isEditModeType(EDIT_MODE.FROM_STATE) && !this.isEditModeType(EDIT_MODE.FROM_PROP) ?
        <div className={this.classes.innerButtons}>
          <div className={this.classes.icon}
               data-icon="plan:approveEdit"
               onClick={this.approveEdit}/>
          <div className={this.classes.icon}
               data-icon="plan:declineEdit"
               onClick={this.declineEdit}/>
        </div> : null}

      {this.showSuggestion() &&
        <div onClick={this.props.approveSuggestion}
             className={this.classes.icon}
             data-icon='plan:acceptSuggestion'/>
      }
      {(this.props.isConstraitsEnabled
        && !this.isEditModeType(EDIT_MODE.FROM_STATE)
        && (this.getConstraint() !== 'none' || this.isCellActive()))
        ? <StateSelection currentConstraint={this.getConstraint()}
                          constraintOptions={this.getConstraintsDisplayInfo()}
                          changeConstraint={this.changeConstraint}
                          changeConstraintsBoxOpen={this.changeConstraintsBoxOpen}
                          stateSelectionBoxRef={(ref) => this.boxRef = ref}
                          boxOpen={this.state.constraintsBoxOpen}
                          cellKey={this.props.cellKey}
        />
        : null}
      {this.isCellActive() && this.isEditModeType(EDIT_MODE.NONE) ? <div
        onClick={() => this.setState({isCellEditing: true, editValue: this.props.primaryValue})}
        className={this.classes.icon}
        data-icon="plan:edit"/> : null}
    </div>;
  };

  render() {
    return <td className={budgetsTableStyle.locals.valueCell}
               onMouseLeave={() => {
                 this.setState({hoverCell: false});
               }}
               onMouseOut={(e) => {
                 const domElement = findDOMNode(this.boxRef);
                 if (e.target === this.refs.cellRef && domElement && domElement.contains(e.relatedTarget)) {
                   this.setState({hoverCell: false});
                 }
               }}
               onMouseOver={(e) => {
                 const domElement = findDOMNode(this.boxRef);
                 if (!(domElement && domElement.contains(e.target))) {
                   this.setState({hoverCell: true});
                 }
               }
               }
               ref='cellRef'>

      <div className={this.classes.cellItem} data-in-edit={this.isEditModeType(EDIT_MODE.ANY) ? true : null}>
        {this.isEditModeType(EDIT_MODE.ANY) ?
          <input className={this.classes.editCell}
                 type="text"
                 value={formatBudget(this.state.editValue)}
                 onChange={this.onInputValueChange}
                 onBlur={this.onBlur}
                 ref='inputField'
                 onKeyPress={(event) => {
                   if (event.key === 'Enter') {
                     this.approveEdit();
                   }
                 }}
          />
          : <div>{formatBudget(this.props.primaryValue)}</div>}
        {this.props.enableActionButtons ? this.getActionButtons() : null}
      </div>
      {this.showSuggestion() ?
        <div className={this.classes.secondaryValue} data-in-edit={this.isEditModeType(EDIT_MODE.ANY) ? true : null}>
          {formatBudget(this.props.secondaryValue)}
        </div> : null}
    </td>;
  }
};