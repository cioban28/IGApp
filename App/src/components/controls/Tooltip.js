import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import classnames from 'classnames';
import Component from 'components/Component';
import style from 'styles/controls/tooltip.css';

class Tooltip extends Component {

  style = style;

  static defaultProps = {
    place: 'bottom',
    effect: 'solid',
    component: 'div',
    html: true,
  }

  static propTypes = {
    id: PropTypes.string.isRequired,
    tip: PropTypes.node,
    children: PropTypes.node,
    place: PropTypes.string,
    effect: PropTypes.string,
    component: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    html: PropTypes.bool,
    TooltipProps: PropTypes.object,
    ComponentProps: PropTypes.object
  }

  render() {
    const {
      id,
      tip,
      children,
      effect,
      html,
      place,
      component: TooltipComponent,
      TooltipProps,
      ...ComponentProps
    } = this.props;

    return (
      <Fragment>
        <TooltipComponent data-tip={tip} data-for={id} {...ComponentProps}>
          {children}
        </TooltipComponent>

        <ReactTooltip
          place={place}
          effect={effect}
          id={id}
          html={html}
          {...TooltipProps}
          className={classnames(this.classes.tooltip, TooltipProps && TooltipProps.className)}
        />
      </Fragment>
    )
  }
}

export default Tooltip;
