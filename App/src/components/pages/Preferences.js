import React from 'react';
import Component from 'components/Component';
import Page from 'components/Page';
import Textfield from 'components/controls/Textfield';
import Label from 'components/ControlsLabel';
import Notice from 'components/Notice';
import MultiRow from 'components/MultiRow';
import Title from 'components/onboarding/Title';
import ProfileProgress from 'components/pages/profile/Progress';
import BackButton from 'components/pages/profile/BackButton';
import SaveButton from 'components/pages/profile/SaveButton';
import MultiSelect from 'components/controls/MultiSelect';
import Button from 'components/controls/Button';
import style from 'styles/onboarding/onboarding.css';
import preferencesStyle from 'styles/preferences/preferences.css';
import {isPopupMode} from 'modules/popup-mode';
import history from 'history';
import {formatChannels} from 'components/utils/channels';
import ObjectiveView from 'components/pages/preferences/ObjectiveView';
import AddObjectivePopup from 'components/pages/preferences/AddObjectivePopup';
import {getIndicatorsWithProps, getMetadata} from 'components/utils/indicators';
import {FeatureToggle} from 'react-feature-toggles';
import Range from 'components/controls/Range';
import {getDates} from 'components/utils/date';
import isNil from 'lodash/isNil';
import sortBy from 'lodash/sortBy';
import get from 'lodash/get';
import set from 'lodash/set';
import ChannelsSelect from 'components/common/ChannelsSelect';
import moment from 'moment';
import {map} from 'lodash';
import {getPrevValue} from 'components/utils/objective';

export default class Preferences extends Component {

  style = style;
  styles = [preferencesStyle];

  budgetWeights = [0.05, 0.1, 0.19, 0.09, 0.09, 0.09, 0.04, 0.08, 0.1, 0.06, 0.07, 0.04];

  static defaultProps = {
    objectives: [],
    isCheckAnnual: true,
    maxChannels: -1,
    blockedChannels: [],
    inHouseChannels: [],
    planDate: null,
    annualBudgetArray: [],
    userAccount: {},
    actualIndicators: {}
  };

  constructor(props) {
    super(props);
    this.state = {
      isCheckAnnual: props.annualBudget !== null,
      isDivideEqually: props.annualBudget !==
        null &&
        props.annualBudgetArray.length >
        0 &&
        props.annualBudgetArray.every((budget) => {
          return budget === props.annualBudgetArray[0];
        }),
      showAdvancedFields: false,
      objectivePopupData: {
        hidden: true,
        objective: null,
        objectiveMonth: null,
        objectiveEdit: false
      }
    };
    this.blockedChannelRemove = this.blockedChannelRemove.bind(this);
    this.inHouseChannelRemove = this.inHouseChannelRemove.bind(this);
    this.budgetConstraintRemove = this.budgetConstraintRemove.bind(this);
    this.toggleBudgetsCheck = this.toggleBudgetsCheck.bind(this);
    this.calculateBudgets = this.calculateBudgets.bind(this);
  }

  componentDidMount() {
    // Advanced toggle open?
    if (this.props.maxChannels !== -1 ||
      Object.keys(this.props.budgetConstraints).length > 0 ||
      this.props.inHouseChannels.length > 0 ||
      this.props.blockedChannels.length > 0) {
      this.setState({showAdvancedFields: true});
    }
  }

  getDataToUpdate = () => {
    return {
      annualBudget: this.props.annualBudget,
      annualBudgetArray: this.props.annualBudgetArray,
      objectives: this.props.objectives,
      blockedChannels: this.props.blockedChannels,
      inHouseChannels: this.props.inHouseChannels,
      maxChannels: this.props.maxChannels,
      budgetConstraints: this.props.budgetConstraints,
      planNeedsUpdate: true
    };
  };

