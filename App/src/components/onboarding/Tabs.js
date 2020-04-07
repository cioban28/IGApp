import React from 'react';
import PropTypes from 'prop-types';
import Component from 'components/Component';
import names from 'classnames';

import style from 'styles/onboarding/audience-tabs.css';

export default class Tabs extends Component {
  static propTypes = {
    children: PropTypes.func
  };

  static defaultProps = {
    defaultSelected: 0
  };

  style = style
  state = {
    tabs: []
  }

  _uid = 0

  constructor(props) {
    super(props);

    if (this.props.defaultTabs) {
      this.props.defaultTabs.forEach((name) => {
        this.generateTab({ name });
      });
    }

    this._selectTab(this.props.defaultSelected);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.defaultTabs && nextProps.defaultTabs.length > 0 && nextProps.defaultTabs.length !== this.props.defaultTabs.length) {
      this.setState({tabs: []}, ()=> {
        nextProps.defaultTabs.forEach((name) => {
          this.generateTab({ name });
        });
        this.selectTab(this.state.selectedIndex);
      });
    }
  }

  generateTab({ name } = {}) {
    const tabs = this.state.tabs;
    const index = tabs.length;

    if (!name) {
      name = this.props.defaultTabName || this.props.getTabName(index);
    }

    tabs.push({
      key: this._uid++,
      name: name
    });
  }

  selectTab(index) {
    this._selectTab(index);
    this.forceUpdate();
  }

  _selectTab(index) {
    const tab = this.state.tabs[index];
    if (tab.selected) return

    const selected = this.state.selectedTab;

    if (selected) {
      selected.selected = false;
    }

    tab.selected = true;
    this.state.selectedTab = tab;
    this.state.selectedIndex = index;
  }

  setTabName = (index, name) => {
    const tab = this.state.tabs[index];

    if (tab && tab.name !== name) {
      tab.name = name + '';
      this.forceUpdate();
    }
  }

  render() {
    const renderContent = this.props.children;
    const tabs = this.state.tabs.map((tab, i) => {
      const className = tab.selected ?
        this.classes.tabSelected : this.classes.tab;

      return <div className={ className } key={ tab.key } onClick={() => {
        this.selectTab(i);
      }}>
        { tab.name }
      </div>
    });

    const content = this.state.tabs.map((tab, i) => {
      return <div
        className={ this.classes.content }
        key={ tab.key }
        style={ tab.selected ? null : {
          display: 'none'
        }}
      >
        { /*tab.component*/ }
        { this.props.children({
          name: tab.name,
          index: i
        }) }
      </div>
    });

    return <div className={ this.classes.box }>
      <div className={ this.classes.tabs }>
        { tabs }
      </div>
      <div className={ this.classes.contentBox }>
        { content }
      </div>
    </div>
  }
}