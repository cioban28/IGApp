import React from 'react';
import Component from 'components/Component';
import style from 'styles/dashboard/column.css';

export default class Column extends Component {

  style = style;

  static defaultProps = {
    maxHeight: 259,
    minHeight: 29,
    width: 90
  };

  render() {
    const {maxHeight, minHeight, width} = this.props;
    const maxMargin = maxHeight - minHeight;
    // Avoid zero deviation. If value is 0, height should be 0 as well
    const height = this.props.value && this.props.maxValue ? Math.min(Math.round(this.props.value * maxHeight / this.props.maxValue) + minHeight, maxHeight) : 0;
    const margin = this.props.value ? Math.min(maxHeight - height, maxMargin) : maxHeight;
    return <div className={this.classes.column} style={{backgroundColor: this.props.backgroundColor}}>
      <div className={this.classes.tower}
           style={{
             backgroundColor: this.props.fillColor,
             height: height + 'px',
             marginTop: margin + 'px',
             width: `${width}px`
           }}>
        <div className={this.classes.amount}>
          {this.props.value}
        </div>
      </div>
      <div className={this.classes.title} style={this.props.titleStyle}>
        {this.props.title}
      </div>
    </div>;
  }
}