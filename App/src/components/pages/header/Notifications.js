import React from 'react';

import Component from 'components/Component';
import MentionNotification from 'components/pages/header/MentionNotification';
import ObjectiveNotification from 'components/pages/header/ObjectiveNotification';

import style from 'styles/header/notifications.css';

export default class Notifications extends Component {
    style = style;

    types = {
        objective: ObjectiveNotification,
        mention: MentionNotification,
    };

    timeSince(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        let interval = Math.floor(seconds / 31536000);
        if (interval >= 1) {
            return interval + ' years ago';
        }
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) {
            return interval + ' months ago';
        }
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) {
            return interval + ' days ago';
        }
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) {
            return interval + ' hours ago';
        }
        interval = Math.floor(seconds / 60);
        if (interval >= 1) {
            return interval + ' minutes ago';
        }
        return Math.floor(seconds) + ' seconds ago';
    }

    render() {
        const notifications = this.props.userNotifications
            .reverse()
            .slice(0, 5)
            .map((item, index) =>
                React.createElement(
                    this.types[item.notificationType],
                    {
                        ...item,
                        key: index,
                        timeSince: this.timeSince(new Date(item.timestamp)),
                    },
                ),
            );
        return (
            <div className={this.classes.frame}>
                <div className={this.classes.title}>Notifications</div>
                <div>{notifications}</div>
            </div>
        );
    }
}
