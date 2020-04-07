import React from 'react';
import Component from 'components/Component';
import Page from 'components/Page';
import style from 'styles/indicators/crm-popup.css';
import LinkedinAutomaticPopup from 'components/pages/indicators/LinkedinAutomaticPopup';
import CRMStyle from 'styles/indicators/crm-popup.css';

export default class CRMPopup extends Component {

  style = style;
  styles = [CRMStyle];

  render(){
    return <div>
      <div hidden={ this.props.hidden }>
        <LinkedinAutomaticPopup setDataAsState={ this.props.setDataAsState } close={ this.props.close } ref="linkedin"/>
        <Page popup={ true } width={'340px'} style={{ zIndex: '9' }}>
          <div className={ this.classes.close } onClick={ this.props.close }/>
          <div className={ this.classes.inner }>
            <div className={ this.classes.row }>
              <div className={ CRMStyle.locals.linkedin } onClick={ () => { this.refs.linkedin.open() } }/>
            </div>
          </div>
        </Page>
      </div>
    </div>
  }

}