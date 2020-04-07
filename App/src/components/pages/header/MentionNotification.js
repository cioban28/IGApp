import React from 'react';
import Component from 'components/Component';
import style from 'styles/header/notifications.css';
import mentionStyle from 'styles/header/mention-notification.css';
import history from 'history';
import Avatar from 'components/Avatar';
import {getMemberFullName} from 'components/utils/teamMembers';

export default class MentionNotification extends Component {

  style = style;
  styles = [mentionStyle];

  render() {
    const member = this.props.teamMembers.find(item => item.userId === this.props.notification.tagger);
    return <div className={this.classes.inner} data-unread={this.props.isRead ? null : true} onClick={() => {
      history.push({
        pathname: '/campaigns/by-channel',
        query: {campaign: this.props.notification.index}
      });
    }}>
      <Avatar member={member} className={this.classes.initials}/>
      <div className={this.classes.textWrap}>
        <div className={mentionStyle.locals.tagger}>
          {getMemberFullName(member)}
        </div>
        <div className={mentionStyle.locals.text}>
          mentioned you on the campaign
        </div>
        <div className={mentionStyle.locals.campaign}>
          {this.props.notification.campaignName}.
        </div>
        <div className={this.classes.time}>
          {this.props.timeSince}
        </div>
      </div>
    </div>;
  }
}