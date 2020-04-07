import React from 'react';
import Component from 'components/Component';

import style from 'styles/page.css';

export default class PageContainer extends Component {
  style = style;

  static defaultProps = {
    sidebar: true
  }

  render() {
    let className = this.props.popup ?
      this.classes.popup : this.classes.static;

    if (this.props.className) {
      className += ' ' + this.props.className;
    }

    return <div
      className={ className }
      style={ this.props.style }
      data-sidebar={ this.props.sidebar }
    >
      { this.props.children }
    </div>
  }
}