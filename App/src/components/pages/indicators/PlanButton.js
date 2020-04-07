import React from 'react';
import Component from 'components/Component';

import style from 'styles/onboarding/buttons.css';
import Button from 'components/controls/Button';

export default class NextButton extends Component {
  style = style;

  render() {
    return <Button type="primary"
      onClick={ this.props.onClick }
      className={ this.classes.planButton }
      icon="buttons:plan"
      style={{
        width: '128px',
        letterSpacing: 0.075
      }}
    >
      PLAN
    </Button>;
  }
}