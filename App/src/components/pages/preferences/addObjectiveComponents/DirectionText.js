import React from 'react';
import Component from 'components/Component';
import style from 'styles/onboarding/onboarding.css';
import popupStyle from 'styles/welcome/add-member-popup.css';
import navStyle from 'styles/profile/market-fit-popup.css';

export default class DirectionText extends Component {
  style = style;
  styles = [popupStyle, navStyle];

  render() {
    const {directionText} = this.props;

    return (
      <div className={this.classes.text}>
        {`${directionText} By`}
      </div>

    );
  }
}