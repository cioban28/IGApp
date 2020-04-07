import React from 'react';
import Component from 'components/Component';
import style from 'styles/onboarding/onboarding.css';
import popupStyle from 'styles/welcome/add-member-popup.css';
import {getIndicatorsWithProps, getMetadata} from 'components/utils/indicators';
import navStyle from 'styles/profile/market-fit-popup.css';
import {
  addToCurrentDate,
  extractDatesByQuarter,
  getObjectivesPriority,
  getObjectiveTypes,
  getPrevValue,
  getTypeOptions,
  timeFrameToDate
} from 'components/utils/objective';

import {extractNumber} from 'components/utils/utils';
import {
  createCustomArrays,
  createCustomMonthlyArray,
  createCustomQuarterlyArray
} from 'components/utils/date';
import {isNil, get} from 'lodash';
import moment from 'moment';
import NotSureComponent from 'components/pages/preferences/notSureComponents/NotSureComponent';
import AddObjectiveComponent from 'components/pages/preferences/addObjectiveComponents/AddObjectiveComponent';

const frequencies = [
  {
    text: 'One Time',
    value: false
  },
  {
    text: 'Recurrent',
    value: true
  }
];
const recurrentTypes = [
  {
    text: 'Monthly',
    value: 'monthly'
  },
  {
    text: 'Quarterly',
    value: 'quarterly'
  }
];

export default class AddObjectivePopup extends Component {
  style = style;
  styles = [popupStyle, navStyle];

  defaultData = {
    indicator: '',
    isRecurrent: false,
    recurrentType: 'monthly',
    isPercentage: false,
    isTarget: true,
    amount: '',
    customYearsList: [moment().year(), moment().year() + 1],
    customYear: moment().year(),
    customYearsValues: createCustomArrays(),
    quarter: moment().quarter(),
    month: moment().month(),
    predictedValues: [],
    startMonthIndex: null,
    monthIndex: null,
    recurrentArray: new Array(12).fill(-1),
    isCustom: false
  };

  constructor(props) {
    super(props);
    this.state = {
      ...this.defaultData,
      notSure: 0,
      priority: 0,
      startDate: null
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.hidden !== this.props.hidden) {
      if (!isNil(nextProps.objectiveMonth) && nextProps.objective) {
        const objective = this.props.objectives[nextProps.objectiveMonth][nextProps.objective];
        if (objective) {
          this.setState(state => ({
            indicator: nextProps.objective,
            isRecurrent: objective.userInput.isRecurrent,
            recurrentType: objective.userInput.recurrentType,
            isPercentage: objective.userInput.isPercentage,
            isTarget: objective.userInput.isTarget,
            priority: objective.target.priority,
            amount: objective.userInput.amount,
            recurrentArray: objective.userInput.recurrentArray,
            monthIndex: nextProps.objectiveMonth,
            isCustom: objective.userInput.isCustom,
            startMonthIndex: objective.userInput.startMonthIndex,
            customYearsValues: !objective.userInput.isCustom
              ? state.customYearsValues
              : {
                ...state.customYearsValues,
                [objective.userInput.recurrentType]:
                  this.createCustomArrayFromRecurrentArray(objective.userInput.recurrentType, objective.userInput.recurrentArray)
              }
          }), this.calculateTargetValue, this.recalculateAndSetPredictedValues);
          if (objective.userInput.isRecurrent && !!objective.userInput.quarter && objective.userInput.recurrentType === 'quarterly') this.quarterSelect({value: objective.userInput.quarter});
          if (objective.userInput.isRecurrent && (!!objective.userInput.month || objective.userInput.month === 0) && objective.userInput.recurrentType === 'monthly') this.monthSelect({value: objective.userInput.month});
        }
      }
      else {
        this.setState({
          ...this.defaultData,
          priority: nextProps.numOfObjectives,
          notSure: 0
        });
      }
    }
  }

  createCustomArrayFromRecurrentArray = (type, values) => {
    let resArr;

    if (type === 'monthly') {
      const months = createCustomMonthlyArray();
      resArr = values.map((value, index) => ({
        ...months[index],
        value: (value === -1 || !value) ? '' : value
      }));
    }
    else if (type === 'quarterly') {
      const restMonthsInQuarter = 3 - (moment().month() % 3);
      const blankArr = createCustomQuarterlyArray();
      resArr = blankArr.map((quarter, index) => {
        const value = quarter.year === moment().year()
          ? values[index * 3 + restMonthsInQuarter]
          : values[(4 - moment().quarter() + 1 + index) * 3 + restMonthsInQuarter];

        return {
          ...quarter,
          value: (value === -1 || !value) ? '' : value
        };
      });
    }

    return resArr;
  };

  calculateRecurrentArray = (type, values) => {
    let resArr;

    if (type === 'monthly') {
      resArr = values.map(item => item.value || -1);
    }
    else {
      resArr = new Array(12).fill(-1);

      for (let i = 0; i < values.length; i++) {
        const restMonthsInQuarter = 2 - (moment().month() % 3);
        let value = values[i].value;
        if (value) {
          resArr[i * 3 + restMonthsInQuarter] = value;
        }
      }
    }

    return resArr;
  };