  validate() {
    let filterNanArray = this.props.annualBudgetArray.filter((value) => {
      return !!value;
    });

    if (filterNanArray.length !== 12) {
      this.refs.annualBudget.validationError();
      return 'Please fill all the required fields';
    }
    else if (this.props.calculatedData.annualBudget < 50000) {
      this.refs.annualBudget.validationError();
      return 'Please insert an annual budget higher than $50K';
    }
    else {
      return null;
    }
  }

  handleChangeBudget(parameter, event) {
    let update = {};
    update[parameter] = parseInt(event.target.value.replace(/[-$,]/g, ''));
    this.refs.annualBudget.noValidationError();
    this.props.updateState(update, this.calculateBudgets);
  }

  handleChangeBudgetArray(index, event) {
    let update = this.props.annualBudgetArray || [];
    update.splice(index, 1, parseInt(event.target.value.replace(/[-$,]/g, '')));
    this.refs.annualBudget.noValidationError();
    this.props.updateState({annualBudgetArray: update}, this.calculateBudgets);
  }

  handleChangeBlockedChannels(event) {
    let update = event.map((obj) => {
      return obj.value;
    });
    this.props.updateState({blockedChannels: update});
  }

  handleChangeInHouseChannels(event) {
    let update = event.map((obj) => {
      return obj.value;
    });
    this.props.updateState({inHouseChannels: update});
  }

  handleChangeMax(parameter, event) {
    const number = parseInt(event.target.value);
    if (number && number > 0) {
      this.props.updateState({maxChannels: number});
    }
    else {
      this.props.updateState({maxChannels: -1});
    }
  }

  inHouseChannelRemove(index) {
    let update = this.props.inHouseChannels || [];
    update.splice(index, 1);
    this.props.updateState({inHouseChannels: update});
  }

  blockedChannelRemove(index) {
    let update = this.props.blockedChannels || [];
    update.splice(index, 1);
    this.props.updateState({blockedChannels: update});
  }

  budgetConstraintRemove(index) {
    const budgetConstraints = {...this.props.budgetConstraints};
    const channel = Object.keys(budgetConstraints)[index];
    delete budgetConstraints[channel];
    this.props.updateState({budgetConstraints: budgetConstraints});
  }

  addBudgetConstraintChannel(index, event) {
    const budgetConstraints = {...this.props.budgetConstraints};
    const channel = event.value;
    const existingChannels = Object.keys(budgetConstraints);
    const numOfConstrains = existingChannels.length;
    // New line
    if (index === numOfConstrains) {
      if (!budgetConstraints[channel]) {
        budgetConstraints[channel] = {
          range: {
            min: 0,
            max: -1
          }
        };
      }
    }
    else {
      // Existing line
      const oldChannel = existingChannels[index];
      budgetConstraints[channel] = budgetConstraints[oldChannel];
      delete budgetConstraints[oldChannel];
    }
    this.props.updateState({budgetConstraints: budgetConstraints});
  }

  handleRangeChange(index, event) {
    const budgetConstraints = {...this.props.budgetConstraints};
    const channel = Object.keys(budgetConstraints)[index];
    budgetConstraints[channel].range = event;
    this.props.updateState({budgetConstraints: budgetConstraints});
  }

  objectiveRemove = (objective, monthIndex) => {
    let objectives = [...this.props.objectives];
    if (objectives[monthIndex][objective]) {
      const objectiveToDeletePriority = get(objectives, [monthIndex, objective, 'target', 'priority'], -1);
      if (objectiveToDeletePriority !== this.props.calculatedData.objectives.objectivesData.length - 1 && objectiveToDeletePriority !== -1) {
        // handle priority changes
        Object.keys(objectives).forEach(index => {
          if (Object.keys(objectives[index]).length > 0) {
            Object.keys(objectives[index]).forEach(indicator => {
              const indicatorPriority = get(objectives, [index, indicator, 'target', 'priority'], -1);
              if (indicatorPriority > objectiveToDeletePriority) {
                set(objectives, [index, indicator, 'target', 'priority'], indicatorPriority - 1);
              }
            });
          }
        });
      }
      delete objectives[monthIndex][objective];
    }
    this.props.updateState({objectives: objectives});
  };

