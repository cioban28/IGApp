import React from 'react';
import PropTypes from 'prop-types';
import Component from 'components/Component';
import style from 'styles/indicators/platform.css';
import Button from 'components/controls/Button';
import {getNickname as getIndicatorNickname} from 'components/utils/indicators';
import Loading from 'components/pages/indicators/Loading';
import Tooltip from 'components/controls/Tooltip';

export default class Platform extends Component {

  style = style;

  static propTypes = {
    loading: PropTypes.bool.isRequired,
    connectButtonText: PropTypes.string.isRequired,
    indicators: PropTypes.arrayOf(PropTypes.string),
    icon: PropTypes.string,
    hidden: PropTypes.bool,
    connected: PropTypes.bool,
    title: PropTypes.string.isRequired,
    open: PropTypes.func.isRequired
  };

  static defaultProps = {
    loading: false,
    connectButtonText: 'Connect'
  };

  getTooltipHtml = () => {
    return this.props.indicators ?
      'Relevant metrics:<br/>' + this.props.indicators.map(getIndicatorNickname).join('<br/>')
      : null;
  };

  render() {
    return <div>
      {this.props.loading ? <Loading icon={this.props.icon}
                                     className={this.classes.defaultDimensions}/>
        : <div className={this.classes.square} hidden={this.props.hidden}
               data-connected={this.props.connected ? true : null}>
              <Tooltip className={this.classes.platformIcon}
                       tip={this.getTooltipHtml()}
                       id='platform-tooltip'
                       data-icon={this.props.icon}
              />
              <div className={this.classes.platformText}>
            {this.props.title}
          </div>
          <Button type="primary" className={this.classes.connectButton} onClick={this.props.open}>
            {this.props.connectButtonText}
          </Button>
          <div className={this.classes.footer}>
            <div className={this.classes.checkIcon}/>
            <div>
              Connected
            </div>
            <div className={this.classes.footerButton} onClick={this.props.open}/>
          </div>
        </div>
      }
    </div>;
  }
};