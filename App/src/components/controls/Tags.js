import React from 'react';
import Component from 'components/Component';
import { WithContext as ReactTags } from 'react-tag-input';
import style from 'styles/controls/tags.css';

export default class Tags extends Component {

  style = style;

  handleAddition = (tag) => {
    this.props.handleAddition(tag.text);
  };

  render() {
    const {tags, handleAddition, ...otherProps} = this.props;
    const parsedTags = tags.map(item => {
      return {
        id: item,
        text: item
      };
    });
    return <div>
      <ReactTags {...otherProps}
                 tags={parsedTags}
                 classNames={{
                   tags: this.classes.tags,
                   tagInput: this.classes.tagInput,
                   tagInputField: this.classes.tagInputField,
                   selected: this.classes.selected,
                   tag: this.classes.tag,
                   remove: this.classes.remove,
                   suggestions: this.classes.suggestions,
                   activeSuggestion: this.classes.activeSuggestion
                 }}
                 handleAddition={this.handleAddition}
                 allowDragDrop={false}/>
    </div>;
  }
}