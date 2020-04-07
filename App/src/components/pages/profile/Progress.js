import React from 'react';
import Component from 'components/Component';

import style from 'styles/profile/progress.css';

export default class Progress extends Component {
  style = style;

  render() {
    const progress = this.props.progress;
    const dots = [];

    for (let i = 0; i < 5; i++) {
      let dotProgress = i * 25;
      let className = progress > dotProgress ? this.classes.dotFilled : this.classes.dotEmpty;

      dots.push(<div key={ 'dot' + i } className={ className } style={{
        left: dotProgress + '%',
        marginLeft: -(dotProgress / 100 * 18) + (dotProgress < 50 ? -1 : 1) + 'px'
      }} />);
    }

    return <div className={ this.classes.box }>
      <div className={ this.classes.lineBox }>
        <div className={ this.classes.lineEmpty }></div>
        <div className={ this.classes.lineFilled } style={{
          width: progress + '%'
        }}></div>
        { dots }
      </div>
      <div className={ this.classes.image } style={{
        backgroundImage: `url(/${ this.props.image })`
      }}></div>
      <div className={ this.classes.text } >
        { this.props.text }
      </div>
    </div>
  }
}