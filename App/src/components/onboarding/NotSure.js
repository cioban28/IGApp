import React from 'react';
import Component from 'components/Component';
import names from 'classnames';

import style from 'styles/onboarding/not-sure.css';

export default class NotSure extends Component {
  style = style;

  render() {
    return <div role="button"
      style={ this.props.style }
      className={ names(this.classes.box, this.props.className) }
      onClick={ this.props.onClick }
    >
      Not sure?
    </div>
  }
}