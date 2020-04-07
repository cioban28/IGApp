import React from 'react';
import Component from 'components/Component';
import Page from 'components/Page';
import style from 'styles/plan/plan.css';
import pageStyle from 'styles/page.css';

export default class Channels extends Component {

  style = style;
  styles = [pageStyle];

  constructor(props) {
    super(props);
    this.state = {
      selectedTab: 0
    };
  }

  selectTab(index) {
    this.setState({
      selectedTab: index
    });
  }

  getNewCondition = () => {
    return {
      param: '',
      operation: '',
      value: ''
    };
  };

  addRule = (channel, conditions = [this.getNewCondition()], callback) => {
    const {attributionMappingRules} = this.props;
    attributionMappingRules.push({
      conditions,
      channel
    });
    this.props.updateState({attributionMappingRules}, callback);
  };

  render() {
    const childrenWithProps = React.Children.map(this.props.children,
      (child) => React.cloneElement(child, {
        ...this.props,
        addRule: this.addRule,
        getNewCondition: this.getNewCondition
      }));

    return <div>
      <Page width="100%">
        <div className={pageStyle.locals.container}>
          <div className={pageStyle.locals.contentHead}>
            <div className={pageStyle.locals.contentHeadTitle}>Channels</div>
          </div>
          <div>
            {childrenWithProps}
          </div>
        </div>
      </Page>
    </div>;
  }
}