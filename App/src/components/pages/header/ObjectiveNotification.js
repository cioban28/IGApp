import React from 'react';
import Component from 'components/Component';
import style from 'styles/header/notifications.css';
import objectiveStyle from'styles/header/objective-notification.css';
import { getNickname } from 'components/utils/indicators';
import history from 'history';
import icons from 'styles/icons/indicators.css';

export default class ObjectiveNotification extends Component {

  style = style;
  styles = [objectiveStyle, icons];

  render() {
    return <div className={ this.classes.inner } data-unread={this.props.isRead ? null : true} onClick={ () => { history.push('/profile/preferences') } }>
      <div>
        <div className={ this.classes.picture } data-icon={ 'indicator:' + this.props.notification.indicator }/>
        <div className={objectiveStyle.locals.objectiveIcon} data-fail={ this.props.notification.isSuccess ? null : true }/>
      </div>
      <div className={ this.classes.textWrap }>
        <div className={ objectiveStyle.locals.textColor } style={{color: this.props.notification.isSuccess ? '#24b10e' : '#c62b36'}}>
          {this.props.notification.isSuccess ? "Objective has been reached!" : "Objective hasn't been reached!"}
        </div>
        <div className={ objectiveStyle.locals.textBold }>
          {getNickname(this.props.notification.indicator)}
        </div>
        <div className={ objectiveStyle.locals.text }>
          is now
        </div>
        <div className={ objectiveStyle.locals.textColor } style={{color: this.props.notification.isSuccess ? '#24b10e' : '#c62b36'}}>
          {this.props.notification.value || 0}
        </div>
        <div className={ objectiveStyle.locals.text }>
          {this.props.notification.isSuccess ? "as planned. " : ", " + (this.props.notification.target - (this.props.notification.value || 0)) + " less than planned."}
        </div>
        <div className={ objectiveStyle.locals.text }>
          Go to
        </div>
        <div className={ objectiveStyle.locals.textBold }>
          Preferences
        </div>
        <div className={ objectiveStyle.locals.text }>
          and define new objectives
        </div>
        <div className={ this.classes.time }>
          {this.props.timeSince}
        </div>
      </div>
    </div>
  }
}