  createOrUpdateObjective = (objectiveData, originalMonthIndex, originalObjective) => {
    let {monthIndex} = objectiveData;
    const {indicator, isRecurrent, recurrentType, isCustom, amount, month, isPercentage} = objectiveData;

    if (indicator) {
      const isDirectionUp = getMetadata('isDirectionUp', indicator);
      const objectives = [...this.props.objectives];
      let recurrentArray = [];
      if (!!isRecurrent && !!amount && !isCustom) {
        if (recurrentType === 'monthly') {
          monthIndex = 0;
          for (let i = 0; i < 12; i++) {
            let targetValue = -1;
            // if starts in next month, leave first month as -1
            if (month - moment().month() === 1 && i === 0) {
              recurrentArray.push(Math.round(targetValue));
              continue;
            }
            const value = i ? (recurrentArray[i - 1] === -1 ? 0 : recurrentArray[i - 1]) : getPrevValue(recurrentType, this.props.historyData, indicator);
            if (isPercentage) {
              targetValue = (1 + (amount / 100 * (isDirectionUp ? 1 : -1))) * value;
            }
            else {
              targetValue = value + amount * (isDirectionUp ? 1 : -1);
            }
            recurrentArray.push(Math.round(targetValue));
          }
        }

        if (recurrentType === 'quarterly') {
          const now = new Date();
          const quarter = Math.floor((now.getMonth() / 3));
          const firstDate = new Date(now.getFullYear(), quarter * 3, 1);
          const endDate = new Date(firstDate.getFullYear(), firstDate.getMonth() + 3, 0);
          monthIndex = endDate.getMonth() - now.getMonth();
          recurrentArray = new Array(12).fill(-1);
          // if starts in next quarter, leave first quarter as -1
          let i = 0 + objectiveData.quarter - moment().quarter();
          for (i; i < 4; i++) {
            const index = (monthIndex + (i * 3)) % 12;
            let targetValue = -1;
            const value = i ? recurrentArray[(monthIndex + ((i - 1) * 3)) % 12] : getPrevValue(recurrentType, this.props.historyData, indicator);
            if (objectiveData.isPercentage) {
              targetValue = (objectiveData.amount / 100 + 1) * value;
            }
            else {
              targetValue = objectiveData.amount + value;
            }
            recurrentArray[index] = Math.round(targetValue);
          }
        }
      }

      if (!!isRecurrent && isCustom) {
        monthIndex = objectiveData.recurrentArray.findIndex(item => item !== -1);
        recurrentArray = objectiveData.recurrentArray;
      }

      const isEditMode = !!originalObjective && !isNil(originalMonthIndex);
      if (isEditMode && (originalMonthIndex !== monthIndex || originalObjective !== indicator)) {
        objectives[monthIndex][indicator] = objectives[originalMonthIndex][originalObjective];
        delete objectives[originalMonthIndex][originalObjective];
      }

      if (!get(objectives, `[${monthIndex}][${indicator}]`, false)) {
        objectives[monthIndex] = {
          ...get(objectives, `[${monthIndex}]`, {}),
          [indicator]: {
            target: {},
            userInput: {}
          }
        };
      }

      // not the expected priority, need to replace
      const expectedPriority = isEditMode
        ? objectives[monthIndex][indicator].target.priority
        : this.props.calculatedData.objectives.objectivesData.length;
      if (objectiveData.priority !== expectedPriority) {
        const previous = this.props.calculatedData.objectives.objectivesData.find(
          item => item.priority === objectiveData.priority);
        if (previous) {
          const {monthIndex, indicator} = previous;
          objectives[monthIndex][indicator].target.priority = expectedPriority;
        }
      }
      let targetValue;
      if (isRecurrent) {
        targetValue = isCustom ? objectiveData.predictedValues.filter(value => !!value)[0] : recurrentArray.filter(value => value !== -1)[0];
      }
      else {
        targetValue = objectiveData.targetValue;
      }
      if (!isNil(monthIndex) && targetValue) {
        objectives[monthIndex][indicator] = {
          target: {
            ...objectives[monthIndex][indicator].target,
            value: targetValue,
            priority: objectiveData.priority
          },
          userInput: {
            ...objectives[monthIndex][indicator].userInput,
            isRecurrent: isRecurrent,
            isPercentage: objectiveData.isPercentage,
            isTarget: objectiveData.isTarget,
            amount: objectiveData.amount,
            isCustom: objectiveData.isCustom,
            recurrentType: objectiveData.recurrentType,
            recurrentArray: recurrentArray,
            startMonthIndex: objectiveData.startMonthIndex,
            timeFrame: objectiveData.timeFrame,
            startDate: objectiveData.startDate,
            quarter: objectiveData.quarter,
            month: objectiveData.month
          }
        };
        this.props.updateState({objectives: objectives});
        this.setState({
          objectivePopupData: {
            objective: null,
            objectiveMonth: null,
            objectiveEdit: false,
            hidden: true
          }
        });
      }
    }
  };

