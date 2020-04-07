import React from 'react';
import Component from 'components/Component';
import style from 'styles/profile/product-launch-popup.css';
import Button from 'components/controls/Button';
import Textfield from 'components/controls/Textfield';
import { getNickname, getMetadata, getChannelsWithProps } from 'components/utils/channels';
import Label from 'components/ControlsLabel';
import Select from 'components/controls/Select';

export default class EditChannelNamePopup extends Component {
  style = style;

  static defaultProps = {
    channel: ''
  };

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      category: ''
    };
  }

  componentWillReceiveProps(nextProps) {
    if ((nextProps.channel !== this.props.channel) && nextProps.channel) {
      this.setState({
        name: getNickname(nextProps.channel),
        category: getMetadata('category', nextProps.channel)
      });
    }
  }

  handleChangeCategory(event) {
    const category = event.value;
    this.setState({
      category: category
    })
  }

  render() {
    const $ = this.classes;
    let style;

    if (this.props.hidden) {
      style = { display: 'none' };
    }
    const channelsWithProps = getChannelsWithProps();
    const categories = Object.keys(channelsWithProps)
      .map(item => channelsWithProps[item].category);
    const uniqCategories = categories
      .filter((item, index, array) => array.indexOf(item) === index)
      .map(item => { return {label: item, value: item} });

    return <div className={ $.box } style={ style }>
      <div className={ $.choose }>
        Define how you like to see this channel
      </div>

      <div className={ $.choose }>
        <Label style={{width: '100px', marginTop: '8px', marginRight: '20px' }}>Name</Label>
        <Textfield
          value={ this.state.name }
          onChange={ (e)=> {this.setState({name: e.target.value})} }
          style={{ width: '230px' }}
        />
      </div>
      <div className={ $.choose }>
        <Label style={{width: '100px', marginTop: '8px', marginRight: '20px' }}>Category</Label>
        <Select
          style={{ width: '230px' }}
          selected={ this.state.category }
          select={{
            options: uniqCategories
          }}
          onChange={ this.handleChangeCategory.bind(this) }
        />
      </div>
      <div className={ $.nav }>
        <Button type="secondary" style={{
          width: '100px',
          marginRight: '20px'
        }} onClick={ this.props.onBack }>
          Cancel
        </Button>
        <Button type="primary" style={{
          width: '100px'
        }} onClick={ ()=> {this.props.onNext(this.state.name, this.state.category, this.props.channel) }}>
          Save
        </Button>
      </div>
    </div>
  }
}