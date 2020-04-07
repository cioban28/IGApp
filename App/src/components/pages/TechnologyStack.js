import React from 'react';
import Component from 'components/Component';
import Page from 'components/Page';
import platformsStyle from 'styles/indicators/platforms.css';
import MarketingApp from 'components/pages/indicators/MarketingApp';
import {isPopupMode} from 'modules/popup-mode';
import BackButton from 'components/pages/profile/BackButton';
import NextButton from 'components/pages/profile/NextButton';
import style from 'styles/onboarding/onboarding.css';
import history from 'history';
import Title from 'components/onboarding/Title';
import SaveButton from 'components/pages/profile/SaveButton';
import Button from 'components/controls/Button';

export default class TechnologyStack extends Component {

  style = style;
  styles = [platformsStyle];

  constructor(props) {
    super(props);

    this.state = {
    };
  }

  componentDidMount() {
    const technologyStack = [...this.props.technologyStack];
    if (!technologyStack.includes('googleSheets')) {
      technologyStack.push('googleSheets');
      this.props.updateState({technologyStack: technologyStack});
    }
    if (!technologyStack.includes('moz')) {
      technologyStack.push('moz');
      this.props.updateState({technologyStack: technologyStack});
    }
  }

  toogleChange(platform) {
    let technologyStack = this.props.technologyStack.slice();
    if (technologyStack.includes(platform)) {
      technologyStack = technologyStack.filter(item => item !== platform);
    }
    else {
      technologyStack.push(platform);
    }
    this.props.updateState({technologyStack: technologyStack});
  }

  isChecked(platform) {
    return this.props.technologyStack.includes(platform);
  }

