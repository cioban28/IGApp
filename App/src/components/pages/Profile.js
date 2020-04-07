import React from 'react';
import Component from 'components/Component';
import Page from 'components/Page';
import style from 'styles/plan/plan.css';

export default class Profile extends Component {

  style = style;

  render() {
    const {children, ...otherProps} = this.props;
    const childrenWithProps = React.Children.map(children,
      (child) => React.cloneElement(child, otherProps));

    return <div>
      <Page contentClassName={this.classes.content}
            innerClassName={this.classes.pageInner}
            className={this.classes.static}
            width="100%">
        <div className={this.classes.head}>
          <div className={this.classes.headTitle}>Profile</div>
        </div>
        <div className={this.classes.wrap}>
          {childrenWithProps}
        </div>
      </Page>
    </div>;
  }
}