import React from 'react';
import Component from 'components/Component';
import Page from 'components/Page';
import style from 'styles/indicators/crm-popup.css';
import GoogleSheetsAutomaticPopup from 'components/pages/indicators/GoogleSheetsAutomaticPopup';
import StripeAutomaticPopup from 'components/pages/indicators/StripeAutomaticPopup';
import CRMStyle from 'styles/indicators/crm-popup.css';

export default class FinancePopup extends Component {

  style = style;
  styles = [CRMStyle];

  render() {
    return <div hidden={this.props.hidden}>
      <StripeAutomaticPopup setDataAsState={this.props.setDataAsState}
                            close={this.props.close}
                            ref="stripe"/>
      <GoogleSheetsAutomaticPopup setDataAsState={this.props.setDataAsState}
                                  close={this.props.close}
                                  data={this.props.googlesheetsapi}
                                  ref="googleSheets"/>
      <Page popup={true} width={'340px'} style={{zIndex: '9'}}>
        <div className={this.classes.close} onClick={this.props.close}/>
        <div className={this.classes.title}>
          Choose source
        </div>
        <div className={this.classes.inner}>
          <div className={this.classes.row}>
            <div className={CRMStyle.locals.googleSheets} onClick={() => {
              this.refs.googleSheets.open();
            }}/>
          </div>
          <div className={this.classes.row}>
            <div className={CRMStyle.locals.stripe} onClick={() => {
              this.refs.stripe.open();
            }}/>
          </div>
        </div>
      </Page>
    </div>;
  }

}