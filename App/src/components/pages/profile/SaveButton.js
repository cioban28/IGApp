import React from 'react';
import Component from 'components/Component';

// import style from 'styles/profile/next-button.css';
import style from 'styles/onboarding/buttons.css';

import Button from 'components/controls/Button';

export default class SaveButton extends Component {
  style = style;

  static defaultProps = {
    style: {
      width: '128px',
      letterSpacing: 0.075
    }
  };

  render() {
    return <div>
			<Button type="primary"
							onClick={ this.props.onClick }
							className={ this.classes.planButton }
							icon="buttons:save"
							style={ this.props.style }
			>
				Save
			</Button>
			<div style={{ marginTop: '5px', fontSize: '14px' }}>
				<label hidden={ !this.props.success} style={{ color: 'green' }}>Saved successfully!</label>
				<label hidden={ !this.props.fail} style={{ color: 'red' }}>Failed to save</label>
			</div>
		</div>;
  }
}