  render() {
    return <div>
      <Page popup={ true } contentClassName={ platformsStyle.locals.content } width="100%">
        <Title title="Technology Stack"/>
        <div>
          <div className={platformsStyle.locals.title}>
            Choose the marketing tools/platforms in your current stack?
          </div>
          <div>
            <div className={platformsStyle.locals.platformTitle}>
              CRM
            </div>
            <div>
              <MarketingApp onChange={this.toogleChange.bind(this, 'salesforce')} checked={this.isChecked('salesforce')} title="Salesforce" icon="platform:salesforce"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'hubspot')} checked={this.isChecked('hubspot')} title="Hubspot CRM" icon="platform:hubspot"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'pipedrive')} checked={this.isChecked('pipedrive')} title="Pipedrive" icon="platform:pipedrive"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'dynamics')} checked={this.isChecked('dynamics')} title="Microsoft Dynamics" icon="platform:dynamics"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'salesflare')} checked={this.isChecked('salesflare')} title="Salesflare" icon="platform:salesflare"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'zoho')} checked={this.isChecked('zoho')} title="Zoho CRM" icon="platform:zoho"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'closeio')} checked={this.isChecked('closeio')} title="Close.io" icon="platform:closeio"/>
            </div>
          </div>
          <div>
            <div className={platformsStyle.locals.platformTitle}>
              Payment Provider
            </div>
            <div>
              <MarketingApp onChange={this.toogleChange.bind(this, 'stripe')} checked={this.isChecked('stripe')} title="Stripe" icon="platform:stripe"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'paypal')} checked={this.isChecked('paypal')} title="PayPal" icon="platform:paypal"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'braintree')} checked={this.isChecked('braintree')} title="Braintree" icon="platform:braintree"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'square')} checked={this.isChecked('square')} title="Square" icon="platform:square"/>
            </div>
          </div>
          <div>
            <div className={platformsStyle.locals.platformTitle}>
              Web Analytics
            </div>
            <div>
              <MarketingApp onChange={this.toogleChange.bind(this, 'googleAnalytics')} checked={this.isChecked('googleAnalytics')} title="Google Analytics" icon="platform:googleAnalytics"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'kissmetrics')} checked={this.isChecked('kissmetrics')} title="Kissmetrics" icon="platform:kissmetrics"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'mixpanel')} checked={this.isChecked('mixpanel')} title="Mixpanel" icon="platform:mixpanel"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'heap')} checked={this.isChecked('heap')} title="Heap Analytics" icon="platform:heap"/>
            </div>
          </div>
          <div>
            <div className={platformsStyle.locals.platformTitle}>
              Social Media
            </div>
            <div>
              <MarketingApp onChange={this.toogleChange.bind(this, 'facebook')} checked={this.isChecked('facebook')} title="Facebook" icon="platform:facebook"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'linkedin')} checked={this.isChecked('linkedin')} title="LinkedIn" icon="platform:linkedin"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'twitter')} checked={this.isChecked('twitter')} title="Twitter" icon="platform:twitter"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'instagram')} checked={this.isChecked('instagram')} title="Instagram" icon="platform:instagram"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'googlePlus')} checked={this.isChecked('googlePlus')} title="Google+" icon="platform:googlePlus"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'youtube')} checked={this.isChecked('youtube')} title="Youtube" icon="platform:youtube"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'snapchat')} checked={this.isChecked('snapchat')} title="Snapchat" icon="platform:snapchat"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'pinterest')} checked={this.isChecked('pinterest')} title="Pinterest" icon="platform:pinterest"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'reddit')} checked={this.isChecked('reddit')} title="Reddit" icon="platform:reddit"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'quora')} checked={this.isChecked('quora')} title="Quora" icon="platform:quora"/>
            </div>
          </div>
          <div>
            <div className={platformsStyle.locals.platformTitle}>
              Productivity
            </div>
            <div>
              <MarketingApp onChange={this.toogleChange.bind(this, 'trello')} checked={this.isChecked('trello')} title="Trello" icon="platform:trello"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'asana')} checked={this.isChecked('asana')} title="Asana" icon="platform:asana"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'basecamp')} checked={this.isChecked('basecamp')} title="Basecamp" icon="platform:basecamp"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'googleSheets')} disabled={true} checked={this.isChecked('googleSheets')} title="Google Sheets" icon="platform:googleSheets"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'slack')} checked={this.isChecked('slack')} title="Slack" icon="platform:slack"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'workfront')} checked={this.isChecked('workfront')} title="Workfront" icon="platform:workfront"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'wrike')} checked={this.isChecked('wrike')} title="Wrike" icon="platform:wrike"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'monday')} checked={this.isChecked('monday')} title="Monday" icon="platform:monday"/>
            </div>
          </div>
          <div>
            <div className={platformsStyle.locals.platformTitle}>
              SEO
            </div>
            <div>
              <MarketingApp onChange={this.toogleChange.bind(this, 'moz')} disabled={true} checked={this.isChecked('moz')} title="Moz" icon="platform:moz"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'serpstat')} checked={this.isChecked('serpstat')} title="Serpstat" icon="platform:serpstat"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'SERanking')} checked={this.isChecked('SERanking')} title="SE Ranking" icon="platform:SERanking"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'SEMrush')} checked={this.isChecked('SEMrush')} title="SEMrush" icon="platform:SEMrush"/>
            </div>
          </div>
          <div>
            <div className={platformsStyle.locals.platformTitle}>
              ERP
            </div>
            <div>
              <MarketingApp onChange={this.toogleChange.bind(this, 'sageintacct')} checked={this.isChecked('sageintacct')} title="Sage Intacct" icon="platform:sageintacct"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'netsuite')} checked={this.isChecked('netsuite')} title="NetSuite" icon="platform:netsuite"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'oracleERP')} checked={this.isChecked('oracleERP')} title="Oracle ERP" icon="platform:oracleERP"/>
              <MarketingApp onChange={this.toogleChange.bind(this, 'sap')} checked={this.isChecked('sap')} title="SAP" icon="platform:sap"/>
            </div>
          </div>
        </div>

        { isPopupMode() ?

          <div className={ this.classes.footer }>
            <BackButton onClick={ () => {
              history.push('/settings/profile/target-audience');
            } }/>
            <div style={{ width: '30px' }} />
            <NextButton onClick={ () => {
              this.props.updateUserMonthPlan({technologyStack: this.props.technologyStack}, this.props.region, this.props.planDate)
                .then(() => {
                  history.push('/settings/profile/integrations');
                });
            } }/>
          </div>
          :
          <div className={ this.classes.footer }>
            <Button type="secondary" style={{
              width: '128',
              marginRight: 'auto'
            }} onClick={() => {
              history.push('/settings/profile/integrations');
            }}> Cancel
            </Button>
            <SaveButton onClick={() => {
              this.props.updateUserMonthPlan({technologyStack: this.props.technologyStack}, this.props.region, this.props.planDate)
                .then(() => {
                  history.push('/settings/profile/integrations');
                });
            }} success={ this.state.saveSuccess } fail={ this.state.saveFail }/>
          </div>
        }

      </Page>
    </div>
  }
}
