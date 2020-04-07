import React from 'react';
import Component from 'components/Component';
import Button from 'components/controls/Button';
import Popup from 'components/Popup';
import style from 'styles/welcome/button-with-sure-popup.css';

export default class ButtonWithSurePopup extends Component {
  style = style;

  state = {
    showPopup: false
  };

  onClick() {
    this.props.onClick();
    this.onClose();
  }

  onClose() {
    this.setState({showPopup: false})
  }

  render() {
    return <div className={ this.classes.container }>
      <Popup hidden={ !this.state.showPopup } onClose={ this.onClose.bind(this) } className={ this.classes.popup }>
        <div className={ this.classes.tooltip } onClick={ this.onClick.bind(this) }>
          Sure?
        </div>
      </Popup>
      <Button type="primary" className={ this.classes.button } style={ this.props.style } onClick={ ()=>{ this.setState({showPopup: true}) }}>{this.props.buttonText}</Button>
    </div>
  }
}