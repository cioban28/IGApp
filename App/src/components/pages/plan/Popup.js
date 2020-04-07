import React from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import Component from 'components/Component';
import Button from 'components/controls/Button';
import _Popup from 'components/Popup';
import Tooltip from 'components/controls/Tooltip';
import style from 'styles/plan/popup.css';

export default class Popup extends Component {
  style = style;

  static defaultProps = {
      onClose: () => {}
  };

  static propTypes = {
    title: PropTypes.string,
    titleTooltip: PropTypes.string,
    className: PropTypes.string,
    onClose: PropTypes.func,
    primaryButton: PropTypes.shape({
      text: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired
    }),
    secondaryButton: PropTypes.shape({
      text: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired
    })
  };

  constructor(props) {
    super(props);

    this.state = {
      visible: this.props.defaultVisible || false
    };
  }

  open = () => {
    this.setState({
      visible: true
    });
  };

  close = () => {
    this.setState({
      visible: false
    });
  };

  onClose = () => {
      const { onClose } = this.props;

      onClose();
      this.close();
  };

  render() {
    const {
      title,
      titleTooltip,
      className,
      primaryButton,
      secondaryButton,
      children,
      ...popupProps
    } = this.props;

    return (
      <_Popup
        {...popupProps}
        onClose={null}
        className={classnames(this.classes.planPopup, className)}
        hidden={!this.state.visible}
      >
        <div className={this.classes.header}>
          <div className={this.classes.title}>
            {titleTooltip ? (
              <Tooltip
                tip={titleTooltip}
                id='plan-popup-tooltip'
                place='top'
                style={{
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                {title} <span className={this.classes.tooltipIcon}/>
              </Tooltip>
            ) : title}
          </div>
          <div
            className={this.classes.close}
            role='button'
            onClick={this.onClose}
            hidden={this.props.hideClose}
          />
        </div>
        <div hidden={!this.props.hideClose}>
          <Button
            className={ this.classes.hide }
            type='secondary'
            role='button'
            onClick={this.onClose}
          >
            Hide
          </Button>
        </div>
        <div className={this.classes.content}>
          {children}
        </div>
        {(primaryButton || secondaryButton) && (
          <div className={this.classes.footer}>
            {secondaryButton && 
              <button
                type='button'
                className={this.classes.secondaryButton}
                onClick={secondaryButton.onClick}
              >
                {secondaryButton.text}
              </button>
            }
            {primaryButton && 
              <button
                type='button'
                className={this.classes.primaryButton}
                onClick={primaryButton.onClick}
              >
                {primaryButton.text}
              </button>
            }
          </div>
        )}
      </_Popup>
    );
  }
}

export class TextContent extends Component {
  style = style;

  render() {
    return <div className={this.classes.textContent}>
      {this.props.children}
    </div>
  }
}
