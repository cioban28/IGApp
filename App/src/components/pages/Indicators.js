import React from 'react';
import {inject, observer} from 'mobx-react';
import Component from 'components/Component';
import ProfileProgress from 'components/pages/profile/Progress';
import BackButton from 'components/pages/profile/BackButton';
import NextButton from 'components/pages/profile/NextButton';
import Item from 'components/pages/indicators/Item';
import style from 'styles/onboarding/onboarding.css';
import indiStyle from 'styles/indicators/indicators.css';
import {isPopupMode} from 'modules/popup-mode';
import history from 'history';
import FacebookAutomaticPopup from 'components/pages/indicators/FacebookAutomaticPopup';
import CRMPopup from 'components/pages/indicators/CRMPopup';
import AnalyticsPopup from 'components/pages/indicators/AnalyticsPopup';
import FinancePopup from 'components/pages/indicators/FinancePopup';
import SocialPopup from 'components/pages/indicators/SocialPopup';
import TwitterAutomaticPopup from 'components/pages/indicators/TwitterAutomaticPopup';
import {getIndicatorsWithProps} from 'components/utils/indicators';
import MozAutomaticPopup from './indicators/MozAutomaticPopup';
import YoutubeAutomaticPopup from 'components/pages/indicators/YoutubeAutomaticPopup';
import {makeCustomFieldsFilter} from 'components/utils/filters/make';
import {VARIANTS} from 'components/utils/filters';
import {compose} from 'components/utils/utils';
import {get} from 'lodash';
import DataValidationPopup from 'components/pages/indicators/DataValidationPopup';

const enhance = compose(
  inject(({
            analyze: {journeysStore: {navigateWithFilters}}
          }) => ({
    navigateWithFilters
  })),
  observer
);

class Indicators extends Component {

  style = style;
  styles = [indiStyle];

  static defaultProps = {
    actualIndicators: {},
    userAccount: {}
  };

