import React from 'react';
import Component from 'components/Component';

import style from 'styles/profile/choose-button.css';

export default class Button extends Component {
  style = style;

  render() {
    const className = this.props.selected ?
      this.classes.selectedButton : this.classes.button;

    return <div className={ className } onClick={ this.props.onClick }>
      <div className={ this.classes.icon } data-icon={ this.props.icon || null } />
      <div className={ this.classes.text }>
        { this.props.text }
      </div>
    </div>
  }
}