import React from 'react';
import Component from 'components/Component';
import style from 'styles/avatar.css';
import {getMemberFullName} from 'components/utils/teamMembers';

export default class Avatar extends Component {

  style = style;

  static defaultProps = {
    withShadow: false
  };

  getInitials() {
    const member = this.props.member;
    const {firstName = '', lastName = ''} = member;
    return (firstName[0] || '') + (lastName[0] || '');
  }

  hashCode(str) { // java String#hashCode
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
  }

  intToRGB(i) {
    const c = (i & 0x00FFFFFF)
      .toString(16)
      .toUpperCase();

    return '00000'.substring(0, 6 - c.length) + c;
  }

  render() {
    const member = this.props.member;
    let className = (member && member.pictureUrl) ? this.classes.picture : this.classes.initials;

    if (this.props.className) {
      className += ' ' + this.props.className;
    }
    return member ?
      member.pictureUrl ?
        <div className={this.classes.outerDiv}>
          <div className={className}
               style={{backgroundImage: 'url(' + member.pictureUrl + ')'}}>
          </div>
          {this.props.withShadow ?
            <div className={this.classes.shadow} style={{backgroundImage: 'url(' + member.pictureUrl + ')'}}/> : null}
        </div>
        :
        <div className={this.classes.outerDiv}>
          <div className={className}
               style={{backgroundColor: '#' + this.intToRGB(this.hashCode(getMemberFullName(member)))}}>
            {this.getInitials()}
          </div>
          {this.props.withShadow ?
            <div className={this.classes.shadow} style={{backgroundImage: 'url(' + member.pictureUrl + ')'}}/> : null}
        </div>
      : null;
  }
}