  calculateObjective = () => {
    const d1 = new Date();
    const d2 = timeFrameToDate(this.state.timeFrame);
    let months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth();
    months += d2.getMonth();
    if (months <= 0) {
      months = 0;
    }
    if (months > 11) {
      months = 11;
    }
    const value = Math.round((this.props.forecastedIndicators[months][this.state.indicator].committed -
      this.props.actualIndicators[this.state.indicator]) *
      this.state.aggressiveLevel +
      this.props.actualIndicators[this.state.indicator]);
    this.setState({
      amount: value,
      targetValue: value,
      isPercentage: false,
      direction: 'equals',
      monthIndex: months,
      notSure: 3
    });
  };

  calculateTargetValue() {
    const isDirectionUp = this.state.indicator && getMetadata('isDirectionUp', this.state.indicator);
    let targetValue;
    if (this.state.isTarget) {
      targetValue = this.state.amount;
    }
    else if (this.state.isPercentage) {
      targetValue =
        (1 + (this.state.amount / 100 * (isDirectionUp ? 1 : -1))) * this.props.actualIndicators[this.state.indicator];
    }
    else {
      const indicator = this.props.actualIndicators[this.state.indicator] || 0;
      targetValue = indicator + (this.state.amount * (isDirectionUp ? 1 : -1));
    }

    if (targetValue) {
      this.setState({targetValue: Math.round(targetValue)});
    }

    this.setState(state => ({
      predictedValues: this.calculatePredictedValues(state.customYearsValues[state.recurrentType])
    }));
  }

  calculatePredictedValues = (values) => {
    const predictedValues = [];
    const indicatorValue = getPrevValue(this.state.recurrentType, this.props.historyData, this.state.indicator) || 0;

    if (typeof indicatorValue === 'number') {
      let lastValue = indicatorValue;
      const isDirectionUp = this.state.indicator && getMetadata('isDirectionUp', this.state.indicator);

      values.forEach((customField, index) => {
        if (customField.value) {
          let predictedValue;

          if (this.state.isPercentage && !this.state.isCustom) {
            predictedValue = lastValue * ((isDirectionUp ? 100 + customField.value : 100 - customField.value) / 100);
          }
          else {
            predictedValue = lastValue + (customField.value * (isDirectionUp ? 1 : -1));
          }

          predictedValue = Math.floor(predictedValue);
          predictedValues[index] = predictedValue;
          lastValue = predictedValue;
        }
      });
    }

    return predictedValues;
  };

  // use as setState callback
  recalculateAndSetPredictedValues = () => {
    this.setState(state => ({
      predictedValues: this.calculatePredictedValues(state.customYearsValues[state.recurrentType])
    }));
  };

  updateCustomValue = (value, index) => {
    this.setState(state => {
      const updatedArr = [...state.customYearsValues[state.recurrentType]];
      updatedArr[index] = {
        ...updatedArr[index],
        value: extractNumber(value)
      };

      return {
        ...state,
        customYearsValues: {
          ...state.customYearsValues,
          [state.recurrentType]: updatedArr
        },
        predictedValues: this.calculatePredictedValues(updatedArr),
        recurrentArray: this.calculateRecurrentArray(state.recurrentType, updatedArr)
      };
    });
  };

  changeNotSureStep = (step) => {
    this.setState({notSure: step});
  };

  setTimeFrame = (timeFrame) => {
    this.setState({timeFrame: timeFrame});
  };

  setAggressiveLevel = (aggressiveLevel) => {
    this.setState({aggressiveLevel: aggressiveLevel});
  };

  saveNotSurePopupData = () => {
    this.setState({notSure: 0, aggressiveLevel: ''}, () => {
      this.props.createOrUpdateObjective(this.state,
        this.props.objectiveMonth,
        this.props.objective);
    });
  };

  resetNotSurePopupData = () => {
    this.setState({
      amount: '',
      isPercentage: '',
      direction: '',
      notSure: 0,
      aggressiveLevel: '',
      timeFrame: ''
    });
  };

  selectMetric = (e) => {
    this.setState({indicator: e.value}, this.calculateTargetValue);
  };

  selectPriority = (e) => {
    this.setState({priority: parseInt(e.value)});
  };

  selectFrequency = (value) => {
    this.setState({isRecurrent: value, isTarget: !value}, this.calculateTargetValue);
    if (!value) {
      this.startDateSelect({value: 0}); // set start date on current month
      this.endDateSelect({value: 0}); // set timeframe on current month
    }
  };

  selectObjectiveType = (value) => {
    this.setState({isTarget: value}, this.calculateTargetValue);
  };

  selectRecurrentType = (value) => {
    this.setState({recurrentType: value}, this.recalculateAndSetPredictedValues);
    if (this.state.isRecurrent && value === 'quarterly') this.quarterSelect({value: this.state.quarter});
    if (this.state.isRecurrent && value === 'monthly') this.monthSelect({value: this.state.month});
  };