  changeObjectivePriority = (hoverIndex, dragIndex) => {
    const {objectives, updateState} = this.props;

    const formattedObjectives = objectives.map(object => {
      for (let key in object) {
        const path = [key, 'target', 'priority'];
        const priority = get(object, path);

        if (priority === hoverIndex) {
          set(object, path, dragIndex);
        }
        else if (priority === dragIndex) {
          set(object, path, hoverIndex);
        }
      }
      return object;
    });

    updateState({objectives: formattedObjectives});
  };

  monthBudgets() {
    const datesArray = getDates(this.props.planDate);
    return datesArray.map((month, index) => {
      return <div className={this.classes.cell} key={index}>
        <Label style={{width: '70px', marginTop: '12px'}}>{month}</Label>
        <Textfield
          value={'$' +
          (this.props.annualBudgetArray[index] ? this.props.annualBudgetArray[index].toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
          onChange={this.handleChangeBudgetArray.bind(this, index)} style={{
          width: '166px'
        }}/>
      </div>;
    });
  }

  toggleBudgetsCheck() {
    if (this.props.planDate) {
      this.setState({isCheckAnnual: !this.state.isCheckAnnual}, this.calculateBudgets);
    }
  }

  handleBudgetDivideChange() {
    this.setState({isDivideEqually: !this.state.isDivideEqually}, this.calculateBudgets);
  }

  calculateBudgets() {
    if (this.state.isCheckAnnual) {
      let prevBudget = this.props.annualBudget || this.props.annualBudgetArray.reduce((a, b) => a + b, 0);
      let planDate = this.props.planDate.split('/');
      let firstMonth = parseInt(planDate[0]) - 1;

      let budget = [];
      if (this.state.isDivideEqually) {
        let numOfMonth = 12;
        const value = Math.round(prevBudget / numOfMonth);
        while (numOfMonth--) {
          budget.push(value);
        }
      }
      else {
        this.budgetWeights.forEach((element, index) => {
          budget[(index + 12 - firstMonth) % 12] = Math.round(element * prevBudget);
        });
      }
      this.props.updateState({annualBudget: prevBudget, annualBudgetArray: budget});
    }
    else {
      this.props.updateState({annualBudget: null});
    }
  }

  render() {
    const {budgetConstraints, annualBudgetArray, calculatedData: {objectives: {objectivesData}}, actualIndicators, historyData: {indicators}, objectives} = this.props;

    const isChannelOptionDisabled = channel => this.props.blockedChannels.includes(channel) || this.props.inHouseChannels.includes(channel) || Object.keys(budgetConstraints).includes(channel);

    const channels = {
      select: {
        name: 'channels',
        options: formatChannels(isChannelOptionDisabled)
      }
    };

    let maxChannels = (value) => {
      if (value.options) {
        value.options.map(maxChannels);
      }
      else {
        value.disabled = true;
        return value;
      }
    };

    // Deep copy
    const blockedChannels = JSON.parse(JSON.stringify(channels));
    // We allow only 3 blocked channels.
    if (this.props.blockedChannels.length >= 3) {
      // Disable all options
      blockedChannels.select.options.map(maxChannels);
    }

    const dates = getDates(this.props.planDate);

    const objectiveViews = objectivesData
      .sort((item1, item2) => item1.priority - item2.priority)
      .map((item, index) =>
        <ObjectiveView key={item.indicator}
                       index={index}
                       actualIndicators={actualIndicators[item.indicator]}
                       historyIndicators={map(indicators, item.indicator)}
                       isQuarterly={item.recurrentType === 'quarterly'}
                       objectives={objectives}
                       isDirectionUp={getMetadata('isDirectionUp', item.indicator)}
                       {...item}
                       editObjective={() => {
                         this.setState({
                           objectivePopupData: {
                             hidden: false,
                             objectiveMonth: item.monthIndex,
                             objective: item.indicator,
                             objectiveEdit: true
                           }
                         });
                       }}
                       onDrag={this.changeObjectivePriority}
                       deleteObjective={() => {
                         this.objectiveRemove(item.indicator, item.monthIndex);
                       }}/>);

    const indicatorsWithProps = getIndicatorsWithProps();
    const filteredObjectives = Object.keys(indicatorsWithProps)
      .filter(indicatorKey => indicatorsWithProps[indicatorKey].isObjective &&
        !objectivesData.find(item => item.indicator ===
          indicatorKey &&
          (this.state.objectivePopupData.objective
            ? item.indicator !== this.state.objectivePopupData.objective
            : true)));
    const sortedFilteredObjectives = sortBy(filteredObjectives, [key => indicatorsWithProps[key].group, key => indicatorsWithProps[key].orderInGroup]);
    const objectiveOptions = sortedFilteredObjectives
      .map(indicatorKey => {
        return {value: indicatorKey, label: indicatorsWithProps[indicatorKey].nickname};
      });
    const budgetConstraintsChannels = Object.keys(budgetConstraints);

    return <div>
      <Page popup={isPopupMode()}
            className={!isPopupMode() ? this.classes.static : null}
            contentClassName={this.classes.content}
            innerClassName={this.classes.pageInner}
            width='100%'>
        <Title title="Preferences"
               subTitle='What are your marketing goals and constrains? Different objectives dictate different strategies'/>
        <div className={this.classes.error}>
          <label hidden={!this.props.serverDown}>Something is wrong... Let us check what is it and fix it for you
            :)</label>
        </div>
        <div className={this.classes.cols}>
          <div className={this.classes.colLeft}>
            {/**
             <div className={ this.classes.row } style={{
              width: '258px'
            }}>
             <Label question>Start Date</Label>
             <Calendar />
             </div> **/}
            <div className={this.classes.row}>
              <Label checkbox={this.state.isCheckAnnual} onChange={this.toggleBudgetsCheck.bind(this)} question={['']}
                     ref='annualBudget'
                     description={['What is your marketing budget for the next 12 months?']}>Plan Annual Budget
                ($)</Label>
              <div className={this.classes.cell}>
                <Textfield disabled={!this.state.isCheckAnnual}
                           value={'$' +
                           (this.props.annualBudget ? this.props.annualBudget.toString()
                             .replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '')}
                           onChange={this.handleChangeBudget.bind(this, 'annualBudget')} style={{
                  width: '166px'
                }}/>
                <Label className={preferencesStyle.locals.divideEqually} checkbox={this.state.isDivideEqually}
                       onChange={this.handleBudgetDivideChange.bind(this)}>Divide Equally</Label>
                {/** <NotSure style={{
                  marginLeft: '10px'
                }} /> **/}
              </div>
            </div>
            <div className={this.classes.row}>
              <Label checkbox={!this.state.isCheckAnnual} onChange={this.toggleBudgetsCheck.bind(this)}
                     question={['']}
                     description={['What is your marketing budget for the next 12 months?']}>Plan Monthly Budgets
                ($)</Label>
              {this.state.isCheckAnnual ? null : this.monthBudgets()}
            </div>
            {/**
             <div className={ this.classes.row } style={{
              // maxWidth: '440px',
              // minWidth: '200px',
              width: '258px'
            }}>
             <Select { ... selects.plan } />
             </div>
             **/}
            <div className={this.classes.row} style={{}}>
              <Label style={{
                marginBottom: '12px',
                fontWeight: '600'
              }} question={['']}
                     description={['Define your objectives / targets for marketing. The objectives should be:\n- Specific\n- Measurable\n- Attainable\n- Realistic\n- Time-Bound']}>Objectives</Label>
              {objectiveViews}
              <div className={preferencesStyle.locals.addObjective} onClick={() => {
                this.setState({
                  objectivePopupData: {
                    hidden: false,
                    objectiveEdit: false,
                    objective: null,
                    objectiveMonth: null
                  }
                });
              }}/>
              {
                <AddObjectivePopup
                  hidden={this.state.hidden}
                  objectives={this.props.objectives}
                  {...this.state.objectivePopupData}
                  numOfObjectives={objectivesData.length}
                  close={() => {
                    this.setState({
                      objectivePopupData: {
                        hidden: true,
                        objectiveEdit: false,
                        objective: null,
                        objectiveMonth: null
                      }
                    });
                  }}
                  dates={dates}
                  objectivesOptions={objectiveOptions}
                  createOrUpdateObjective={this.createOrUpdateObjective}
                  actualIndicators={this.props.actualIndicators}
                  forecastedIndicators={this.props.forecastedIndicators}
                  historyData={this.props.historyData}
                />
              }
            </div>
            <FeatureToggle featureName="plannerAI">
              <div>
                <div className={preferencesStyle.locals.advancedButton} onClick={() => {
                  this.setState({showAdvancedFields: !this.state.showAdvancedFields});
                }}>
                  Advanced
                </div>
                <div hidden={!this.state.showAdvancedFields}>
                  <div className={this.classes.row}>
                    <Label style={{fontSize: '20px', fontWeight: 'bold'}}>Channel Constraints (Optional)</Label>
                    <Notice warning style={{
                      margin: '12px 0'
                    }}>
                      * Please notice that adding channel constrains is limiting the InfiniGrow’s ideal planning engine.
                    </Notice>
                  </div>
                  <div className={this.classes.row}>
                    <Label question={['']}
                           description={['Do you want to limit the number of channels in your plan (in parallel, for each month)? \nTo set the number to max available channels, please leave it blank.']}>max
                      number of Channels</Label>
                    <div className={this.classes.cell}>
                      <Textfield value={this.props.maxChannels != -1 ? this.props.maxChannels : ''}
                                 onChange={this.handleChangeMax.bind(this, '')} style={{
                        width: '83px'
                      }}/>
                      {/** <NotSure style={{
                  marginLeft: '10px'
                }} /> **/}
                    </div>
                  </div>
                  <div className={this.classes.row}>
                    <Label question={['']}
                           description={['Are there any channels that you’re going to use in any case? Please provide their min/max budgets.']}>
                      Monthly Budget Constraints
                    </Label>
                    <MultiRow numOfRows={budgetConstraintsChannels.length} rowRemoved={this.budgetConstraintRemove}>
                      {({index, data, update, removeButton}) => {
                        return <div className={preferencesStyle.locals.channelsRow}>
                          <ChannelsSelect
                            style={{width: '230px'}}
                            selected={budgetConstraintsChannels[index]}
                            isChannelDisabled={isChannelOptionDisabled}
                            onChange={this.addBudgetConstraintChannel.bind(this, index)}
                          />
                          <Range
                            disabled={!budgetConstraintsChannels[index]}
                            step={50}
                            allowSameValues={true}
                            minValue={0}
                            maxValue={Math.min(...annualBudgetArray)}
                            value={budgetConstraints[budgetConstraintsChannels[index]]
                              ? budgetConstraints[budgetConstraintsChannels[index]].range
                              : {
                                min: 0,
                                max: -1
                              }}
                            onChange={this.handleRangeChange.bind(this, index)}
                          />
                          <div style={{marginLeft: '25px', alignSelf: 'center'}}>
                            {removeButton}
                          </div>
                        </div>;
                      }}
                    </MultiRow>
                  </div>
                  <div className={this.classes.row}>
                    <MultiSelect {...channels} selected={this.props.inHouseChannels}
                                 onChange={this.handleChangeInHouseChannels.bind(this)} label='In-house Channels'
                                 labelQuestion={['']}
                                 description={['Are there any channels that you don’t want InfiniGrow to allocate budgets to because you’re doing them in-house?']}/>
                  </div>
                  <div className={this.classes.row}>
                    <MultiSelect {...blockedChannels} selected={this.props.blockedChannels}
                                 onChange={this.handleChangeBlockedChannels.bind(this)} label='Blocked Channels'
                                 labelQuestion={['']}
                                 description={['From your experience at the company, are there any channels that you want to block InfiniGrow from using in your marketing planning? \n * Maximum allowed # of blocked channels: 3']}/>
                  </div>
                </div>
              </div>
            </FeatureToggle>
          </div>

          {isPopupMode() ?

            <div className={this.classes.colRight}>
              <div className={this.classes.row}>
                <ProfileProgress progress={101} image={
                  require('assets/flower/5.png')
                }
                                 text="Seems you got some new super powers. Now the journey for GROWTH really begins!"/>
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
            <div className={this.classes.almostFooter}>
              <label hidden={!this.state.validationError} style={{color: 'red'}}>
                {this.state.validationError}
              </label>
            </div>
            <BackButton onClick={() => {
              this.props.updateUserMonthPlan(this.getDataToUpdate(), this.props.region, this.props.planDate)
                .then(() => {
                  history.push('/settings/attribution/setup');
                });
            }}/>
            <div style={{width: '30px'}}/>
            <Button type="primary" onClick={() => {
              const validationText = this.validate();
              if (!validationText) {
                // If user didn't define any objectives, open objectives popup
                if (!this.props.objectives.find(item => Object.keys(item).length > 0)) {
                  this.setState({
                    objectivePopupData: {
                      hidden: false,
                      objectiveEdit: false,
                      objective: null,
                      objectiveMonth: null
                    }
                  });
                }
                else {
                  this.props.updateUserMonthPlan(this.getDataToUpdate(), this.props.region, this.props.planDate)
                    .then(() => {
                      history.push('/build-first-plan');
                    });
                }
              }
              else {
                this.setState({validationError: validationText});
              }
            }
            }>
              Build your first budget
            </Button>
          </div>

          :
          <div className={this.classes.footer}>
            <div className={this.classes.almostFooter}>
              <label hidden={!this.state.validationError} style={{color: 'red'}}>
                {this.state.validationError}
              </label>
            </div>
            <SaveButton onClick={() => {
              const validationText = this.validate();
              this.setState({validationError: validationText});

              if (!validationText) {
                this.setState({saveFail: false, saveSuccess: false});
                this.props.updateUserMonthPlan(this.getDataToUpdate(), this.props.region, this.props.planDate);
                this.setState({saveSuccess: true});
              }
              else {
                this.setState({saveFail: true});
              }
            }} success={this.state.saveSuccess} fail={this.state.saveFail}/>
          </div>
        }
      </Page>
    </div>;
  }
};
