import React from 'react';
import Component from 'components/Component';

// import style from 'styles/profile/next-button.css';
import style from 'styles/profile/profile.css';

import Button from 'components/controls/Button';

export default class NextButton extends Component {
  style = style;

  render() {
    return <Button type="primary"
                   style={{
                      width: '120px',
                      letterSpacing: 0.075
                    }}
                   onClick={this.props.onClick}
                   icon='profile:next-button'
                   iconPosition='right'
    >
      NEXT
    </Button>;
  }
}