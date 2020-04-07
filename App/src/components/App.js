import React from 'react';
import {DragDropContext} from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import Component from 'components/Component';
import Header from 'components/Header';
import Sidebar from 'components/Sidebar';
import serverCommunication from 'data/serverCommunication';
import q from 'q';
import history from 'history';
import {withRouter} from 'react-router';
import UnsavedPopup from 'components/UnsavedPopup';
import {initialize as initializeIndicators} from 'components/utils/indicators';
import {initialize as initializeChannels} from 'components/utils/channels';
import style from 'styles/app.css';
import {FeatureToggleProvider} from 'react-feature-toggles';
import PlanLoading from 'components/pages/plan/PlanLoading';
import {calculatedDataExtender, getAnnualBudgetFromAppData} from 'dataExtenders/calculatedDataExtender.js';
import {getProfileSync} from 'components/utils/AuthService';
import Settings from 'components/pages/Settings';
import {getMemberFullName} from 'components/utils/teamMembers';
import {get} from 'lodash';
import {compose} from 'components/utils/utils';
import {inject, observer} from 'mobx-react';
import Loader from 'components/controls/Loader';
import userStore from '../stores/userStore';

const enhance = compose(
  inject('userStore'),
  inject(({attributionStore}) => ({
    attributionStore
  })),
  observer
);
let isScheduleTaskRunning = false;

class AppComponent extends Component {

  style = style;

  constructor(props) {
    super(props);
    this.routerWillLeave = this.routerWillLeave.bind(this);
    this.handleCallback = this.handleCallback.bind(this);
    this.state = {
      loaded: false,
      isScheduleTaskRunning: isScheduleTaskRunning,
      getUserMonthPlan: this.getUserMonthPlan.bind(this),
      updateUserMonthPlan: this.updateUserMonthPlan.bind(this),
      updateUserAccount: this.updateUserAccount.bind(this),
      createUserMonthPlan: this.createUserMonthPlan.bind(this),
      createUserAccount: this.createUserAccount.bind(this),
      updateState: this.updateState.bind(this),
      setDataAsState: this.setDataAsState.bind(this),
      unsaved: false,
      addNotification: this.addNotification.bind(this),
      plan: this.plan.bind(this),
      forecast: this.forecast.bind(this),
      optimalImprovementPlan: this.optimalImprovementPlan.bind(this),
      pay: this.pay.bind(this),
      getUserAccount: this.getUserAccount.bind(this),
      sendSnippetEmail: this.sendSnippetEmail.bind(this),
      addUnknownChannel: this.addUnknownChannel.bind(this),
      getScriptValidator: this.getScriptValidator.bind(this),
      runScheduleTask: this.runScheduleTask.bind(this),
      updateTimerTime: this.updateTimerTime.bind(this),
      doneRunningScheduleTask: this.doneRunningScheduleTask.bind(this)
    };
  }

  // Asynchronous version of `setRouteLeaveHook`.
  // Instead of synchronously returning a result, the hook is expected to
  // return a promise.
  setAsyncRouteLeaveHook(router, hook) {
    let withinHook = false;
    let finalResult = undefined;
    let finalResultSet = false;
    router.listenBefore(nextLocation => {
      withinHook = true;
      if (!finalResultSet) {
        hook(nextLocation).then(result => {
          this.handleCallback(result);
          finalResult = result;
          finalResultSet = true;
          if (!withinHook && nextLocation) {
            // Re-schedule the navigation
            router.push(nextLocation);
          }
        });
      }
      let result = finalResultSet ? finalResult : false;
      withinHook = false;
      finalResult = undefined;
      finalResultSet = false;
      return result;
    });
  }

  routerWillLeave() {
    return new Promise((resolve, reject) => {
      if (!this.state.unsaved) {
        // No unsaved changes -- leave
        resolve(true);
      }
      else {
        // Unsaved changes -- ask for confirmation
        /**
         vex.dialog.confirm({
          message: 'There are unsaved changes. Leave anyway?' + nextLocation,
          callback: result => resolve(result)
        })
         **/
        this.setState({showUnsavedPopup: true, callback: resolve});
      }
    });
  }

