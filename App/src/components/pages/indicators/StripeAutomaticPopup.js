import React from 'react';
import Component from 'components/Component';
import style from 'styles/onboarding/onboarding.css';
import CRMStyle from 'styles/indicators/crm-popup.css';
import AuthorizationIntegrationPopup from 'components/common/AuthorizationIntegrationPopup';

export default class StripeAutomaticPopup extends Component {

  style = style;
  styles = [CRMStyle];

  constructor(props) {
    super(props);
  }

  open() {
    this.refs.authPopup.open();
  }

  afterDataRetrieved = (data) => {
    return new Promise((resolve, reject) => {
      this.props.setDataAsState(data);
      resolve(false);
    });
  };

  render() {
    return <div style={{width: '100%'}}>
      <div>
        <AuthorizationIntegrationPopup ref='authPopup'
                                       api='stripeapi'
                                       afterDataRetrieved={this.afterDataRetrieved}
                                       loadingStarted={this.props.loadingStarted}
                                       loadingFinished={this.props.loadingFinished}
                                       affectedIndicators={this.props.affectedIndicators}
                                       actualIndicators={this.props.actualIndicators}
                                       platformTitle='Stripe'
        />
      </div>
    </div>;
  }

}