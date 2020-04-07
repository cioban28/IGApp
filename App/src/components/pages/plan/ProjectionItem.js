import React from 'react';
import Component from 'components/Component';
import names from 'classnames';

import style from 'styles/plan/projection-item.css';
import icons from 'styles/icons/indicators.css';
import { formatNumber } from 'components/utils/budget';
import Textfield from 'components/controls/Textfield';
import Button from 'components/controls/Button';
import {formatIndicatorDisplay} from 'components/utils/indicators';

export default class ProjectionItem extends Component {
  style = style;
  styles = [icons]

  constructor(props) {
    super(props);

    this.state = this.getState(props);
  }

  getState(props) {
    return {
      state: props.defaultState || 'normal',
      value: props.defaultValue || '',
      grow: props.grow
    };
  }

  getStateText() {
    switch (this.state.state) {
      case 'grow': {
        if (this.state.grow) {
          return `${ this.state.grow }% grow`;
        }

        return 'Grow';
      };
      case 'normal': return 'Stable';
      case 'decline': {
        if (this.state.grow) {
          return `${ this.state.grow }% decline`;
        }

        return 'Decline';
      };
      default: return '';
    }
  }

  getValueProgress() {
    const percents = this.state.value.match(/^(\d+)%$/);

    if (percents) {
      return +percents[1];
    } else {
      return 0;
    }
  }

  getValueText() {
    const value = this.state.value;

    if (!value) {
      return '\u00A0';
    }

    return formatIndicatorDisplay(this.props.indicator, value);
  }

  getDiff() {
    const { diff } = this.props;
    if (diff) {
      return ' (' +
        (diff > 0 ? '+' : '-') +
        Math.abs(diff).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
        + ')';
    }
    return '';
  }

  render() {
    return <div className={ this.classes.item } data-state={ this.state.state }>
      <div className={ this.classes.inner }>
        <div className={ this.classes.head }>{ this.props.title }</div>
        <div className={ this.classes.content }>
          <div className={ this.classes.iconWrap }>
            <div className={ this.classes.icon } data-icon={ this.props.icon } />
          </div>
          { this.state.state ?
            <div className={ this.classes.status }>
              { this.getValueText() }
              <div className={ this.classes.diff } data-negative={ this.props.diff > 0 ? null : true }>
                { this.getDiff() }
              </div>
            </div>
            : null }
        </div>
        <div className={ this.classes.footer }>
          <div className={ this.classes.footerState }>{ this.getStateText() }</div>
        </div>
      </div>
    </div>
  }

  componentWillReceiveProps(props) {
    this.setState(this.getState(props));
  }
}