  handleCallback(userAnswer) {
    if (this.state.showUnsavedPopup) {
      if (userAnswer && this.state.unsaved) {
        this.getUserMonthPlan(localStorage.getItem('region'), null);
      }
      this.setState({showUnsavedPopup: false});
    }
  }

  componentDidMount() {
    this.setAsyncRouteLeaveHook(this.props.router, this.routerWillLeave);
    this.getUnmappedData();
    const tasks = [
      this.getUserAccount(),
      this.getRegions(),
      this.getIndicatorsMetadata(),
      this.getChannelsMetadata(),
      this.getUserMonthPlan(localStorage.getItem('region'), null)
    ];

    Promise.all(tasks)
      .then(() => {
        setTimeout(() => {
          this.setState({loaded: true});
        }, 1000);
      })
      .catch((err) => {
          console.log(err);
        }
      );

  }

  updateState(newState, callback) {
    if (newState.userChannelsSchema) {
      initializeChannels(this.state.channelsSchema, newState.userChannelsSchema);
    }
    this.setState(newState, callback);
    this.setState({unsaved: newState.unsaved === undefined ? true : newState.unsaved});
  }

  updateUserMonthPlan(body, region, planDate, dontSetState) {
    const deferred = q.defer();
    this.setState({unsaved: false});
    serverCommunication.serverRequest('PUT', 'usermonthplan', JSON.stringify(body), region, planDate)
      .then((response) => {
        if (response.ok) {
          response.json()
            .then((data) => {
              if (!dontSetState) {
                this.setDataAsState(data);
                initializeIndicators(this.state.indicatorsSchema, data.namesMapping && data.namesMapping.indicators);
                initializeChannels(this.state.channelsSchema, data.userChannelsSchema);
              }
              deferred.resolve(data);
            });
        }
        else if (response.status == 401) {
          history.push('/');
          deferred.reject();
        }
      })
      .catch((err) => {
        console.log(err);
        deferred.reject();
      });

    return deferred.promise;

  }

