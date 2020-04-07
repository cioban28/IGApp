import React from 'react';
import Component from 'components/Component';
import {FeatureToggle} from 'react-feature-toggles';
import {Link} from 'react-router';
import global from 'global';
import {getProfileSync} from 'components/utils/AuthService';
import {userPermittedToPage} from 'utils';

import style from 'styles/sidebar.css';
import {getNumberOfDaysBetweenDates} from 'components/utils/date';

export default class Sidebar extends Component {
  style = style;

  constructor(props) {
    super(props);

    this.state = /*global.getState('sidebar') ||*/ {
      open: false,
      subMenu: ''
    };

    global.addEventListener('sidebar:open', this.onOpen);
  }

  static defaultProps = {
    userAccount: {}
  };

  onOpen = () => {
    this.setState({
      open: true
    });
  };

  close = () => {
    this.setState({
      open: false
    });
  };

  closeSubMenu = () => {
    this.setState({subMenu: ''});
  };

  componentWillUpdate(props, state) {
    // global.setState('sidebar', state);
  }

  componentWillUnmount() {
    global.removeEventListener('sidebar:open', this.onOpen);
  }

  isHighlighted(menuPath) {
    const menuSplit = menuPath.split('/');
    const pathSplit = this.props.path.split('/');
    return menuSplit.every((item, index) => item === pathSplit[index]);
  }

  toggleSubMenu(type) {
    if (this.state.subMenu === type) {
      this.setState({subMenu: ''});
    }
    else {
      this.setState({subMenu: type});
    }
  }

  isShowAttributionData() {
    const {userAccount: {startTime}} = this.props;
    const daysToAttributionData = 4 - getNumberOfDaysBetweenDates(new Date(), new Date(startTime));
    return daysToAttributionData <= 0;
  }

  render() {
    const profile = getProfileSync();
    const showAttributionData = this.isShowAttributionData();
    return <div>
      <div className={this.classes.backface}
           onClick={this.close}
           data-open={this.state.open ? true : null}
      />
      <div className={this.classes.box} data-open={this.state.open ? true : null}>
        <div className={this.classes.logo}/>
        <div className={this.classes.menu}>
          <MenuItem icon="sidebar:dashboard" link="/dashboard/CMO" text="Dashboard" onClick={this.closeSubMenu}
                    isHighlighted={this.isHighlighted('/dashboard')}
                    pagePermission='dashboard'
          />
          <FeatureToggle featureName="attribution">
            <MenuItem icon="sidebar:analyze" text="Analyze" link={showAttributionData ? '/analyze/overview' : '/no-analyze-data'}
                      isHighlighted={this.isHighlighted('/analyze')}
                      pagePermission='analyze'
            />
          </FeatureToggle>
          <MenuItem icon="sidebar:plan"
                    text="Plan"
                    link={'/plan/annual'}
                    isHighlighted={this.isHighlighted('/plan')}
                    pagePermission='plan'
          />
          <MenuItem icon="sidebar:campaigns" link="/campaigns/by-status"
                    isHighlighted={this.isHighlighted('/campaigns')} text="Campaigns" onClick={this.closeSubMenu}
                    pagePermission='campaigns'
          />
          <MenuItem icon="sidebar:settings" link="/settings/account" text="Settings" onClick={this.closeSubMenu}
                    style={{position: 'absolute', width: '100%', bottom: '20px'}}
                    isHighlighted={this.isHighlighted('/settings')}/>
        </div>

      </div>
    </div>;
  }
}

const HIGHLITED_SUFFIX = '-selected';

export class MenuItem extends Component {
  style = style;

  constructor(props) {
    super(props);

    this.state = {
      hover: false
    };
  }

  render() {
    const icon = this.props.icon + (this.props.isHighlighted || this.state.hover ? HIGHLITED_SUFFIX : '');
    let className = this.classes.menuItem;

    if (this.props.isHighlighted) {
      className += ' ' + this.classes.menuItemSelected;
    }

    return !this.props.pagePermission || userPermittedToPage(this.props.pagePermission)
      ? <Link to={this.props.link || '/'}
              activeClassName={this.classes.menuItemSelected}
              className={className}
              onClick={this.props.onClick}
              style={this.props.style}
              onMouseEnter={() => this.setState({hover: true})}
              onMouseLeave={() => this.setState({hover: false})}
      >
        <div className={this.classes.menuItemIcon} data-icon={icon}/>
        <div className={this.classes.menuItemText}>
          {this.props.text}
        </div>
      </Link>
      : null;
  }
}