import React from 'react';
import Component from 'components/Component';
import Page from 'components/Page';
import Title from 'components/onboarding/Title';
import Textfield from 'components/controls/Textfield';
import style from 'styles/onboarding/onboarding.css';
import Button from 'components/controls/Button';

export default class AddTemplatePopup extends Component {

  style = style;

  constructor(props) {
    super(props);
    this.state = {
      templateName: props.campaignName ? props.campaignName + ' - template' : ''
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({templateName: nextProps.campaignName ? nextProps.campaignName + ' - template' : ''});
  }

  handleChange(event) {
    this.setState({templateName: event.target.value});
  }

  createNewTemplate() {
    if (this.state.templateName) {
      this.props.createTemplate(this.state.templateName);
    }
  }

  render(){
    return <div hidden={ this.props.hidden }>
      <Page popup={ true } width={'340px'}>
        <Title title="New Template"/>
        <div className={ this.classes.row }>
          <Textfield value={ this.state.templateName } placeHolder="choose a name for the template..." required={ true } onChange={ this.handleChange.bind(this)} ref="name"/>
        </div>
        <div className={ this.classes.footer }>
          <div className={ this.classes.footerLeft }>
            <Button type="secondary" style={{ width: '100px' }} onClick={ this.props.closeAddTemplatePopup }>Cancel</Button>
          </div>
          <div className={ this.classes.footerRight }>
            <Button type="primary" style={{ width: '100px' }} onClick={ this.createNewTemplate.bind(this) }>Create</Button>
          </div>
        </div>
      </Page>
    </div>
  }

}