  constructor(props) {
    super(props);
    this.state = {
      loading: false
    };
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(name, value) {
    let update = Object.assign({}, this.props.actualIndicators);
    value = parseInt(value);
    if (!isNaN(value)) {
      update[name] = value;
      this.props.updateUserMonthPlan({actualIndicators: update}, this.props.region, this.props.planDate);
    }
  }

  showFacebookPopup() {
    this.setState({showFacebookPopup: true});
  }

  showCRMPopup() {
    this.setState({showCRMPopup: true});
  }

  showDataValidationPopup = currentIndicator => {
    this.setState({
      currentIndicator,
      showDataValidationPopup: true,
      currentIndicatorMapped: this.getIndicatorMapping(currentIndicator)
    });
  };

  showAnalyticsPopup() {
    this.setState({showAnalyticsPopup: true});
  }

  showFinancePopup() {
    this.setState({showFinancePopup: true});
  }

  showSocialPopup() {
    this.setState({showSocialPopup: true});
  }

  showTwitterPopup() {
    this.setState({showTwitterPopup: true});
  }

  showMozPopup() {
    this.setState({showMozPopup: true});
  }

  showYoutubePopup() {
    this.setState({showYoutubePopup: true});
  }

  isFunnelAuto(indicator) {
    if (this.props.calculatedData.integrations.isHubspotAuto && this.props.hubspotapi.mapping[indicator]) {
      return 'provider:hubspot';
    }
    if (this.props.calculatedData.integrations.isSalesforceAuto && this.props.salesforceapi.mapping[indicator]) {
      return 'provider:salesforce';
    }
    return false;
  }

  isSheetAuto(indicator) {
    return this.props.calculatedData.integrations.isGoogleSheetsAuto && this.props.googlesheetsapi.mapping[indicator];
  }

  isFinanceAuto(indicator) {
    if (this.isSheetAuto(indicator)) {
      return 'provider:sheets';
    }
    if (this.props.calculatedData.integrations.isStripeAuto) {
      return 'provider:stripe';
    }
    return false;
  }

  isMrrAuto = () => {
    return this.isFinanceAuto('MRR') || (this.props.salesforceapi && this.props.salesforceapi.isMRRAuto);
  };

  isBlogAuto() {
    return this.props.googleapi && this.props.googleapi.blogProfileId;
  }

  updateState = (newState) => {
    this.setState(newState);
  };

  newFunnelShowJourneys = funnelStage => {
    const {navigateWithFilters, CRMConfig} = this.props;

    navigateWithFilters(funnelStage,
      get(CRMConfig, 'audiencesFilters', [])
        .map(({value, field}) => makeCustomFieldsFilter(field, VARIANTS.INCLUDE_ANY_OF, [value])));
  };

  getIndicatorsLastUpdateTime(indicator) {
    const salesforceData = get(this.props.userMonthPlan, ['salesforceapi', 'mapping', indicator]);
    const hubspotData = get(this.props.userMonthPlan, ['hubspotapi', 'mapping', indicator]);
    if (!salesforceData && !hubspotData) {
      return null;
    }
    if (salesforceData && !hubspotData) {
      return get(this.props.userMonthPlan, 'salesforceapi.lastUpdateTime');
    }
    else {
      return get(this.props.userMonthPlan, 'hubspotapi.lastUpdateTime');
    }
  }

  getIndicatorMapping = currentIndicator => {
    switch (currentIndicator) {
      case 'MCL':
      case 'newMCL':
        return 'MCL';
      case 'MQL':
      case 'newMQL':
      case 'leadToMQLVelocity':
      case 'leadToMQLConversionRate':
        return 'MQL';
      case 'SQL':
      case 'newSQL':
      case 'MQLToSQLVelocity':
      case 'MQLToSQLConversionRate':
        return 'SQL';
      case 'opps':
      case 'newOpps':
      case 'SQLToOppVelocity':
      case 'SQLToOppConversionRate':
        return 'opps';
      case 'users':
      case 'newUsers':
      case 'leadToAccountConversionRate':
      case 'OppToAccountConversionRate':
      case 'oppToAccountVelocity':
      case 'averageSalesCycle':
        return 'users';
      default:
        return currentIndicator;
    }
  };

  getBlogSubscriberGroupByValue = () => {
    const crm = this.isFunnelAuto('blogSubscribers').includes('salesforce') ? 'salesforceapi' : 'hubspotapi';
    return get(this.props.userMonthPlan, [crm, 'mapping', 'blogSubscribers']);
  };

  render() {
    const {actualIndicators, groupByMapping, calculatedData: {integrations: {isFacebookAuto, isTwitterAuto, isLinkedinAuto, isYoutubeAuto, isMozAuto, isGoogleAuto}}} = this.props;
    const isAuto = {
      MRR: this.isMrrAuto(),
      ARR: this.isMrrAuto(),
      blogVisits: this.isBlogAuto(),
      MCL: this.isFunnelAuto('MCL'),
      MQL: this.isFunnelAuto('MQL'),
      SQL: this.isFunnelAuto('SQL'),
      opps: this.isFunnelAuto('opps'),
      users: this.isFunnelAuto('users'),
      LTV: this.isFinanceAuto('LTV') || this.isFunnelAuto('LTV'),
      CAC: this.isSheetAuto('CAC') || (this.props.salesforceapi && this.props.salesforceapi.isCACAuto),
      blogSubscribers: this.isFunnelAuto('blogSubscribers'),
      churnRate: this.isFinanceAuto('churnRate') || this.isFunnelAuto('churnRate'),
      ARPA: this.isFinanceAuto('ARPA') || this.isFunnelAuto('ARPA')
    };
    const indicatorsSpecialProp = {
      facebookLikes: {
        showAutomaticPopup: this.showFacebookPopup.bind(this),
        automaticIndicators: isFacebookAuto,
        lastUpdateTime: isFacebookAuto ? get(this.props.userMonthPlan, 'facebookapi.lastUpdateTime') : null
      },
      facebookEngagement: {
        showAutomaticPopup: this.showFacebookPopup.bind(this),
        automaticIndicators: isFacebookAuto,
        lastUpdateTime: isFacebookAuto ? get(this.props.userMonthPlan, 'facebookapi.lastUpdateTime') : null
      },
      twitterFollowers: {
        showAutomaticPopup: this.showTwitterPopup.bind(this),
        automaticIndicators: isTwitterAuto,
        lastUpdateTime: isTwitterAuto ? get(this.props.userMonthPlan, 'twitterapi.lastUpdateTime') : null
      },
      twitterEngagement: {
        showAutomaticPopup: this.showTwitterPopup.bind(this),
        automaticIndicators: isTwitterAuto,
        lastUpdateTime: isTwitterAuto ? get(this.props.userMonthPlan, 'twitterapi.lastUpdateTime') : null
      },
      linkedinFollowers: {
        showAutomaticPopup: this.showSocialPopup.bind(this),
        automaticIndicators: isLinkedinAuto,
        lastUpdateTime: isLinkedinAuto ? get(this.props.userMonthPlan, 'linkedinapi.lastUpdateTime') : null
      },
      linkedinEngagement: {
        showAutomaticPopup: this.showSocialPopup.bind(this),
        automaticIndicators: isLinkedinAuto,
        lastUpdateTime: isLinkedinAuto ? get(this.props.userMonthPlan, 'linkedinapi.lastUpdateTime') : null
      },
      youtubeSubscribers: {
        showAutomaticPopup: this.showYoutubePopup.bind(this),
        automaticIndicators: isYoutubeAuto,
        lastUpdateTime: isYoutubeAuto ? get(this.props.userMonthPlan, 'youtubeapi.lastUpdateTime') : null
      },
      youtubeEngagement: {
        showAutomaticPopup: this.showYoutubePopup.bind(this),
        automaticIndicators: isYoutubeAuto,
        lastUpdateTime: isYoutubeAuto ? get(this.props.userMonthPlan, 'youtubeapi.lastUpdateTime') : null
      },
      MCL: {
        showAutomaticPopup: this.showCRMPopup.bind(this),
        automaticIndicators: isAuto.MCL,
        lastUpdateTime: isAuto.MCL ? this.getIndicatorsLastUpdateTime('MCL') : null,
        isFunnel: true
      },
      MQL: {
        showAutomaticPopup: this.showCRMPopup.bind(this),
        automaticIndicators: isAuto.MQL,
        lastUpdateTime: isAuto.MQL ? this.getIndicatorsLastUpdateTime('MQL') : null,
        isFunnel: true
      },
      SQL: {
        showAutomaticPopup: this.showCRMPopup.bind(this),
        automaticIndicators: isAuto.SQL,
        lastUpdateTime: isAuto.SQL ? this.getIndicatorsLastUpdateTime('SQL') : null,
        isFunnel: true
      },
      opps: {
        showAutomaticPopup: this.showCRMPopup.bind(this),
        automaticIndicators: isAuto.opps,
        lastUpdateTime: isAuto.opps ? this.getIndicatorsLastUpdateTime('opps') : null,
        isFunnel: true
      },
      newMCL: {
        showAutomaticPopup: this.showCRMPopup.bind(this),
        automaticIndicators: isAuto.MCL,
        lastUpdateTime: isAuto.MCL ? this.getIndicatorsLastUpdateTime('MCL') : null,
        isFunnel: true,
        showJourneys: () => this.newFunnelShowJourneys('MCL')
      },
      newMQL: {
        showAutomaticPopup: this.showCRMPopup.bind(this),
        automaticIndicators: isAuto.MQL,
        lastUpdateTime: isAuto.MQL ? this.getIndicatorsLastUpdateTime('MQL') : null,
        isFunnel: true,
        showJourneys: () => this.newFunnelShowJourneys('MQL')
      },
      newSQL: {
        showAutomaticPopup: this.showCRMPopup.bind(this),
        automaticIndicators: isAuto.SQL,
        lastUpdateTime: isAuto.SQL ? this.getIndicatorsLastUpdateTime('SQL') : null,
        isFunnel: true,
        showJourneys: () => this.newFunnelShowJourneys('SQL')
      },
      newOpps: {
        showAutomaticPopup: this.showCRMPopup.bind(this),
        automaticIndicators: isAuto.opps,
        lastUpdateTime: isAuto.opps ? this.getIndicatorsLastUpdateTime('opps') : null,
        isFunnel: true,
        showJourneys: () => this.newFunnelShowJourneys('opps')
      },
      leadToMQLVelocity: {
        showAutomaticPopup: this.showCRMPopup.bind(this),
        automaticIndicators: isAuto.MCL && isAuto.MQL,
        lastUpdateTime: (isAuto.MCL && isAuto.MQL) ? this.getIndicatorsLastUpdateTime('MQL') : null
      },
      MQLToSQLVelocity: {
        showAutomaticPopup: this.showCRMPopup.bind(this),
        automaticIndicators: isAuto.MQL && isAuto.SQL,
        lastUpdateTime: (isAuto.MQL && isAuto.SQL) ? this.getIndicatorsLastUpdateTime('SQL') : null
      },
      SQLToOppVelocity: {
        showAutomaticPopup: this.showCRMPopup.bind(this),
        automaticIndicators: isAuto.SQL && isAuto.opps,
        lastUpdateTime: (isAuto.SQL && isAuto.opps) ? this.getIndicatorsLastUpdateTime('opps') : null
      },
      oppToAccountVelocity: {
        showAutomaticPopup: this.showCRMPopup.bind(this),
        automaticIndicators: isAuto.opps && isAuto.users,
        lastUpdateTime: (isAuto.opps && isAuto.users) ? this.getIndicatorsLastUpdateTime('users') : null
      },
      averageSalesCycle: {
        showAutomaticPopup: this.showCRMPopup.bind(this),
        automaticIndicators: isAuto.MCL && isAuto.users,
        lastUpdateTime: (isAuto.MCL && isAuto.users) ? this.getIndicatorsLastUpdateTime('users') : null
      },
      leadToMQLConversionRate: {
        showAutomaticPopup: this.showCRMPopup.bind(this),
        automaticIndicators: isAuto.MCL && isAuto.MQL,
        lastUpdateTime: (isAuto.MCL && isAuto.MQL) ? this.getIndicatorsLastUpdateTime('MQL') : null
      },
      MQLToSQLConversionRate: {
        showAutomaticPopup: this.showCRMPopup.bind(this),
        automaticIndicators: isAuto.MQL && isAuto.SQL,
        lastUpdateTime: (isAuto.MQL && isAuto.SQL) ? this.getIndicatorsLastUpdateTime('SQL') : null
      },
      SQLToOppConversionRate: {
        showAutomaticPopup: this.showCRMPopup.bind(this),
        automaticIndicators: isAuto.SQL && isAuto.opps,
        lastUpdateTime: (isAuto.SQL && isAuto.opps) ? this.getIndicatorsLastUpdateTime('opps') : null
      },
      OppToAccountConversionRate: {
        showAutomaticPopup: this.showCRMPopup.bind(this),
        automaticIndicators: isAuto.opps && isAuto.users,
        lastUpdateTime: (isAuto.opps && isAuto.users) ? this.getIndicatorsLastUpdateTime('users') : null
      },
      leadToAccountConversionRate: {
        showAutomaticPopup: this.showCRMPopup.bind(this),
        automaticIndicators: isAuto.MCL && isAuto.users,
        lastUpdateTime: (isAuto.MCL && isAuto.users) ? this.getIndicatorsLastUpdateTime('users') : null
      },
      LTV: {
        showAutomaticPopup: this.showFinancePopup.bind(this),
        automaticIndicators: isAuto.LTV,
        lastUpdateTime: isAuto.LTV ? this.getIndicatorsLastUpdateTime('LTV') : null
      },
      CAC: {
        showAutomaticPopup: this.showFinancePopup.bind(this),
        automaticIndicators: isAuto.CAC,
        lastUpdateTime: isAuto.CAC ? this.getIndicatorsLastUpdateTime('CAC') : null
      },
      users: {
        showAutomaticPopup: this.showCRMPopup.bind(this),
        automaticIndicators: isAuto.users,
        lastUpdateTime: isAuto.users ? this.getIndicatorsLastUpdateTime('users') : null
      },
      newUsers: {
        showAutomaticPopup: this.showCRMPopup.bind(this),
        automaticIndicators: isAuto.users,
        lastUpdateTime: isAuto.users ? this.getIndicatorsLastUpdateTime('users') : null,
        showJourneys: () => this.newFunnelShowJourneys('users')
      },
      domainAuthority: {
        showAutomaticPopup: this.showMozPopup.bind(this),
        automaticIndicators: isMozAuto,
        lastUpdateTime: isMozAuto ? get(this.props.userMonthPlan, 'mozapi.lastUpdateTime') : null
      },
      sessions: {
        showAutomaticPopup: this.showAnalyticsPopup.bind(this),
        automaticIndicators: isGoogleAuto,
        lastUpdateTime: isGoogleAuto ? get(this.props.userMonthPlan, 'googleapi.lastUpdateTime') : null
      },
      averageSessionDuration: {
        showAutomaticPopup: this.showAnalyticsPopup.bind(this),
        automaticIndicators: isGoogleAuto,
        lastUpdateTime: isGoogleAuto ? get(this.props.userMonthPlan, 'googleapi.lastUpdateTime') : null
      },
      bounceRate: {
        showAutomaticPopup: this.showAnalyticsPopup.bind(this),
        automaticIndicators: isGoogleAuto,
        lastUpdateTime: isGoogleAuto ? get(this.props.userMonthPlan, 'googleapi.lastUpdateTime') : null
      },
      blogVisits: {
        showAutomaticPopup: this.showAnalyticsPopup.bind(this),
        automaticIndicators: isAuto.blogVisits,
        lastUpdateTime: isAuto.blogVisits ? get(this.props.userMonthPlan, 'googleapi.blogLastUpdateTime') : null
      },
      blogSubscribers: {
        automaticIndicators: isAuto.blogSubscribers,
        lastUpdateTime: isAuto.blogSubscribers ? get(this.props.userMonthPlan, 'hubspotapi.lastUpdateTime') : null
      },
      MRR: {
        showAutomaticPopup: this.showFinancePopup.bind(this),
        automaticIndicators: isAuto.MRR,
        lastUpdateTime: isAuto.MRR ? this.getIndicatorsLastUpdateTime('MRR') : null
      },
      ARR: {
        showAutomaticPopup: this.showFinancePopup.bind(this),
        automaticIndicators: isAuto.ARR,
        lastUpdateTime: isAuto.ARR ? this.getIndicatorsLastUpdateTime('users') : null
      },
      churnRate: {
        showAutomaticPopup: this.showFinancePopup.bind(this),
        automaticIndicators: isAuto.churnRate,
        lastUpdateTime: isAuto.churnRate ? this.getIndicatorsLastUpdateTime('churnRate') : null
      },
      ARPA: {
        showAutomaticPopup: this.showFinancePopup.bind(this),
        automaticIndicators: isAuto.ARPA,
        lastUpdateTime: isAuto.ARPA ? this.getIndicatorsLastUpdateTime('ARPA') : null
      },
      newBookings: {
        showAutomaticPopup: this.showCRMPopup.bind(this),
        automaticIndicators: isAuto.users,
        lastUpdateTime: isAuto.users ? this.getIndicatorsLastUpdateTime('users') : null
      },
      newPipeline: {
        showAutomaticPopup: this.showCRMPopup.bind(this),
        automaticIndicators: isAuto.opps,
        lastUpdateTime: isAuto.opps ? this.getIndicatorsLastUpdateTime('opps') : null
      }
    };
    let groups = [];
    const properties = getIndicatorsWithProps() || {};
    const indicators = Object.keys(properties);
    indicators.forEach(indicator => {
      if (!groups.includes(properties[indicator].group)) {
        groups.push(properties[indicator].group);
      }
    });
    groups.sort();

    const page = groups.map(group => {
      const groupIndicators = indicators
        .filter(indicator => properties[indicator].group === group)
        .sort((a, b) => properties[a].orderInGroup - properties[b].orderInGroup);
      const indicatorsItems = groupIndicators.map(indicator =>
        <Item
          key={indicator}
          icon={'indicator:' + indicator}
          title={properties[indicator].title}
          name={indicator}
          updateIndicator={this.handleChange}
          defaultStatus={actualIndicators[indicator]}
          maxValue={properties[indicator].range.max}
          isPercentage={properties[indicator].isPercentage}
          description={properties[indicator].description}
          formula={properties[indicator].formula}
          timeframe={properties[indicator].timeframe}
          isDirectionDown={!properties[indicator].isDirectionUp}
          showDataValidation={() => this.showDataValidationPopup(indicator)}
          {...indicatorsSpecialProp[indicator]}
        />
      );
      return <div className={indiStyle.locals.row} key={group}>
        {indicatorsItems}
      </div>;
    });
    return <div className={indiStyle.locals.wrap}>
      <FacebookAutomaticPopup hidden={!this.state.showFacebookPopup} setDataAsState={this.props.setDataAsState}
                              close={() => {
                                this.setState({showFacebookPopup: false});
                              }}/>
      <TwitterAutomaticPopup hidden={!this.state.showTwitterPopup} setDataAsState={this.props.setDataAsState}
                             close={() => {
                               this.setState({showTwitterPopup: false});
                             }}/>
      <MozAutomaticPopup hidden={!this.state.showMozPopup} setDataAsState={this.props.setDataAsState} close={() => {
        this.setState({showMozPopup: false});
      }} defaultUrl={this.props.mozapi ? this.props.mozapi.url : this.props.userAccount.companyWebsite}/>
      <CRMPopup hidden={!this.state.showCRMPopup} close={() => {
        this.setState({showCRMPopup: false});
      }} setDataAsState={this.props.setDataAsState} updateState={this.updateState}
                salesforceapi={this.props.salesforceapi} hubspotapi={this.props.hubspotapi}/>
      <DataValidationPopup hidden={!this.state.showDataValidationPopup}
                           indicator={properties[this.state.currentIndicator] ? properties[this.state.currentIndicator].title : ''}
                           crm={isAuto[this.state.currentIndicatorMapped]}
                           groupedByMapping={this.state.currentIndicator === 'blogSubscribers' ? this.getBlogSubscriberGroupByValue() : get(groupByMapping, [this.state.currentIndicatorMapped])}
                           customFilter={this.props.CRMConfig.audiencesFilters}
                           lastUpdateTime={indicatorsSpecialProp[this.state.currentIndicator] && indicatorsSpecialProp[this.state.currentIndicator].lastUpdateTime}
                           close={() => {
                             this.setState({showDataValidationPopup: false});
                           }}/>
      <AnalyticsPopup hidden={!this.state.showAnalyticsPopup} close={() => {
        this.setState({showAnalyticsPopup: false});
      }} setDataAsState={this.props.setDataAsState} googleapi={this.props.googleapi}/>
      <FinancePopup hidden={!this.state.showFinancePopup} close={() => {
        this.setState({showFinancePopup: false});
      }} setDataAsState={this.props.setDataAsState} googlesheetsapi={this.props.googlesheetsapi}/>
      <SocialPopup hidden={!this.state.showSocialPopup} close={() => {
        this.setState({showSocialPopup: false});
      }} setDataAsState={this.props.setDataAsState}/>
      <YoutubeAutomaticPopup hidden={!this.state.showYoutubePopup} setDataAsState={this.props.setDataAsState}
                             close={() => {
                               this.setState({showYoutubePopup: false});
                             }}/>
      {/*<Loading hidden={ !this.state.loading }/>*/}
      <div className={this.classes.cols}>
        <div className={this.classes.colLeft}>
          {page}
        </div>

        {isPopupMode() ?

          <div className={this.classes.colRight}>
            <div className={this.classes.row}>
              <ProfileProgress progress={76} image={
                require('assets/flower/4.png')
              }
                               text="You rock! Hope you’re starting to get excited about planning the right way"/>
            </div>
            {/**
             <div className={ this.classes.row }>
             <ProfileInsights />
             </div>
             **/}
          </div>

          : null}
      </div>

      {isPopupMode() ?

        <div className={this.classes.footer}>
          <BackButton onClick={() => {
            history.push('/profile/target-audience');
          }}/>
          <div style={{width: '30px'}}/>
          <NextButton onClick={() => {
            history.push('/profile/preferences');
          }}/>
        </div>

        :
        <div style={{paddingBottom: '60px'}}/>
      }
    </div>;
  }
}

export default enhance(Indicators);
