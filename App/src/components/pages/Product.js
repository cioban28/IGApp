import React from 'react';
import Component from 'components/Component';
import Page from 'components/Page';
import Title from 'components/onboarding/Title';
import ProfileProgress from 'components/pages/profile/Progress';
import BackButton from 'components/pages/profile/BackButton';
import NextButton from 'components/pages/profile/NextButton';
import SaveButton from 'components/pages/profile/SaveButton';
import ButtonsSet from 'components/pages/profile/ButtonsSet';
import MultiRow from 'components/MultiRow';
import Select from 'components/controls/Select';
import Toggle from 'components/controls/Toggle';
import Label from 'components/ControlsLabel';
import Textfield from 'components/controls/Textfield';
import style from 'styles/onboarding/onboarding.css';
import preferencesStyle from 'styles/preferences/preferences.css';
import {isPopupMode} from 'modules/popup-mode';
import history from 'history';

export default class Product extends Component {


  style = style;
  styles = [preferencesStyle];
  /*
   state = {
   highlightInsights: false,
   lifeCyclePopup: 'first'
   };
   */
  static defaultProps = {
    userProfile: {},
    pricingTiers: []
  };

  constructor(props) {
    super(props);
    this.state = {};

    this.handleChangeSelect = this.handleChangeSelect.bind(this);
    this.handleChangeButton = this.handleChangeButton.bind(this);

    this.pricingTiers = [];
  }

  handleChangeSelect(parameter, event) {
    let update = Object.assign({}, this.props.userProfile);
    update[parameter] = event.value;
    this.props.updateState({userProfile: update});
  }

  handleChangeButton(parameter, event) {
    let update = Object.assign({}, this.props.userProfile);
    update[parameter] = event;
    this.props.updateState({userProfile: update});
  }

  validate() {
    const fields = ['vertical', 'orientation', 'businessModel', 'platform', 'lifeCycle', 'coverage', 'loyalty', 'differentiation'];
    const errorFields = fields.filter(field => !this.props.userProfile[field]);
    // has errors
    if (errorFields && errorFields.length > 0) {
      // change order so user will be focused on first error
      errorFields.reverse().forEach(field =>
        this.refs[field].validationError()
      );
      return false;
    }
    if (this.props.pricingTiers && this.props.pricingTiers.length > 0) {
      this.refs.price.noValidationError();

      const notFilledIndicies = this.props.pricingTiers.map((tier, i) => {
        return {tier, i};
      })
        .filter(item => !item.tier.price)
        .map(item => item.i);

      this.props.pricingTiers.map((tier, i) => {
        return {tier, i};
      })
        .filter(item => item.tier.price)
        .forEach(item => this.pricingTiers[item.i].noValidationError());

      if(notFilledIndicies.length > 0 ){
        notFilledIndicies.forEach(index => this.pricingTiers[index].validationError());
        return false;
      }
      else {
        return true;
      }
    }
    else {
      this.refs.price.validationError();
      return false;
    }
  }

  handleChangePricing(parameter, index, event) {
    let pricingTiers = this.props.pricingTiers || [];
    if (!pricingTiers[index]) {
      pricingTiers.push({});
    }
    pricingTiers[index][parameter] = parseInt(event.target.value.replace(/[-%$,]/g, ''));
    this.props.updateState({pricingTiers: pricingTiers});
  }

  handleChangePricingPaid(isMonthly, index) {
    let pricingTiers = this.props.pricingTiers || [];
    if (!pricingTiers[index]) {
      pricingTiers.push({});
    }
    pricingTiers[index].isMonthly = isMonthly;
    this.props.updateState({pricingTiers: pricingTiers});
  }

  pricingTierRemove = (index) => {
    let pricingTiers = this.props.pricingTiers || [];
    pricingTiers.splice(index, 1);
    this.props.updateState({pricingTiers: pricingTiers});
  }

  calculatePricing(callback) {
    let update = Object.assign({}, this.props.userProfile);

    const price = this.props.pricingTiers.reduce((sum, item) => {
      return sum + item.weight / 100 * item.price * (item.isMonthly ? 12 : 1);
    }, 0);

    if (price === 0)
      update.price = '$0';
    else if (price > 0 && price <= 10)
      update.price = '$1-$10';
    else if (price > 10 && price <= 100)
      update.price = '$11-$100';
    else if (price > 100 && price <= 500)
      update.price = '$101-$500';
    else if (price > 500 && price <= 1000)
      update.price = '$501-$1000';
    else if (price > 1000 && price <= 2500)
      update.price = '$1001-$2500';
    else if (price > 2500 && price <= 5000)
      update.price = '$2501-$5000';
    else if (price > 5000 && price <= 7500)
      update.price = '$5001-$7500';
    else if (price > 7500 && price <= 10000)
      update.price = '$7501-$10000';
    else if (price > 10000 && price <= 75000)
      update.price = '$10001-$75000';
    else if (price > 75000)
      update.price = '>$75000';

    this.props.updateState({userProfile: update}, callback);
  }

