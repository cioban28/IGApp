import React from 'react';
import Component from 'components/Component';
import Tooltip from 'components/controls/Tooltip';
import style from 'styles/onboarding/buttons.css';
import Button from 'components/controls/Button';
import planStyle from 'styles/plan/plan.css';
import planButtonStyle from 'styles/plan/plan-button.css';

export default class PlanButton extends Component {

  style = style;
  styles = [planStyle, planButtonStyle];

  tooltipHtml = `You've reached the plan updates limit.<br/> To
    upgrade,
    click <a href="mailto:support@infinigrow.com?&subject=I need replan upgrade"
    target='_blank'>here</a>`;

  render() {
    const disabled = this.props.numberOfPlanUpdates === 0;
    const icon = 'buttons:plan' + (disabled ? '-disabled' : '');

    return <Tooltip style={{display: 'flex', position: 'relative'}}
                tip={disabled ? this.tooltipHtml : ''}
                id='plan-button'
                TooltipProps={{
                    'data-class': planButtonStyle.locals.tooltipClass,
                    'data-delay-hide': 1000
                }}
    >
      <Button type='primary'
              disabled={disabled}
              onClick={this.props.onClick}
              style={this.props.style}
              icon={this.props.showIcons ? icon : null}
      >
        {this.props.label} ({this.props.numberOfPlanUpdates})
        {
          this.props.showIcons && this.props.planNeedsUpdate ?
            <div className={planStyle.locals.planCircle}/>
            : null
        }
      </Button>
    </Tooltip>;
  }
}