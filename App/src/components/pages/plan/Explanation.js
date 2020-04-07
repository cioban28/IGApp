import React from 'react';
import Component from 'components/Component';
import names from 'classnames';

import style from 'styles/plan/explanation.css';

export default class Explanation extends Component {
  style = style;

  render() {
    return <div className={ this.classes.box }>
      <div className={ this.classes.title }>
        { this.props.title }
      </div>
      <div className={ this.classes.text }>
        { this.props.text }
      </div>
    </div>
  }
}