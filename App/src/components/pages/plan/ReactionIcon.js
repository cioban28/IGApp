import React from 'react';
import PropTypes from 'prop-types';
import Component from 'components/Component';
import style from 'styles/plan/state-selection.css';
import cellStyle from 'styles/plan/table-cell.css';

export default class ReactionIcon extends Component {

  style = style;
  styles = [cellStyle];

  static propTypes = {
    icon: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
    text: PropTypes.string.isRequired,
  };

  render() {
    const {text, icon, onClick} = this.props;
    return <div
      className={this.classes.reactionIcon}
      onClick={onClick}
      data-icon={icon}
    >
      <label className={this.classes.reactionLabel}>{text}</label>
    </div>
  }
}
