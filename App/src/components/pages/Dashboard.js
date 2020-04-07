import React from 'react';
import Component from 'components/Component';
import Page from 'components/Page';
import style from 'styles/page.css';

export default class Dashboard extends Component {

  style = style;

  render() {
    const childrenWithProps = React.Children.map(this.props.children,
      (child) => React.cloneElement(child, this.props)
    );

    return <div>
      <Page width="100%">
        <div className={this.classes.container}>
          <div className={this.classes.contentHead}>
            <div className={this.classes.contentHeadTitle}>
              Dashboard
            </div>
          </div>
          {childrenWithProps}
        </div>
      </Page>
    </div>;
  }
}