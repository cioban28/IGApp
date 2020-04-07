import React from 'react';
import Component from 'components/Component';
import NavLink from 'components/controls/NavLink';
import style from 'styles/settings/settings-side-bar.css';

export default class SettingsSideBar extends Component {

  style = style;

  render() {
    const tabs = [
      {
        name: 'Account',
        path: '/settings/account',
        representivePath: '/settings/account'
      },
      {
        name: 'Product',
        path: '/settings/profile/product',
        representivePath: '/settings/profile/product'
      },
      {
        name: 'Preferences',
        path: '/settings/profile/preferences',
        representivePath: '/settings/profile/preferences'
      },
      {
        name: 'Target Audience',
        path: '/settings/profile/target-audience',
        representivePath: '/settings/profile/target-audience'
      },
      {
        name: 'Integrations',
        path: '/settings/profile/integrations',
        representivePath: '/settings/profile/integrations'
      },
      {
        name: 'Attribution',
        path: '/settings/attribution/setup',
        representivePath: '/settings/attribution'
      },
      {
        name: 'Channels',
        path: '/settings/channels/channels',
        representivePath: '/settings/channels'
      }
    ];

    return <div className={this.classes.wrapper}>
      <div className={this.classes.sideBarTitle}>Settings</div>
      {
        tabs.map(({name, path, representivePath}) => {
          return <NavLink pathToCheck={representivePath} currentPath={this.props.currentPath} to={path}
                          activeClassName={this.classes.headTabSelected} className={this.classes.headTab} key={name}>
            {name}
          </NavLink>;
        })
      }
    </div>;
  }
}