  quarterSelect = ({value}) => {
    const currentQuarter = moment().quarter();
    const forQuarter = value - currentQuarter;
    const {startDate, endDate} = extractDatesByQuarter(forQuarter);
    const now = new Date();
    this.startDateSelect({value: startDate.getMonth() - now.getMonth()});
    this.endDateSelect({value: endDate.getMonth() - now.getMonth()});
    this.setState({quarter: value});
  };

  monthSelect = ({value}) => {
    this.setState({month: value});
    const indexDifference = value - new Date().getMonth();
    this.startDateSelect({value: indexDifference});
    this.endDateSelect({value: indexDifference});
  };

  selectYear = (e) => {
    this.setState({customYear: e.value}, this.calculateTargetValue);
  };

  startDateSelect = (e) => {
    const startDate = addToCurrentDate(e.value, true);
    this.setState({startMonthIndex: e.value, startDate});
  };

  endDateSelect = (e) => {
    const timeFrame = addToCurrentDate(e.value, false);
    this.setState({monthIndex: e.value, timeFrame});
  };

  setAmount = (e) => {
    this.setState({amount: parseInt(e.target.value || 0) || ''}, this.calculateTargetValue);
  };

  selectType = (e) => {
    const {value} = e;
    if (value === 'custom') {
      this.setState({isCustom: true});
    }
    else {
      this.setState({isPercentage: e.value, isCustom: false}, this.calculateTargetValue);
    }
  };

  selectCustom = (e) => {
    this.setState({isCustom: e.value});
  };

  submit = () => {
    this.props.createOrUpdateObjective(this.state, this.props.objectiveMonth, this.props.objective);
  };

  render() {
    const {indicator, isRecurrent} = this.state;
    const {actualIndicators, hidden} = this.props;
    if (hidden) return null;

    const indicatorsWithProps = getIndicatorsWithProps();
    const directionText = !!get(indicatorsWithProps, `[${indicator}].isDirectionUp`, '') ? 'Increase' : 'Decrease';
    const objectivesPriority = getObjectivesPriority(this.props.numOfObjectives);
    const isFirstObjective = this.props.numOfObjectives === 0;
    const typeOptions = getTypeOptions(actualIndicators[indicator], isRecurrent);
    const objectiveTypes = getObjectiveTypes(directionText);

    return (
      <div hidden={this.props.hidden}>
        <AddObjectiveComponent
          notSure={this.state.notSure}
          isFirstObjective={isFirstObjective}
          indicator={this.state.indicator}
          metrics={this.props.objectivesOptions}
          selectMetric={this.selectMetric}
          priority={this.state.priority}
          priorities={objectivesPriority}
          selectPriority={this.selectPriority}
          isRecurrent={this.state.isRecurrent}
          frequencies={frequencies}
          selectFrequency={this.selectFrequency}
          isTarget={this.state.isTarget}
          objectiveTypes={objectiveTypes}
          selectObjectiveType={this.selectObjectiveType}
          recurrentType={this.state.recurrentType}
          recurrentTypes={recurrentTypes}
          selectRecurrentType={this.selectRecurrentType}
          quarter={this.state.quarter}
          quarterSelect={this.quarterSelect}
          month={this.state.month}
          monthSelect={this.monthSelect}
          selectYear={this.selectYear}
          changeNotSureStep={this.changeNotSureStep}
          startDateSelect={this.startDateSelect}
          monthIndex={this.state.monthIndex}
          endDateSelect={this.endDateSelect}
          dates={this.props.dates}
          amount={this.state.amount}
          setAmount={this.setAmount}
          isPercentage={this.state.isPercentage}
          typeOptions={typeOptions}
          selectType={this.selectType}
          close={this.props.close}
          submit={this.submit}
          objectiveEdit={this.props.objectiveEdit}
          directionText={directionText}
          targetValue={this.state.targetValue}
          selectCustom={this.selectCustom}
          predictedValues={this.state.predictedValues}
          customYear={this.state.customYear}
          customYearsValues={this.state.customYearsValues}
          updateCustomValue={this.updateCustomValue}
          startMonthIndex={this.state.startMonthIndex}
          historyData={this.props.historyData}
          actualIndicators={this.props.actualIndicators}
          isCustom={this.state.isCustom}
        />
        <NotSureComponent
          notSure={this.state.notSure}
          changeStep={this.changeNotSureStep}
          timeFrame={this.state.timeFrame}
          setTimeFrame={this.setTimeFrame}
          aggressiveLevel={this.state.aggressiveLevel}
          setAggressiveLevel={this.setAggressiveLevel}
          indicator={this.state.indicator}
          calculateObjective={this.calculateObjective}
          amount={this.state.amount}
          reset={this.resetNotSurePopupData}
          submit={this.saveNotSurePopupData}
        />
      </div>
    );
  }
};