  render() {
    const selects = {
      loyalty: {
        label: 'Loyalty',
        labelQuestion: [''],
        description: ['If a competitor will offer the same product as yours at a lower pricing point, what is the likability that your user will switch to his offer? \nPlease take into consideration: the user dependency on your company in terms of data, how loyal the user is in terms of comfortability, regulation, agreements, network effect and general loyalty (just because your user really likes you 😃).'],
        select: {
          name: 'loyalty',
          onChange: () => {
          },
          options: [
            {value: 'Extreme', label: 'Extreme'},
            {value: 'High', label: 'High'},
            {value: 'Medium', label: 'Medium'},
            {value: 'Low', label: 'Low'}
          ]
        }
      },
      differentiation: {
        label: 'Differentiation',
        labelQuestion: [''],
        description: ['What is your main differentiation from your competitors? If you’re not sure, please choose ‘Other’.'],
        select: {
          name: 'differentiation',
          options: [
            {value: 'Technology', label: 'Technology'},
            {value: 'High-End', label: 'High-End'},
            {value: 'Low Price', label: 'Low Price'},
            {value: 'Customized', label: 'Customized'},
            {value: 'Unique Value Offer', label: 'Unique Value Offer'},
            {value: 'Other', label: 'Other'}
          ]
        }
      }
    };
    /*
     let lifeCyclePopup = [
     <ProductLaunchPopup onNext={() => {
     this.setState({
     lifeCyclePopup: 'second'
     });
     }} onBack={() => {
     this.refs.lifeCycle.selectPrevButton();
     this.refs.lifeCycle.hidePopup();
     }}
     hidden={ this.state.lifeCyclePopup !== 'first' }
     key="first"
     />,
     lifeCyclePopup = <MarketFitPopup onNext={() => {
     this.refs.lifeCycle.selectNextButton();
     this.refs.lifeCycle.hidePopup();

     this.setState({
     lifeCyclePopup: 'first'
     });
     }} onBack={() => {
     this.setState({
     lifeCyclePopup: 'first'
     });
     }} hidden={ this.state.lifeCyclePopup !== 'second' }
     key="second"
     />
     ];
     */


    return <div>
      <Page popup={isPopupMode()}
            className={!isPopupMode() ? this.classes.static : null}
            contentClassName={this.classes.content}
            innerClassName={this.classes.pageInner}
            width='100%'>
          <Title title="Product"
                 subTitle='We are going to explore together your company and its basics to analyze it and create the best strategies to fit your company specifications'/>
        <div className={this.classes.error}>
          <label hidden={!this.state.serverDown}>Something is wrong... Let us check what is it and fix it for you
            :)</label>
        </div>
        <div className={this.classes.cols}>
          <div className={this.classes.colLeft}>
            <div className={this.classes.row}>
              <Label question={['']}
                     description={['What is your product\'s industry?']}>Vertical</Label>
              <ButtonsSet buttons={[
                {key: 'Martech', text: 'Martech', icon: 'buttons:martech'},
                {key: 'BI & Analytics', text: 'BI & Analytics', icon: 'buttons:bi'},
                {key: 'Sales', text: 'Sales', icon: 'buttons:sales'},
                {key: 'Security', text: 'Security', icon: 'buttons:security'},
                {key: 'IT', text: 'IT', icon: 'buttons:IT'},
                {key: 'Productivity', text: 'Productivity', icon: 'buttons:productivity'},
                {key: 'Finance', text: 'Finance', icon: 'buttons:finance-vertical'},
                {key: 'Other', text: 'Other', icon: 'buttons:other'}
              ]} selectedKey={this.props.userProfile.vertical}
                          onChange={this.handleChangeButton.bind(this, 'vertical')} ref='vertical'/>
            </div>
            <div className={this.classes.row}>
              <Label question={['']} description={['What is the orientation of your company?']}>Orientation</Label>
              <ButtonsSet
                buttons={[
                  {key: 'B2C', text: 'B2C', icon: 'buttons:b2c'},
                  {key: 'B2B', text: 'B2B', icon: 'buttons:b2b'}
                ]}
                selectedKey={this.props.userProfile.orientation}
                onChange={this.handleChangeButton.bind(this, 'orientation')}
                ref='orientation'/>
            </div>
            <div className={this.classes.row}>
              <Label question={['']}
                     description={['What is your company’s business model?']}>Business
                Model</Label>
              <ButtonsSet buttons={[
                {key: 'SaaS', text: 'Subscription', icon: 'buttons:SaaS'},
                {key: 'On-prem', text: 'Purchased Product', icon: 'buttons:product'},
                {key: 'Marketplace', text: 'Marketplace', icon: 'buttons:marketplace'},
                {key: 'eCommerce', text: 'eCommerce', icon: 'buttons:freemium'},
                {key: 'Other', text: 'Other', icon: 'buttons:other'}
              ]} selectedKey={this.props.userProfile.businessModel}
                          onChange={this.handleChangeButton.bind(this, 'businessModel')} ref='businessModel'/>
            </div>
            <div className={this.classes.row}>
              <Label ref='price' style={{marginBottom: '12px', fontWeight: '600'}} question={['']}
                     description={['What are your main pricing tiers/points?']}>
                Pricing
              </Label>
              <MultiRow numOfRows={this.props.pricingTiers.length || 1} rowRemoved={this.pricingTierRemove}>
                {({index, data, update, removeButton}) => {
                  return <div>
                    <div className={preferencesStyle.locals.channelsRow}>
                      <Label ref={(ref) => this.pricingTiers[index] = ref} style={{
                        marginBottom: '0',
                        fontWeight: '600'
                      }}>{`Tier ${ index + 1 }`} </Label>
                    </div>
                    <div style={{}} className={preferencesStyle.locals.channelsRow}>
                      <div className={preferencesStyle.locals.objectiveText}>Price</div>
                      <Textfield ref={'price' + index}
                                 value={this.props.pricingTiers[index] && this.props.pricingTiers[index].price ? '$' + this.props.pricingTiers[index].price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                                 style={{width: '80px', marginLeft: '10px'}}
                                 onChange={this.handleChangePricing.bind(this, 'price', index)} placeHolder="$"/>
                      <div className={preferencesStyle.locals.objectiveText} style={{marginLeft: '20px'}}>Paid</div>
                      <Toggle
                        options={[{
                          text: 'Monthly',
                          value: true
                        },
                          {
                            text: 'Annual',
                            value: false
                          }
                        ]}
                        selectedValue={this.props.pricingTiers[index] && this.props.pricingTiers[index].isMonthly}
                        onClick={(value) => {
                          this.handleChangePricingPaid(value, index);
                        }}
                        style={{marginLeft: '10px'}}/>
                      <div className={preferencesStyle.locals.objectiveText} style={{marginLeft: '20px'}}>Weight</div>
                      <Textfield
                        value={this.props.pricingTiers[index] && this.props.pricingTiers[index].weight ? this.props.pricingTiers[index].weight + '%' : ''}
                        style={{width: '80px', marginLeft: '10px'}}
                        onChange={this.handleChangePricing.bind(this, 'weight', index)} placeHolder="%"/>
                      <div className={preferencesStyle.locals.channelsRemove} style={{marginTop: '0px'}}>
                        {removeButton}
                      </div>
                    </div>
                  </div>;
                }}
              </MultiRow>
            </div>
            <div className={this.classes.row}>
              <Label question={['']}
                     description={['What is your main platform?']}>Platform</Label>
              <ButtonsSet buttons={[
                {key: 'Mobile', text: 'Mobile', icon: 'buttons:mobile'},
                {key: 'Web', text: 'Web', icon: 'buttons:web'},
                {key: 'Desktop', text: 'Desktop', icon: 'buttons:desktop'},
                {key: 'Any', text: 'Any', icon: 'buttons:all-devices'}
              ]} selectedKey={this.props.userProfile.platform}
                          onChange={this.handleChangeButton.bind(this, 'platform')} ref='platform'/>
            </div>
            <div className={this.classes.row}>
              <Label question={['', 'Intro', 'Growth', 'Mature', 'Decline']}
                     description={['Which stage of a company lifecycle currently fits your company?', 'pre-product/market fit.', 'reached product/market fit, sales begin to increase.', 'sales reached / are reaching their peak.', 'sales begin to decline as the product reaches its saturation point.']}>Life
                Cycle</Label>
              <ButtonsSet buttons={[
                {key: 'Intro', text: 'Intro', icon: 'buttons:intro'},
                {key: 'Growth', text: 'Growth', icon: 'buttons:growth'},
                {key: 'Mature', text: 'Mature', icon: 'buttons:mature'},
                {key: 'Decline', text: 'Decline', icon: 'buttons:decline'}
              ]} selectedKey={this.props.userProfile.lifeCycle}
                          onChange={this.handleChangeButton.bind(this, 'lifeCycle')} ref='lifeCycle'/>
            </div>
            <div className={this.classes.row}>
              <Label question={['']}
                     description={['What is your distribution strategy in terms of location? If you’re not sure, please choose ‘Any’.']}>Coverage</Label>
              <ButtonsSet buttons={[
                {key: 'Worldwide', text: 'Worldwide', icon: 'buttons:worldwide'},
                {key: 'Nationwide', text: 'Nationwide', icon: 'buttons:national'},
                {key: 'Local', text: 'Local', icon: 'buttons:local'},
                {key: 'Any', text: 'Any', icon: 'buttons:everywhere'}
              ]} selectedKey={this.props.userProfile.coverage}
                          onChange={this.handleChangeButton.bind(this, 'coverage')} ref='coverage'/>
            </div>
            <div className={this.classes.row} style={{
              width: '258px'
            }}>
              <Select {...selects.loyalty} selected={this.props.userProfile.loyalty}
                      onChange={this.handleChangeSelect.bind(this, 'loyalty')} ref='loyalty'/>
            </div>
            <div className={this.classes.row} style={{
              marginBottom: '200px',
              width: '258px'
            }}>
              <Select {...selects.differentiation} selected={this.props.userProfile.differentiation}
                      onChange={this.handleChangeSelect.bind(this, 'differentiation')} ref='differentiation'/>
            </div>
            {
              /*
               <div className={ this.classes.row }>
               <Label question={['Purchase', 'Subscription']}>Acquisition</Label>
               <ButtonsSet buttons={[
               { text: 'Purchase', icon: 'buttons:purchase' },
               { text: 'Subscription', icon: 'buttons:subscription' },
               ]} />
               </div>
               <div className={ this.classes.row }>
               <Label question>Price</Label>
               <Textfield defaultValue="$" style={{
               width: '166px'
               }} />
               </div>

               */
            }

          </div>


          {isPopupMode() ?

            <div className={this.classes.colRight}>
              <div className={this.classes.row}>
                <ProfileProgress progress={26} image={
                  require('assets/flower/1.png')
                }
                                 text="Congrats! The seeds of GROWTH have been planted"/>
              </div>
              {/*
               <div className={ this.classes.row }>
               <ProfileInsights highlight={ this.state.highlightInsights } />
               </div>
               */}
            </div>

            : null}
        </div>

        {isPopupMode() ?
          <div className={this.classes.footer}>
            <div className={this.classes.almostFooter}>
              <label hidden={!this.state.validationError} style={{color: 'red'}}>Please fill all the required
                fields</label>
            </div>
            <BackButton onClick={() => {
              this.calculatePricing(() => {
                this.props.updateUserMonthPlan({
                  userProfile: this.props.userProfile,
                  pricingTiers: this.props.pricingTiers,
                  planNeedsUpdate: true
                }, this.props.region, this.props.planDate)
                  .then(() => {
                    history.push('/settings/account');
                  });
              });
            }}/>
            <div style={{width: '30px'}}/>
            <NextButton onClick={() => {
              if (this.validate()) {
                this.calculatePricing(() => {
                  this.props.updateUserMonthPlan({
                    userProfile: this.props.userProfile,
                    pricingTiers: this.props.pricingTiers,
                    planNeedsUpdate: true
                  }, this.props.region, this.props.planDate)
                    .then(() => {
                      history.push('/settings/profile/target-audience');
                    });
                });
              }
              else {
                this.setState({validationError: true});
              }
            }}/>
          </div>
          :
          <div className={this.classes.footer}>
            <SaveButton onClick={() => {
              this.setState({saveFail: false, saveSuccess: false});
              this.calculatePricing(() => {
                this.props.updateUserMonthPlan({
                  userProfile: this.props.userProfile,
                  pricingTiers: this.props.pricingTiers,
                  planNeedsUpdate: true
                }, this.props.region, this.props.planDate);
                this.setState({saveSuccess: true});
              });
            }} success={this.state.saveSuccess} fail={this.state.saveFail}/>
          </div>
        }
      </Page>
    </div>;
  }
}