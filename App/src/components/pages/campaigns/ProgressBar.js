import React from 'react';
import Component from 'components/Component';
import style from 'styles/campaigns/progress-bar.css';

export default class ProgressBar extends Component {

  style=style

  constructor(props) {
    super(props);
  }

  static defaultProps = {
    progress: 0
  };


  render() {
    return <div className={ this.classes.layout }>
      <div className={ this.classes.percent }>
        { Math.round(this.props.progress * 100) }%
      </div>
    <div className={ this.classes.bar }>
      <div className={ this.classes.fill } style={{ width: (this.props.progress * 660) + 'px' }}/>
    </div>
    </div>
  }

}