import React from 'react';
import Component from 'components/Component';
import Page from 'components/Page';
import style from 'styles/users/users-popup.css';
import ReactCountryFlag from 'react-country-flag';
import {getChannelIcon} from 'components/utils/filters/channels';
import {getNickname as getChannelNickname} from 'components/utils/channels';
import {getNickname as getIndicatorNickname} from 'components/utils/indicators';
import {isEmpty, groupBy, sortBy, uniqBy, get} from 'lodash';
import ReactDOM from 'react-dom';
import EventsTimeline from 'components/pages/users/EventsTimeline';
import moment from 'moment';
import CompanyLogo from 'components/pages/users/CompanyLogo';
import countryCode from 'data/countryCode';
import Tooltip from 'components/controls/Tooltip';
import classnames from 'classnames';
import {FeatureToggle} from "react-feature-toggles/lib";

export default class UsersPopup extends Component {

  style = style;

  constructor(props) {
    super(props);
    this.state = {
      showEmailsPopup: false
    };
  }

  static defaultProps = {
    user: {
      user: '',
      accountName: '',
      journey: [],
      countries: []
    }
  };

  componentDidMount() {
    document.addEventListener('mousedown', this.onOutsideClick, true);
    document.addEventListener('touchstart', this.onOutsideClick, true);
    document.addEventListener('keydown', this.handleKeyPress);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.onOutsideClick, true);
    document.removeEventListener('touchstart', this.onOutsideClick, true);
    document.removeEventListener('keydown', this.handleKeyPress);
  }

  onOutsideClick = (e) => {
    const elem = ReactDOM.findDOMNode(this.refs.popup);

    if (elem !== e.target && !elem.contains(e.target)) {
      this.props.close();
    }
  };

  handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      this.props.close();
    }
  };

  getChannelNicknameWithDirect = (channel) => channel === 'direct' ? 'Direct' : getChannelNickname(channel);

  groupUserEvents = () => {
    const {user, startOfPeriod} = this.props;
    const {sessions, funnelStages, revenueForAccount, forms = []} = user;
    const stagesOrder = {
      MCL: 0,
      MQL: 1,
      SQL: 2,
      opps: 3,
      users: 4
    };

    const funnelStageChanges = funnelStages && Object.keys(funnelStages).map(funnelStage => {
      const timestamp = funnelStages[funnelStage];
      const index = stagesOrder[funnelStage];
      return {
        startTime: timestamp,
        endTime: timestamp,
        isFunnelStage: true,
        funnelStage,
        revenueForAccount,
        nickname: getIndicatorNickname(funnelStage, true),
        previousFunnelStageNickname: (index && index > 0) ? getIndicatorNickname(Object.keys(stagesOrder)[index - 1], true) : null
      };
    });

    const beginningOfTimePeriod = {
      isStartOfPeriod: true,
      startTime: startOfPeriod
    };

    const events = [...(sessions || []), ...(funnelStageChanges || []), beginningOfTimePeriod, ...forms.map(item => ({
      ...item,
      isForm: true
    }))];
    const sortedEvents = sortBy(events, event => new Date(event.startTime || event.timestamp)).reverse();
    return groupBy(sortedEvents, event => moment(event.startTime || event.timestamp).format('MMM D, YYYY'));
  };

  getTooltip = () => {
    const {user, crmLinks} = this.props;
    const {emails} = user;

    return isEmpty(emails) ? '' : emails.map(item =>
      `<div>
            <div style="display: flex; align-items: center">
                ${item}
                <a href=${crmLinks[item]} target="_blank">
                    <span style="display: block; margin-left: 5px; height: 20px; width: 20px; background-image: url(/assets/external-link-symbol.svg); background-size: 15px; background-repeat: no-repeat; background-position: center; cursor: pointer;"/>
                </a>
            </div>
      </div>`).join('');
  };

  render() {
    const {user, close, customNicknames, crmLinks} = this.props;
    const {timeSinceFirst, timeSinceLast, emails, countries, devices, displayName, domainIcon, sessions, funnelStages, uniqCustom1, uniqCustom2,
      product, region, externalLeadSource, externalLeadSourceData1, externalLeadSourceData2} = user;

    const custom1Nickname = get(customNicknames, [0], '');
    const custom2Nickname = get(customNicknames, [1], '');
    const externalLeadSourceNickname = 'CRM lead source';
    const externalLeadSourceData1Nickname = 'CRM lead source details 1';
    const externalLeadSourceData2Nickname = 'CRM lead source details 2';

    const getCustomValue = uniqCustom => isEmpty(uniqCustom) ? 'null' : uniqCustom.join(', ');

    return <div>
      <Page popup={true} width='800px' contentClassName={this.classes.content} innerClassName={this.classes.inner}>
        <span ref='popup' className={this.classes.container}>
          <div className={this.classes.topRight}>
            <div className={this.classes.close} onClick={close}/>
          </div>
          <div className={this.classes.userJourney}>
            <h2 className={this.classes.title}>User's Journey</h2>
            <div className={this.classes.events}>
              <EventsTimeline groupedEvents={this.groupUserEvents()} emails={emails}/>
            </div>
          </div>
          <div className={this.classes.userInfo}>
            <section className={this.classes.section}>
              <CompanyLogo src={domainIcon} className={this.classes.icon}/>
              <div className={this.classes.displayName}>{displayName}</div>
              <div className={this.classes.email}>
                {
                  emails && emails.length === 1 ?
                    <div style={{display: 'flex', alignItems: 'center'}}>
                      {emails[0]}
                      <a href={crmLinks[emails[0]]} target="_blank">
                        <span style={{
                          display: 'block',
                          marginLeft: '5px',
                          height: '20px',
                          width: '20px',
                          backgroundImage: 'url(/assets/external-link-symbol.svg)',
                          backgroundSize: '15px',
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: 'center',
                          cursor: 'pointer'
                        }}/>
                      </a>
                    </div>
                    :
                    <Tooltip
                      id="email-tooltip"
                      tip={this.getTooltip()}
                      html
                      TooltipProps={{
                        multiline: true,
                        clickable: true,
                        event: 'click',
                        className: this.classes.tooltip
                      }}
                    >
                      <span style={{cursor: 'pointer'}}>
                        Multiple users
                      </span>
                    </Tooltip>
                }
              </div>
              <div className={this.classes.channels}>
              {
                sessions && uniqBy(sessions, 'channel').map((item, index) =>
                  <Tooltip key={index} id={item.channel} tip={this.getChannelNicknameWithDirect(item.channel)}>
                    <div className={this.classes.channelBox} data-icon={getChannelIcon(item.channel)}/>
                  </Tooltip>
                )
              }
              </div>
            </section>
            <section className={this.classes.section}>
              <div className={this.classes.label}>
                Stage
                <div className={this.classes.text}>
                  {funnelStages && Object.keys(funnelStages).map(stage => getIndicatorNickname(stage, true)).join(', ')}
                  </div>
              </div>
              <div className={this.classes.label}>
                First Touch
                <div className={this.classes.text}>
                  {timeSinceFirst}
                </div>
              </div>
              <div className={this.classes.label}>
                Last Touch
                <div className={this.classes.text}>
                  {timeSinceLast}
                </div>
              </div>
            </section>
            <section className={this.classes.section}>
              <div className={this.classes.label}>
                Country
                <div className={classnames(this.classes.row, this.classes.text)}>
                {
                  !isEmpty(countries) ?
                    countries.map(item =>
                      <Tooltip key={item} id={item} tip={countryCode[item] || item}>
                        <div key={item} className={this.classes.flag}>
                          <ReactCountryFlag
                            code={item}
                            svg
                            styleProps={{
                              width: '24px',
                              height: '18px'
                            }}
                          />
                        </div>
                      </Tooltip>
                    )
                    : null
                }
                </div>
              </div>
              <div className={this.classes.label}>
                Device
                <div className={classnames(this.classes.row, this.classes.text)}>
                {
                  !isEmpty(devices) ?
                    devices.map(item =>
                      <Tooltip key={item} id={item} tip={item}>
                        <div className={this.classes.device} data-icon={'device:' + item}/>
                      </Tooltip>
                    )
                    : null
                }
                </div>
              </div>
              <div className={this.classes.label}>
                Product
                <div className={this.classes.text}>
                  {product}
                </div>
              </div>
              <div className={this.classes.label}>
                Region
                <div className={this.classes.text}>
                  {region}
                </div>
              </div>
              {!isEmpty(custom1Nickname) ?
                <div className={this.classes.label}>
                  {custom1Nickname}
                  <div className={classnames(this.classes.row, this.classes.text)}>
                    {getCustomValue(uniqCustom1)}
                  </div>
                </div>
                : null}
              {!isEmpty(custom2Nickname) ?
                <div className={this.classes.label}>
                  {custom2Nickname}
                  <div className={classnames(this.classes.row, this.classes.text)}>
                    {getCustomValue(uniqCustom2)}
                  </div>
                </div>
                : null}
              <FeatureToggle featureName="CRMLeadSource">
                {!isEmpty(externalLeadSourceNickname) ?
                  <div className={this.classes.label}>
                    {externalLeadSourceNickname}
                    <div className={classnames(this.classes.row, this.classes.text)}>
                      {getCustomValue(externalLeadSource)}
                    </div>
                  </div>
                  : null}
                {!isEmpty(externalLeadSourceData1Nickname) ?
                  <div className={this.classes.label}>
                    {externalLeadSourceData1Nickname}
                    <div className={classnames(this.classes.row, this.classes.text)}>
                      {getCustomValue(externalLeadSourceData1)}
                    </div>
                  </div>
                  : null}
                {!isEmpty(externalLeadSourceData2Nickname) ?
                  <div className={this.classes.label}>
                    {externalLeadSourceData2Nickname}
                    <div className={classnames(this.classes.row, this.classes.text)}>
                      {getCustomValue(externalLeadSourceData2)}
                    </div>
                  </div>
                  : null}
              </FeatureToggle>
            </section>
          </div>
        </span>
      </Page>
    </div>;
  }
}
