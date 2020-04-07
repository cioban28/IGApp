import React from 'react';
import Component from 'components/Component';

import style from 'styles/notice.css';

export default class Notice extends Component {
  style = style;

  render() {
    let className;

    if (this.props.warning) {
      className = this.classes.warning;
    } else if (this.props.accent) {
      className = this.classes.accent;
    } else {
      className = this.classes.notice;
    }

    return <div style={ this.props.style } className={ className }>
      { this.props.children }
    </div>
  }
}