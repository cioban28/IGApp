import React from 'react';
import {Link} from 'react-router';

import Component from 'components/Component';

import style from 'styles/header/settings.css';

export default class Settings extends Component {
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

        return (
            <div className={this.classes.frame}>
                <div className={this.classes.title}>Settings</div>
                
                <div className={this.classes.subMenu}>
                {tabs.map(({name, path, representivePath}) => {
                    return <Link to={path} className={this.classes.subTitle} key={name}>{name}</Link>;
                })}
                </div>
            </div>
        );
    }
}
