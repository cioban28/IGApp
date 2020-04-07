import React from "react";
import Component from "components/Component";
import style from 'styles/dashboard/arrow.css';

export default class Arrow extends Component {

  style=style;

  render() {
    return <div >
      <div className={ this.classes.arrow}>
        <div className={ this.classes.conversion }>
          {Number.isFinite(this.props.value) ? Math.round(this.props.value*100) : 0}%
        </div>
      </div>
    </div>
  }
}