  getUserMonthPlanWithOptions(region, planDate, endpoint, promiseCallback = null) {
    const deferred = q.defer();
    this.setState({unsaved: false});
    serverCommunication.serverRequest('GET', endpoint, null, region, planDate)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
        else if (response.status == 401) {
          history.push('/');
          deferred.reject();
        }
      })
      .then((data) => {
        if (data) {
          this.setDataAsState(data);
          initializeIndicators(this.state.indicatorsSchema, data.namesMapping && data.namesMapping.indicators);
          initializeChannels(this.state.channelsSchema, data.userChannelsSchema);
          return promiseCallback ? promiseCallback() : null;
        }
      })
      .then(deferred.resolve.bind(deferred))
      .catch((err) => {
        console.log(err);
        deferred.reject();
      });

    return deferred.promise;
  }

  getUserMonthPlanAndCalculateAttribution(region, planDate) {
    const {
      attributionStore: {pullAttributionData}
    } = this.props;

    return this.getUserMonthPlanWithOptions(region, planDate, 'usermonthplan-noattr', () => pullAttributionData({monthsExceptThisMonth: get(this.state.userAccount, 'monthsExceptThisMonth', 0)}, 'default').then(this.setGroupByMapping));
  }

  getUserMonthPlan(region, planDate) {
    return this.getUserMonthPlanAndCalculateAttribution(region, planDate);
  }

  getUserAccount() {
    const {userStore} = this.props;
    const deferred = q.defer();
    serverCommunication.serverRequest('GET', 'useraccount')
      .then((response) => {
        if (response.ok) {
          response.json()
            .then((data) => {
              if (data) {
                userStore.setUserAccount(data);
                this.setState({
                  userAccount: data,
                  userCompany: data.companyName,
                  companyWebsite: data.companyWebsite,
                  logoURL: data.companyWebsite ? 'https://logo.clearbit.com/' + data.companyWebsite : '',
                  teamMembers: data.teamMembers,
                  permissions: data.permissions
                });
              }
              deferred.resolve();
            });
        }
        else if (response.status == 401) {
          history.push('/');
          deferred.reject();
        }
      })
      .catch((err) => {
        console.log(err);
        deferred.reject();
      });

    return deferred.promise;
  }

  setGroupByMapping = groupByMapping => this.setState({groupByMapping});

  updateUserAccount(body) {
    const deferred = q.defer();
    this.setState({unsaved: false});
    serverCommunication.serverRequest('PUT', 'useraccount', JSON.stringify(body))
      .then((response) => {
        if (response.ok) {
          response.json()
            .then((data) => {
              this.setState({
                userAccount: data,
                userCompany: data.companyName,
                logoURL: data.companyWebsite ? 'https://logo.clearbit.com/' + data.companyWebsite : '',
                teamMembers: data.teamMembers,
                permissions: data.permissions
              });
              deferred.resolve();
            });
        }
        else if (response.status == 401) {
          history.push('/');
          deferred.reject();
        }
      })
      .catch(function (err) {
        console.log(err);
        deferred.reject();
      });

    return deferred.promise;
  }

  createUserAccount(body) {
    const deferred = q.defer();
    serverCommunication.serverRequest('POST', 'useraccount', JSON.stringify(body))
      .then((response) => {
        if (response.ok) {
          response.json()
            .then((data) => {
              this.setState({
                userAccount: data,
                userCompany: data.companyName,
                logoURL: data.companyWebsite ? 'https://logo.clearbit.com/' + data.companyWebsite : '',
                teamMembers: data.teamMembers,
                permissions: data.permissions,
                unsaved: false
              });
              deferred.resolve();
            });
        }
        else if (response.status == 401) {
          history.push('/');
          deferred.reject();
        }
      })
      .catch(function (err) {
        console.log(err);
        deferred.reject();
      });

    return deferred.promise;
  }

  createUserMonthPlan(body) {
    const deferred = q.defer();
    serverCommunication.serverRequest('POST', 'usermonthplan', JSON.stringify(body))
      .then((response) => {
        if (response.ok) {
          response.json()
            .then((data) => {
              if (data) {
                this.setDataAsState(data);
                deferred.resolve();
              }
            });
        }
        else if (response.status == 401) {
          history.push('/');
          deferred.reject();
        }
      })
      .catch((err) => {
        console.log(err);
        deferred.reject();
      });

    return deferred.promise;
  }

  getChannelsMetadata() {
    const deferred = q.defer();
    serverCommunication.serverRequest('GET', 'metadata/channels', false, false, false, true)
      .then((response) => {
        if (response.ok) {
          response.json()
            .then((data) => {
              if (data) {
                this.setState({
                  channelsSchema: data
                });
                initializeChannels(data);
                deferred.resolve();
              }
            });
        }
        else if (response.status == 401) {
          history.push('/');
          deferred.reject();
        }
      })
      .catch((err) => {
        console.log(err);
        deferred.reject();
      });

    return deferred.promise;
  }

  getIndicatorsMetadata() {
    const deferred = q.defer();
    serverCommunication.serverRequest('GET', 'metadata/indicators', false, false, false, true)
      .then((response) => {
        if (response.ok) {
          response.json()
            .then((data) => {
              if (data) {
                this.setState({
                  indicatorsSchema: data
                });
                initializeIndicators(data);
                deferred.resolve();
              }
            });
        }
        else if (response.status == 401) {
          history.push('/');
          deferred.reject();
        }
      })
      .catch((err) => {
        console.log(err);
        deferred.reject();
      });

    return deferred.promise;
  }

  getRegions() {
    const deferred = q.defer();
    serverCommunication.serverRequest('GET', 'regions')
      .then((response) => {
        if (response.ok) {
          response.json()
            .then((data) => {
              if (data) {
                this.setState({
                  regions: data
                });
              }
              deferred.resolve();
            });
        }
        else if (response.status == 401) {
          history.push('/');
          deferred.reject();
        }
      })
      .catch((err) => {
        console.log(err);
        deferred.reject();
      });

    return deferred.promise;
  }

  setDataAsState(data) {
    userStore.setUserMonthPlan(data);
    this.setState({
      dataUpdated: true,
      userMonthPlan: data,
      userProfile: data.userProfile,
      targetAudience: data.targetAudience && data.targetAudience.length > 0 ? data.targetAudience : [{
        fields: {
          teamSize: null,
          salary: null,
          education: null,
          dailyOnlinePresence: null,
          age: null,
          gender: null
        },
        info: {
          weight: 100
        }
      }],
      annualBudget: data.annualBudget,
      annualBudgetArray: data.annualBudgetArray || [],
      planDate: data.planDate,
      UID: data.UID,
      region: data.region,
      objectives: data.objectives || [],
      blockedChannels: data.blockedChannels || [],
      inHouseChannels: data.inHouseChannels || [],
      userMinMonthBudgets: data.userMinMonthBudgets || [],
      maxChannels: data.maxChannels || -1,
      actualIndicators: data.actualIndicators || {},
      actualChannelBudgets: data.actualChannelBudgets || {},
      knownChannels: data.actualChannelBudgets && data.actualChannelBudgets.knownChannels || {},
      unknownChannels: data.actualChannelBudgets && data.actualChannelBudgets.unknownChannels || {},
      campaigns: data.campaigns || [],
      campaignsTemplates: data.campaignsTemplates || {},
      campaignIdeas: data.campaignIdeas || [],
      numberOfPlanUpdates: data.numberOfPlanUpdates,
      planUnknownChannels: data.unknownChannels || [],
      budget: data.annualBudget,
      events: data.events || [],
      googleapi: data.googleapi,
      hubspotapi: data.hubspotapi,
      facebookapi: data.facebookapi,
      youtubeapi: data.youtubeapi,
      mozapi: data.mozapi,
      salesforceapi: data.salesforceapi,
      linkedinapi: data.linkedinapi,
      twitterapi: data.twitterapi,
      googlesheetsapi: data.googlesheetsapi,
      stripeapi: data.stripeapi,
      facebookadsapi: data.facebookadsapi,
      linkedinadsapi: data.linkedinadsapi,
      twitteradsapi: data.twitteradsapi,
      quoraadsapi: data.quoraadsapi,
      googleadsapi: data.adwordsapi,
      bingadsapi: data.bingadsapi,
      attribution: {
        channelsImpact: {},
        groupByMapping: {},
        pages: [],
        campaigns: [],
        usersByEmail: [],
        usersByAccount: [],
        ...data.attribution
      },
      pricingTiers: data.pricingTiers && data.pricingTiers.length > 0 ? data.pricingTiers : [{
        price: '',
        isMonthly: false,
        weight: 100
      }],
      planNeedsUpdate: data.planNeedsUpdate,
      notifications: data.notifications || [],
      CIM: data.CIM || {},
      technologyStack: data.technologyStack || [],
      historyData: data.historyData || {},
      beforeInfiniGrowData: data.beforeInfiniGrowData || {},
      budgetConstraints: data.budgetConstraints || {},
      planBudgets: data.planBudgets || [],
      forecastedIndicators: data.forecastedIndicators || [],
      namesMapping: data.namesMapping && Object.keys(data.namesMapping).length > 0 ? data.namesMapping : {
        indicators: {}
      },
      userChannelsSchema: data.userChannelsSchema,
      attributionMappingRules: data.attributionMappingRules || [],
      userRegions: data.userRegions,
      expenses: data.expenses || [],
      actualIndicatorsDaily: data.actualIndicatorsDaily || [],
      actualChannelBudgetsDaily: data.actualChannelBudgetsDaily || [],
      channelsImpact: data.channelsImpact || {},
      CRMConfig: data.CRMConfig || {},
      siteStructure: data.siteStructure,
      offline: data.offline || [],
      timerMinutes: 0
    });
  }

  addNotification(userId, type, notification, isSendEmail) {
    let notifications = this.state.notifications || [];
    notifications.push({
      UID: userId,
      timestamp: new Date(),
      notificationType: type,
      isRead: false,
      notification: notification
    });
    this.updateUserMonthPlan({notifications: notifications}, this.state.region, this.state.planDate);
    if (isSendEmail) {
      const member = this.state.teamMembers.find(member => member.userId === userId);
      const tagger = this.state.teamMembers.find(member => member.userId === notification.tagger);
      serverCommunication.serverRequest('POST', 'email', JSON.stringify({
          email: member.email,
          name: getMemberFullName(member),
          type: type,
          taggerName: getMemberFullName(tagger),
          campaignName: notification.campaignName,
          plainComment: notification.plainComment
        }),
        false, false, true
      );
    }
  }

  sendSnippetEmail(senderEmail, UID, to) {
    serverCommunication.serverRequest('POST', 'snippetEmail', JSON.stringify({
        email: to,
        UID: UID,
        sender: senderEmail
      }),
      false, false, true
    );
  }

  approveChannel(month, channel, budget) {
    let approvedBudgets = this.state.approvedBudgets;
    let approvedMonth = this.state.approvedBudgets[month] || {};
    approvedMonth[channel] = parseInt(budget.toString().replace(/[-$,]/g, ''));
    approvedBudgets[month] = approvedMonth;
    return this.state.updateUserMonthPlan({approvedBudgets: approvedBudgets}, this.state.region, this.state.planDate)
      .then(() => {
        this.forecast();
      });
  }

  optimalImprovementPlan(isCommitted, preferences, region, silent, improveMaxChanges) {
    const plannerControls = {
      optimizeScenarios: improveMaxChanges ? {
        optimalImprovement: {
          params: {
            improveMaxChanges: improveMaxChanges
          }
        }
      } : null,
      systemControls: {
        optimizeControl: {
          scenario: 'optimalImprovement'
        }
      }
    };

    return this.plan(isCommitted, preferences, region, silent, plannerControls);
  }

  plan(isCommitted, preferences, region, silent, plannerControls = null) {
    const deferred = q.defer();
    let body = preferences || plannerControls ? JSON.stringify({preferences, plannerControls}) : null;
    let func = isCommitted ? (body ? 'PUT' : 'GET') : 'POST';
    if (!silent) {
      this.setState({
        isPlannerLoading: true,
        serverDown: false
      });
    }
    serverCommunication.serverRequest(func, 'plan', body, region)
      .then((response) => {
        if (response.ok) {
          response.json()
            .then((data) => {
              if (data) {
                if (data.error) {
                  if (!silent) {
                    this.setState({isPlannerError: true});
                  }
                }
                else {
                  if (!silent) {
                    this.setState({
                      isPlannerError: false
                    });
                  }
                  this.updateState({
                    numberOfPlanUpdates: data.numberOfPlanUpdates,
                    unsaved: false
                  });
                  deferred.resolve(data);
                }
              }
              else {
              }
            });
        }
        else {
          if (response.status == 401) {
            if (!silent) {
              history.push('/');
            }
          }
          if (response.status == 400) {
            if (!silent) {
              this.setState({isPlannerError: true, isPlannerLoading: false});
            }
          }
          else {
            if (!silent) {
              this.setState({serverDown: true, isPlannerLoading: false});
            }
          }
          deferred.reject();
        }
      })
      .catch((err) => {
        if (!silent) {
          this.setState({
            serverDown: true, isPlannerLoading: false
          });
        }
        deferred.reject();
      });
    return deferred.promise;
  }

  forecast(planBudgets) {
    return new Promise((resolve, reject) => {
      const {attribution, ...planWithoutAttribution} = this.state.userMonthPlan;

      serverCommunication.serverRequest('POST', 'forecast', JSON.stringify({
        ...planWithoutAttribution,
        planBudgets: planBudgets
      }), this.state.region)
        .then((response) => {
          if (response.ok) {
            response.json()
              .then((data) => resolve(data));
          }
          else {
            reject();
          }
        });
    });
  }

  addUnknownChannel(channelKey, nickname = channelKey, category = 'Other') {
    const userChannelsSchema = {...this.state.userChannelsSchema};
    userChannelsSchema[channelKey] = {
      nickname: nickname,
      category: category,
      isUnknownChannel: true
    };
    this.updateState({userChannelsSchema: userChannelsSchema}, () => {
      this.updateUserMonthPlan({
        userChannelsSchema: this.state.userChannelsSchema
      }, this.state.region, this.state.planDate, true);
    });
  }

  getUnmappedData() {
    const deferred = q.defer();
    serverCommunication.serverRequest('GET', 'getUnmappedData', null, localStorage.getItem('region'))
      .then((response) => {
        if (response.ok) {
          response.json()
            .then(([unmappedUrls, unmappedUtms]) => {
              this.setState({
                unmappedUrls,
                unmappedUtms
              });
              deferred.resolve();
            });
        }
      })
      .catch((err) => {
        console.log(err);
        deferred.reject();
      });

    return deferred.promise;
  }

  getScriptValidator() {
    const deferred = q.defer();
    serverCommunication.serverRequest('GET', 'getScriptValidator')
      .then((response) => {
        if (response.ok) {
          response.json()
            .then((response) => {
              response !== null ? deferred.resolve(true) : deferred.resolve(false);
            });
        }
      })
      .catch((err) => {
        console.log(err);
        deferred.reject();
      });
    return deferred.promise;
  };

  runScheduleTask() {
    this.setState({isScheduleTaskRunning: true});
    const deferred = q.defer();
    serverCommunication.serverRequest('POST', 'runScheduleTask')
      .then(response => {
        if (response.ok) {
          this.doneRunningScheduleTask();
        }
      })
      .catch(err => {
        console.log(err);
        deferred.reject();
      });
    return deferred.promise;
  };

  updateTimerTime = newTime => {
    this.setState({timerMinutes: newTime});
  };

  doneRunningScheduleTask = () => {
    this.getUserMonthPlan(localStorage.getItem('region'), null);
    this.setState({isScheduleTaskRunning: false});
  };

  pay() {
    const profile = getProfileSync();
    const user = this.state.teamMembers.find(user => user.userId === profile.user_id);
    const email = user.email;
    const annualBudget = getAnnualBudgetFromAppData(this.state);
    let product = 540236;
    if (annualBudget > 240000 && annualBudget < 1020000)
      product = 540408;
    if (annualBudget > 1020000)
      product = 540409;
    return Paddle.Checkout.open({
      product: product,
      email: email,
      message: 'If you wish to pay annually and get ~22.5% discount, please send us an email to support@infinigrow.com',
      passthrough: {UID: this.state.UID},
      title: 'InfiniGrow',
      allowQuantity: false,
      successCallback: (data) => {
        setTimeout(() => {
          this.state.getUserAccount();
        }, 2000);
      }
    });
  };

  getExtendedState(state) {
    return calculatedDataExtender(state);
  }

  isSettingsOpen = () => {
    return this.props.children.type === Settings;
  };

  getTabNameFromRoute = (routeElementTabName) => {
    if (typeof routeElementTabName === 'string') {
      return routeElementTabName;
    }
    else if (this.state[routeElementTabName.fromProp]) {
      return routeElementTabName.formatter(this.state[routeElementTabName.fromProp]);
    }
    else {
      return routeElementTabName.defaultName;
    }
  };

  getTabsToRender = () => {
    let fatherPageComponentType = this.props.children.type;
    let childRoutes = this.props.route.childRoutes;

    if (this.isSettingsOpen()) {
      childRoutes = childRoutes.find(item => item.component === fatherPageComponentType).childRoutes;
      fatherPageComponentType = this.props.children.props.children.type;
    }

    const childRoute = childRoutes.find(item => item.component === fatherPageComponentType);
    return childRoute.childRoutes ? childRoute.childRoutes.map((item) => {
        return {name: this.getTabNameFromRoute(item.tabName), path: item.path};
      })
      : [];
  };

  render() {
    const tabs = this.getTabsToRender();

    const extendedData = this.state.dataUpdated ? this.getExtendedState(this.state) : this.state;
    const childrenWithProps = React.Children.map(this.props.children,
      (child) => React.cloneElement(child, extendedData));

    if (extendedData.calculatedData && !extendedData.calculatedData.isAccountEnabled) {
      this.pay();
      return null;
    }

    return <FeatureToggleProvider featureToggleList={this.state.permissions || {}}>
      <div>
        <Header {...extendedData} tabs={tabs} isSettingsOpen={this.isSettingsOpen()} userAccount={this.state.userAccount} path={this.props.location.pathname}/>
        <UnsavedPopup hidden={!this.state.showUnsavedPopup} callback={this.state.callback}/>
        <PlanLoading showPopup={this.state.isPlannerLoading} close={() => {
          this.setState({isPlannerLoading: false});
        }}/>
        {this.state.loaded ?
          <div className={tabs.length ? this.classes.wrap : this.classes.noSubWrap} data-loading={this.state.isPlannerLoading ? true : null}>
            {childrenWithProps}
          </div>
          : <Loader/>}
      </div>
    </FeatureToggleProvider>;
  }
}

export default enhance(withRouter(DragDropContext(HTML5Backend)(AppComponent)));
