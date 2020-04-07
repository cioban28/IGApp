import React from 'react';
import Component from 'components/Component';
import isNil from 'lodash/isNil';
import style from 'styles/indicators/item.css';
import icons from 'styles/icons/indicators.css';
import providerIcons from 'styles/icons/providers.css';
import tooltipStyle from 'styles/controls-label.css';
import Popup from 'components/Popup';
import Textfield from 'components/controls/Textfield';
import Button from 'components/controls/Button';
import {formatIndicatorDisplay} from 'components/utils/indicators';

export default class Item extends Component {

  style = style;
  styles = [icons, tooltipStyle, providerIcons];

  constructor(props) {
    super(props);
    this.state = {...this.initialState(props)};
  }

  componentWillReceiveProps(nextProps) {
    this.setState({...this.initialState(nextProps)});
  }

  initialState = (props) => {
    return {
      state: props.defaultStatus ? (props.defaultStatus === -2 ? 'irrelevant' : (props.automaticIndicators
        ? 'auto'
        : 'manual')) : (props.defaultStatus === 0 ? (props.automaticIndicators ? 'auto' : 'inactive') : undefined),
      status: props.defaultStatus <= 0
        ? (props.automaticIndicators ? props.defaultStatus : '')
        : formatIndicatorDisplay(props.name, props.defaultStatus),
      menuShown: false,
      statusPopupHidden: true,
      name: props.name,
      maxValue: props.maxValue / 100 || 1,
      displayHelp: false
    };
  };

  getStateText() {
    switch (this.state.state) {
      case 'auto':
        return 'Automatic';
      case 'manual':
        return 'Manual';
      case 'inactive':
        return 'Inactive';
      case 'irrelevant':
        return 'Irrelevant';

      default:
        return 'Inactive';
    }
  }

  getStatusProgress() {
    let value;
    if (typeof this.state.status === 'string' || this.state.status instanceof String) {
      const percents = this.state.status.match(/^(\d+)%/);
      if (percents) {
        value = +percents[1];
      }
      const dollars = this.state.status.match(/^\$(\d+)/);
      if (dollars) {
        value = +dollars[1];
        return value / this.state.maxValue;
      }
      value = parseInt(this.state.status) / this.state.maxValue || 0;
    }
    else {
      value = this.state.status / this.state.maxValue || 0;
    }
    if (this.props.isDirectionDown) {
      value = 100 - value;
    }
    return value;
  }

