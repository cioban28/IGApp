import React from 'react';
import Component from 'components/Component';

import style from 'styles/profile/insights.css';

export default class Progress extends Component {
  style = style;

  render() {
    let highlight;
    let text;

    if (this.props.highlight) {
      highlight = <div className={ this.classes.highlight } />
      text = <div className={ this.classes.text } >
        Similar companies to yours are usually investing 20% - 30% of their budget in social media marketing.
      </div>
    }

    return <div className={ this.classes.box }>
      <div className={ this.classes.inner }>
        { text }
      </div>
      { highlight }
    </div>
  }
}