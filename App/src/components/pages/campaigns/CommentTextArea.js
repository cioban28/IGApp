import React from 'react';
import Component from 'components/Component';
import Button from 'components/controls/Button';
import style from 'styles/campaigns/comment-text-area.css';
import { MentionsInput, Mention } from 'react-mentions';

export default class CommentTextArea extends Component {

  style=style;
  defaultStyle = {
    suggestions: {
      list: {
        backgroundColor: 'white',
        border: '1px solid rgba(0,0,0,0.15)',
        fontSize: 10,
      },

      item: {
        padding: '5px 15px',
        borderBottom: '1px solid rgba(0,0,0,0.15)',

        '&focused': {
          backgroundColor: '#cee4e5',
        },
      },
    },
  };

  constructor(props) {
    super(props);
    this.state = {
      comment: props.comment
    };
  };

  static defaultProps = {
    comment: ''
  };

  handleChange(event, newValue, newPlainTextValue, mentions) {
    this.setState({comment: newValue, plainComment: newPlainTextValue, mentions: mentions})
  }

  handleKeyPress(e) {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      this.addOrEditComment();
    }
  }

  addOrEditComment() {
    this.state.mentions.forEach((mention) => {
      this.props.addNotification(mention.id, 'mention', {tagger: this.props.userId, campaignName: this.props.campaignName, index: this.props.index, plainComment: this.state.plainComment}, true);
    });
    this.props.addOrEditComment(this.state.plainComment, this.props.index);
    this.setState({comment: '', plainComment: '', mentions: []});
  }

  displayTransform(id, display, type) {
    return '@' + display;
  }

  render() {
    return <div className={ this.classes.wrap } data-big={ (this.state.focus || this.state.comment) ? true : null }>
      <MentionsInput className={ this.classes.addComment }
                     placeholder="Write a comment..."
                     value={ this.state.comment }
                     onChange={ this.handleChange.bind(this) }
                     onKeyPress={ this.handleKeyPress.bind(this) }
                     required
                     onFocus={() => { this.setState({focus: true}) }}
                     onBlur={ ()=>{ this.setState({focus: false}) } }
                     displayTransform={ this.displayTransform.bind(this) }
                     style={ this.defaultStyle }
      >
        <Mention data={this.props.users}/>
      </MentionsInput>
      <div className={ this.classes.post }>
        <Button type="primary" style={{width: '72px'}}
                onClick={ this.addOrEditComment.bind(this) }>POST</Button>
        <div className={ this.classes.shortcut }>
          (shift + enter)
        </div>
      </div>
    </div>
  }
}