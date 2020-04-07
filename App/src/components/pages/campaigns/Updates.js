import React from 'react';
import Component from 'components/Component';
import Comment from 'components/pages/campaigns/Comment';
import {getProfileSync} from 'components/utils/AuthService';
import CommentTextArea from 'components/pages/campaigns/CommentTextArea';
import style from 'styles/campaigns/updates.css';
import {getMemberFullName} from 'components/utils/teamMembers';

export default class Updates extends Component {

  style = style;

  constructor(props) {
    super(props);
    this.state = {
      ...props,
      comment: ''
    };
  };

  componentDidMount() {
    this.setState({userId: getProfileSync().user_id});
  }

  getMembersNames() {
    return this.props.teamMembers.map(member => {
      return {display: getMemberFullName(member), id: member.userId};
    });
  }

  addComment(comment) {
    if (comment) {
      let update = Object.assign({}, this.props.campaign);
      update.comments.push({user: this.state.userId, comment: comment, time: new Date()});
      this.props.updateState({campaign: update, unsaved: false});
      this.props.updateCampaign(update);
    }
  }

  editComment(comment, index) {
    if (comment) {
      let update = Object.assign({}, this.props.campaign);
      update.comments[index].comment = comment;
      update.comments[index].time = new Date();
      this.props.updateState({campaign: update, unsaved: false});
      this.props.updateCampaign(update);
    }
  }

  deleteComment(index) {
    let update = Object.assign({}, this.props.campaign);
    update.comments.splice(index, 1);
    this.props.updateState({campaign: update, unsaved: false});
    this.props.updateCampaign(update);
  }

  render() {
    const users = this.getMembersNames();
    const comments = this.props.campaign.comments
      .sort((a, b) => {
        return new Date(b.time) - new Date(a.time);
      })
      .map((comment, index) => {
        const member = this.props.teamMembers.find(member => member.userId === this.state.userId);
        return <Comment
          key={index}
          comment={comment.comment}
          time={comment.time}
          index={index}
          editComment={this.editComment.bind(this)}
          deleteComment={this.deleteComment.bind(this, index)}
          users={users}
          member={member}
          campaignIndex={this.props.campaign.index}
          addNotification={this.props.addNotification}
          campaignName={this.props.campaign.name}
        />;
      });
    return <div>
      <CommentTextArea
        addOrEditComment={this.addComment.bind(this)}
        users={users}
        addNotification={this.props.addNotification}
        userId={this.state.userId}
        campaignName={this.props.campaign.name}
        index={this.props.campaign.index}
      />
      {comments.length > 0 ?
        <div>
          <div className={this.classes.line}/>
          {comments}
        </div>
        :
        <div className={this.classes.noComments}>
          No updates yet...
        </div>
      }
    </div>;
  }
}