import React from 'react';
import Component from 'components/Component';
import style from 'styles/onboarding/onboarding.css';
import PlannedVsActualstyle from 'styles/plan/planned-actual-tab.css';
import ideasStyle from 'styles/campaigns/ideas.css';
import Button from 'components/controls/Button';
import AddIdeaPopup from 'components/pages/campaigns/AddIdeaPopup';
import commentStyle from 'styles/campaigns/comment.css';
import Avatar from 'components/Avatar';
import {getProfileSync} from 'components/utils/AuthService';
import {formatTimestamp} from 'components/utils/date';
import Table from 'components/controls/Table';

export default class Ideas extends Component {

  style = style;
  styles = [PlannedVsActualstyle, ideasStyle, commentStyle];

  static defaultProps = {
    campaignIdeas: []
  };

  constructor(props) {
    super(props);
    this.state = {
      showAddIdeaPopup: false
    };
    this.addIdea = this.addIdea.bind(this);
  }

  addIdea(idea) {
    let update = this.props.campaignIdeas;
    update.push({
      ...idea,
      date: new Date(),
      owner: getProfileSync().user_id,
      endorsements: []
    });
    this.setState({showAddIdeaPopup: false});
    return this.props.updateUserMonthPlan({campaignIdeas: update}, this.props.region, this.props.planDate);
  }

  addLike(userId, index) {
    let update = this.props.campaignIdeas;
    if (!update[index].endorsements.includes(userId)) {
      update[index].endorsements.push(userId);
    }
    return this.props.updateUserMonthPlan({campaignIdeas: update}, this.props.region, this.props.planDate);
  }

  render() {
    const {campaignIdeas, auth} = this.props;
    const data = campaignIdeas
      .map((idea) => ({
        idea,
        member: this.props.teamMembers.find(member => member.userId === idea.owner),
      }))
      .filter(({ member }) => !!member)

    return (
      <div>
        <Table
          data={data}
          columns={[
            {
              id: 'Owner',
              header: 'Owner',
              cell: ({ member }) => (
                <Avatar member={member} className={commentStyle.locals.initials}/>
              ),
              minWidth: 60,
            },
            {
              id: 'Date',
              header: 'Date',
              cell: ({ idea }) => formatTimestamp(idea.date),
            },
            {
              id: 'IdeaName',
              header: 'Idea Name',
              cell: 'idea.name',
            },
            {
              id: 'IdeaDescription',
              header: 'Idea Description',
              cell: 'idea.description',
            },
            {
              id: 'Goal',
              header: 'Goal',
              cell: 'idea.goal',
            },
            {
              id: 'Endorsements',
              header: 'Endorsements',
              cell: 'idea.endorsements.length',
            },
            {
              id: 'like',
              header: '',
              cell: ({ idea, member }, { index }) => (
                <div
                  className={ideasStyle.locals.like}
                  onClick={() => this.addLike(member.userId, index)}
                  data-disabled={idea.endorsements.includes(member.userId) ? true : null}
                />
              ),
              minWidth: 60,
            },
          ]}
        />
        <div style={{justifyContent: 'center', display: 'flex'}}>
          <Button
            type="primary"
            style={{width: '75px', marginTop: '20px'}}
            onClick={() => {
              this.setState({showAddIdeaPopup: true});
            }}>+Add
          </Button>
        </div>
        <AddIdeaPopup
          hidden={!this.state.showAddIdeaPopup}
          close={() => {
            this.setState({showAddIdeaPopup: false});
          }}
          addIdea={this.addIdea}/>
      </div>
    );
  }
}