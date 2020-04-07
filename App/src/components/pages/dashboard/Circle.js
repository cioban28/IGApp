import React from "react";
import Component from "components/Component";
import style from 'styles/dashboard/circle.css';

export default class Circle extends Component {

  style=style;

  render() {
    return <div>
      <div className={ this.classes.circle }>
        <div className={ this.classes.circleText }>
          {this.props.value}
        </div>
      </div>
      <div className={ this.classes.title }>
        {this.props.title}
      </div>
    </div>
  }
}