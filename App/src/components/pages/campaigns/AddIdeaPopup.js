import React from 'react';
import Component from 'components/Component';

import Button from 'components/controls/Button';
import Page from 'components/Page';
import Label from 'components/ControlsLabel';
import Textfield from 'components/controls/Textfield';
import Select from 'components/controls/Select';

import style from 'styles/onboarding/onboarding.css';
import popupStyle from 'styles/welcome/add-member-popup.css';
import campaignPopupStyle from 'styles/campaigns/capmaign-popup.css';

export default class AddIdeaPopup extends Component {

  style = style;
  styles = [popupStyle, campaignPopupStyle];

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      description: '',
      goal: ''
    };
  }

  addIdea() {
    this.props.addIdea(this.state);
    this.setState({
      name: '',
      description: '',
      goal: ''
    });
  }

  render() {
    const selects = {
      focus: {
        label: 'Goal',
        select: {
          name: 'focus',
          options: [
            {value: 'Acquisition', label: 'Acquisition'},
            {value: 'Activation', label: 'Activation'},
            {value: 'Retention', label: 'Retention'},
            {value: 'Revenue', label: 'Revenue'},
            {value: 'Referral', label: 'Referral'},
          ]
        }
      }
    };
    return <div hidden={ this.props.hidden }>
      <Page popup={ true } width={'400px'} contentClassName={ popupStyle.locals.content } innerClassName={ popupStyle.locals.inner }>
        <div className={ popupStyle.locals.title }>
          Add Your Campaign Idea
        </div>
        <div className={ this.classes.row }>
          <Label>Name</Label>
          <Textfield
            value={ this.state.name }
            onChange={ (e)=>{ this.setState({name: e.target.value}) } }
          />
        </div>
        <div className={ this.classes.row }>
          <Label>Description</Label>
          <textarea
            value={ this.state.description }
            className={ campaignPopupStyle.locals.textArea }
            onChange={ (e)=>{ this.setState({description: e.target.value}) } }
          />
        </div>
        <div className={ this.classes.row }>
          <Select { ... selects.focus }
                  selected={ this.state.goal }
                  onChange= { (e)=>{ this.setState({goal: e.value}) } }
                  style={{ width: '100%', marginBottom: '14px' }}
          />
        </div>
        <div className={ this.classes.footerCols }>
          <div className={ this.classes.footerLeft }>
            <Button
              type="secondary"
              style={{ width: '72px' }}
              onClick={ this.props.close }>Cancel
            </Button>
            <Button
              type="primary"
              style={{ width: '110px', marginLeft: '20px' }}
              onClick={ this.addIdea.bind(this) }>Add Idea
            </Button>
          </div>
        </div>
      </Page>
    </div>
  }
}