  getStatusText() {
    const status = this.state.status;

    if (status === 0) {
      return '0';
    }

    if (!status) {
      return '\u00A0';
    }

    if (isFinite(status)) {
      return status.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    return status.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  needProgress() {
    if (this.state.state === 'manual' || this.state.state === 'auto') {
      return true;
    }

    return false;
  }

  selectState = (state) => {
    this.setState({
      state: state,
      menuShown: false
      //status: this.props.status || ''
    });
    if (state === 'inactive' || state === 'irrelevant') {
      this.setState({status: ''});
    }
  };

  showMenu = () => {
    this.setState({
      menuShown: true
    });
  };

  useStatus = () => {
    let status = this.refs.statusText.getValue();
    status = parseInt(status.replace(/[%$,]/g, ''));
    if ((status && status > 0) || status == 0) {
      this.setState({
        status: formatIndicatorDisplay(this.props.name, (this.props.isPercentage && status > 100) ? 100 : status),
        statusPopupHidden: true
      });
      this.props.updateIndicator(this.props.name, status);
    }
  };

  showSocialPopup = () => {
    const url = require('assets/social-popup.png');
    const win = window.open('about:blank', 'social_popup', 'width=700,height=290');

    win.document.open();
    win.document.write(`
      <style>
        html, body {
          margin: 0;
          height: 100%;
        }
      </style>
      <base href="${document.baseURI}">
      <img src="${url}" width="700">
    `);
    win.document.close();

    win.document.querySelector('img').onclick = (e) => {
      this.setState({
        status: '1500'
      });

      e.target.onclick = null;
      win.close();
    };
  };

  render() {
    let tooltip = null;
    if (this.state.displayHelp) {
      tooltip =
        <div className={tooltipStyle.locals.tooltip} style={{left: '75%', top: '71px', width: '222px', zIndex: '3'}}>
          <div className={tooltipStyle.locals.ttLabel}>
            {this.props.title}
          </div>
          <div className={tooltipStyle.locals.ttContent}>
            <div>
              <div className={tooltipStyle.locals.ttSubText}>
                {this.props.description}
              </div>
              <div className={tooltipStyle.locals.ttSubText} style={{fontWeight: 'bold'}}>
                {this.props.formula}
              </div>
              {this.props.timeframe ? <div className={tooltipStyle.locals.ttSubText} style={{fontWeight: 'bold'}}>
                Time Frame: {this.props.timeframe}
              </div> : null}
            </div>
          </div>
        </div>;
    }
    return <div className={this.classes.item} data-state={this.state.state ? this.state.state : 'start'}
                onMouseOver={() => {
                  this.setState({
                    hover: true
                  });
                }}
                onMouseOut={() => {
                  this.setState({
                    hover: false
                  });
                }}>
      <div className={this.classes.inner}>
        <div className={this.classes.head}>{this.props.title}</div>
        {this.props.automaticIndicators && this.props.automaticIndicators !== true ?
          <div className={this.classes.providerIcon} data-icon={this.props.automaticIndicators}/>
          : null}
        <div className={this.classes.content}>
          <div className={this.classes.iconWrap}
               onMouseOver={() => {
                 this.setState({
                   displayHelp: true
                 });
               }}
               onMouseOut={() => {
                 this.setState({
                   displayHelp: false
                 });
               }}>
            {this.needProgress() ?
              <ProgressCircle progress={this.getStatusProgress()}/>
              : null}
            <div className={this.classes.icon} data-icon={this.props.icon}/>
            <div hidden={!this.state.hover || this.state.state} className={this.classes.addNewPlus} onClick={() => {
              this.setState({menuShown: true});
            }}/>
          </div>
          {!isNil(this.state.state) ?
            <div className={this.classes.status}>{this.getStatusText()}</div>
            : null}
        </div>
        <div className={this.classes.footer}>
          <div className={this.classes.footerButton} onClick={this.showMenu} hidden={this.props.isMenuHidden}/>
          <div className={this.classes.footerState}>{this.getStateText()}</div>
        </div>
        <Popup className={this.classes.menu} hidden={!this.state.menuShown} onClose={() => {
          this.setState({
            menuShown: false
          });
        }}>
          {/* <div className={ this.classes.menu } hidden={ !this.state.menuShown } > */}
          {this.props.showJourneys ?
            <div className={this.classes.menuItem} onClick={this.props.showJourneys}>
              View Journeys
            </div>
            : null}
          {this.props.automaticIndicators ?
            <div className={this.classes.menuItem} onClick={this.props.showDataValidation}>
              Data Validation
            </div>
            : null}
          {this.props.showAutomaticPopup ?
            <div className={this.classes.menuItem} onClick={() => {
              this.selectState('auto');
              this.props.showAutomaticPopup();
            }}>
              Automatic
            </div>
            : null}
          <div className={this.classes.menuItem}
               style={{fontWeight: this.props.defaultStatus && this.props.defaultStatus > 0 ? 'bold' : '600'}}
               onClick={() => {
                 this.selectState('manual');
                 this.setState({
                   statusPopupHidden: false
                 });

                 setTimeout(() => {
                   this.refs.statusText.focus();
                 }, 1);
               }}>
            {this.props.defaultStatus && this.props.defaultStatus > 0 ? 'Edit' : 'Manual'}
          </div>
          {this.props.isFunnel ?
            <div className={this.classes.menuItem} onClick={() => {
              this.selectState('irrelevant');
              this.props.updateIndicator(this.props.name, -2);

            }}>
              Irrelevant
            </div>
            : null}
          <div className={this.classes.menuItem} onClick={() => {
            this.selectState('inactive');
            this.props.updateIndicator(this.props.name, 0);

          }}>
            Inactive
          </div>
        </Popup>
      </div>

      <Popup
        className={this.classes.statusPopup}
        hidden={this.state.statusPopupHidden}
        onClose={() => {
          this.setState({
            statusPopupHidden: true
          });
        }}>
        <div className={this.classes.statusPopupRow}>
          <div className={this.classes.statusPopupTitle}>
            Indicator current status
          </div>
        </div>
        <div className={this.classes.statusPopupRow}>
          <Textfield
            defaultValue={this.props.defaultStatus && this.props.defaultStatus > 0 ? this.props.defaultStatus : ''}
            onChange={() => {
            }} ref="statusText"/>
        </div>
        <div className={this.classes.statusPopupRow}>
          <div className={this.classes.statusButtons}>
            <Button type="secondary" style={{
              paddingLeft: '0'
            }} onClick={() => {
              this.setState({
                statusPopupHidden: true
              });
            }}>Cancel</Button>
            <Button type="primary" style={{
              width: '80px',
              textTransform: 'uppercase'
            }} onClick={this.useStatus}>Save</Button>
          </div>
        </div>
      </Popup>
      {tooltip}
    </div>;
  }
}

class ProgressCircle extends Component {
  style = style;

  static defaultProps = {
    progress: 0
  };

  _RADIUS = 47;
  _FULL_CIRCLE = this._RADIUS * Math.PI * 2;

  getOffset() {
    let offset = this.props.progress;
    offset = Math.min(Math.max(offset, 0), 100);

    const circle = Math.PI * 2 * (offset / 100 + 1) * this._RADIUS;
    return -circle;
  }

  render() {
    return <div className={this.classes.progressBox}>
      <svg className={this.classes.progressSvg} viewBox="0 0 100 100">
        <circle r={this._RADIUS} cx="50" cy="50"
                className={this.classes.progressCircleBack}
                fill="transparent"
                strokeDasharray={this._FULL_CIRCLE}
                strokeDashoffset={0}
        ></circle>
        <circle r={this._RADIUS} cx="50" cy="50"
                className={this.classes.progressCircle}
                fill="transparent"
                strokeDasharray={this._FULL_CIRCLE}
                strokeDashoffset={this.getOffset()}
        ></circle>

        {/*<path d="M3,50a47,47 0 1,0 94,0a47,47 0 1,0 -94,0"
         className={ this.classes.progressCircle }
         fill="transparent"
         strokeDasharray={ this._FULL_CIRCLE }
         strokeDashoffset={ this.getOffset() }
         />*/}
      </svg>
    </div>;
  }
}
