import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';

import Component from 'components/Component';
import { formatNumber } from 'components/utils/budget';

import style from 'styles/campaigns/card.css';
import Avatar from 'components/Avatar';

class CampaignCard extends Component {
  style = style;

  static propTypes = {
    item: PropTypes.object.isRequired,
    channel: PropTypes.string,
    draggingPreview: PropTypes.bool,
    first: PropTypes.bool,
    last: PropTypes.bool
  };

  static contextTypes = {
    userAccount: PropTypes.object,
    auth: PropTypes.object
  };

  getMember() {
    const { item } = this.props;
    const { userAccount: user = {} } = this.context;

    if (!item.owner) {
      return null;
    }

    if (item.owner === "other") {
      return null;
    }
    else {
      const member = user.teamMembers.find(member => member.userId === item.owner);

      if (!member) {
        return null;
      }

      return member
    }
    return null;
  }

  render() {
    const { item, onClick, draggingPreview, first, last } = this.props;

    return (
      <div className={classnames(this.classes.campaign,{
        [this.classes.draggingPreview]: draggingPreview,
        [this.classes.firstCampaign]: first,
      })} id={item.id} onClick={onClick}>
        <div className={this.classes.campaignName}>{item.name}</div>
        <div className={this.classes.campaignFooter}>
          <span className={this.classes.campaignBudget}>${formatNumber(item.actualSpent || item.budget || 0)}</span>
          <Avatar member={this.getMember()} className={this.classes.initials}/>
        </div>
      </div>
    );
  }
}

export default CampaignCard