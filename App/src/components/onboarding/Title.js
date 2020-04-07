import React from 'react';
import Component from 'components/Component';
import { isPopupMode } from 'modules/popup-mode';
import style from 'styles/onboarding/title.css';
import isNil from 'lodash/isNil';

export default class Title extends Component {
  style = style;

  static defaultProps = {
    popup: null
  };

  isPopup = () => {
    if(!isNil(this.props.popup)){
      return this.props.popup;
    }
    else {
      return isPopupMode();
    }
  };

  render() {
    const title = this.props.title;
    let className;

    /*if (title.length > 10) {
      className = this.classes.verticalBox;
    } else {
      className = this.classes.box;
    }*/

    if (this.props.vertical) {
      className = this.classes.verticalBox;
    } else {
      className = this.classes.box;
    }

    if (this.props.className) {
      className += ' ' + this.props.className;
    }

    let subText;

    if (this.props.subTitle && this.isPopup()) {
      subText = <div className={ this.classes.text } style={this.props.subtitleStyle}>{ this.props.subTitle }</div>
    }

    return <div className={ className } style={ this.props.style }>
      <div className={ this.classes.title }>{ title }</div>
      { subText }
    </div>
  }
}