import React from 'react';
import Component from 'components/Component';
import Page from 'components/Page';
import style from 'styles/page-popup.css';

export default class PagePopup extends Component {

  style = style;

  render() {
    const {children, ...otherProps} = this.props;
    return <Page popup={true}
                 innerClassName={this.classes.inner}
                 contentClassName={this.classes.content}
                 {...otherProps}>
      {children}
    </Page>;
  }
}