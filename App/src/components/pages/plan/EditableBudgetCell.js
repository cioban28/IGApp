import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import Component from 'components/Component';
import {extractNumber} from 'components/utils/utils';
import style from 'styles/plan/editable-budget-cell.css';

export default class EditableBudgetCell extends Component {

  style = style;
  
  static propTypes = {
    value: PropTypes.number.isRequired,
    formatter: PropTypes.func.isRequired,
    save: PropTypes.func,
    disabled: PropTypes.bool
  }

  static defaultProps = {
    save: () => {},
    disabled: false
  }

  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
      isEditing: false
    }
  }

  componentDidMount() {
    document.addEventListener('click', this.handleOutsideClick);
  }

  componentWillUnmount() {
    document.removeEventListener('click', this.handleOutsideClick);
  }
  
  componentDidUpdate(prevProps, prevState) {
    if (prevProps.value !== this.props.value) {
      this.setState({value: this.props.value});
    }
    if (prevState.isEditing !== this.state.isEditing && this.state.isEditing) {
      this.input.focus();
    }
  }

  handleOutsideClick = (e) => {
    const {value} = this.props;
    const {isEditing} = this.state;

    if (isEditing && this.container && !this.container.contains(e.target)) {
      this.setState({isEditing: false, value});
    }
  }

  onChange = (e) => {
    this.setState({value: extractNumber(e.target.value)});
  }

  save = () => {
    const {save} = this.props;
    const {value} = this.state;

    save(extractNumber(value));
    this.closeEditor();
  }

  cancel = () => {
    const {value} = this.props;

    this.setState({value});
    this.closeEditor();
  }

  openEditor = () => {
    this.setState({isEditing: true});
  }

  closeEditor = () => {
    this.setState({isEditing: false});
  }

  render() {
    const {formatter, disabled} = this.props;
    const {value, isEditing} = this.state;

    return (
      <div ref={el => this.container = el} className={this.classes.container}>
        {
          isEditing
          ? (
            <Fragment>
              <input
                ref={el => this.input = el}
                value={formatter(value)}
                onChange={this.onChange}
                className={this.classes.input}
              />
              <button
                type='button'
                onClick={this.save}
                className={this.classes.saveButton}
              />
              <button
                type='button'
                onClick={this.cancel}
                className={this.classes.cancelButton}
              />
            </Fragment>
          )
          : (
            <Fragment>
              {formatter(value)}
              <button
                type='button'
                disabled={disabled}
                onClick={this.openEditor}
                className={this.classes.toggleButton}
              />
            </Fragment>
          )
        }
      </div>
    )
  }
}
