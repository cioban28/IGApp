import React from 'react';
import Component from 'components/Component';
import names from 'classnames';

import style from 'styles/plan/loading.css';

export default class Loading extends Component {
  style = style;

  static defaultProps = {
    size: 1
  };

  render() {
    return <div className={ this.classes.wrap } style={{
      fontSize: this.props.size * 10 + 'px'
    }}>
      <div className={ this.classes.loader1 }></div>
      <div className={ this.classes.loader2 }></div>
      <div className={ this.classes.loader3 }></div>
      <div className={ this.classes.loader4 }></div>
      <div className={ this.classes.loader5 }></div>
    </div>
  }
}