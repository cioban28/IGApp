import React from 'react';
import Component from 'components/Component';

// import style from 'styles/profile/back-button.css';
import style from 'styles/profile/profile.css';

import Button from 'components/controls/Button';

export default class BackButton extends Component {
  style = style;

  render() {
    return <Button type="secondary"
                   style={{
                      width: '120px',
                      letterSpacing: 0.075
                    }}
                   onClick={this.props.onClick}
                   icon='profile:back-button'>
      BACK
    </Button>;
  }
}