import React from 'react';
import Component from 'components/Component';
import popupStyle from 'styles/welcome/add-member-popup.css';
import Label from 'components/ControlsLabel';
import Select from 'components/controls/Select';
import Toggle from 'components/controls/Toggle';
import {isPopupMode} from 'modules/popup-mode';
import NotSure from 'components/onboarding/NotSure';
import Button from 'components/controls/Button';
import Page from 'components/Page';
import style from 'styles/onboarding/onboarding.css';
import navStyle from 'styles/profile/market-fit-popup.css';

import CurrentString from 'components/pages/preferences/addObjectiveComponents/CurrentString';
import StartBySelect from 'components/pages/preferences/addObjectiveComponents/StartBySelect';
import CurrentStringRecurrent from 'components/pages/preferences/addObjectiveComponents/CurrentStringRecurrent';
import PrevValueString from 'components/pages/preferences/addObjectiveComponents/PrevValueString';
import RecurrentYearDropDown from 'components/pages/preferences/addObjectiveComponents/RecurrentYearDropDown';
import AmountTextField from 'components/pages/preferences/addObjectiveComponents/AmountTextField';
import DirectionText from 'components/pages/preferences/addObjectiveComponents/DirectionText';
import TypeSelect from 'components/pages/preferences/addObjectiveComponents/TypeSelect';
import CustomObjectives from 'components/pages/preferences/addObjectiveComponents/CustomObjectives';
import ExpectedString from 'components/pages/preferences/addObjectiveComponents/ExpectedString';
import DateRangeSelectors from 'components/pages/preferences/addObjectiveComponents/DateRangeSelectors';
import {getCurrentMonth, getCurrentQuarter, getCurrentValue, getPrevValue} from 'components/utils/objective';


export default class AddObjectiveComponent extends Component {
  style = style;
  styles = [popupStyle, navStyle];

  openNotSurePopup = () => {
    const {indicator, changeNotSureStep} = this.props;
    if (!indicator) this.refs.indicator.focus();
    if (!!indicator) changeNotSureStep(1);
  };

  render() {
    const {
      notSure, isFirstObjective, indicator,
      metrics, selectMetric,
      priority, priorities, selectPriority,
      isRecurrent, frequencies, selectFrequency,
      isTarget, objectiveTypes, selectObjectiveType,
      recurrentType, recurrentTypes, selectRecurrentType,
      quarter, quarterSelect,
      month, monthSelect,
      selectYear, dates, startDateSelect,
      monthIndex, endDateSelect,
      amount, setAmount,
      isPercentage, typeOptions, selectType,
      close, submit, objectiveEdit,
      predictedValues, customYearsValues, customYear,
      updateCustomValue,
      directionText,
      targetValue, selectCustom,
      isCustom, startMonthIndex, historyData, actualIndicators
    } = this.props;

    if (!!notSure) return null;
    return (
      <Page
        popup={true}
        width={'410px'}
        contentClassName={popupStyle.locals.content}
        innerClassName={popupStyle.locals.inner}>
        <div className={popupStyle.locals.title}>
          {isFirstObjective ?
            <div>Add Your Main Objective
              <div className={popupStyle.locals.subTitle}>what's your end-goal for the marketing org?</div>
            </div> :
            <div>Add Objective</div>
          }
        </div>
        <div className={this.classes.row}>
          <Label>
            Choose metric as objective
          </Label>
          <div style={{display: 'flex'}}>
            <Select
              selected={indicator}
              select={{
                placeholder: 'KPI',
                options: metrics
              }}
              onChange={selectMetric}
              style={{width: '200px'}}
              ref='indicator'
            />
            <CurrentString
              indicator={indicator}
              isReccurent={isRecurrent}
              isCustom={isCustom}
              startMonthIndex={startMonthIndex}
              historyData={historyData}
              actualIndicators={actualIndicators}
              classes={this.classes}
            />
          </div>
        </div>
        <div className={this.classes.row}>
          <Label>
            Priority
          </Label>
          <Select
            selected={priority}
            select={{
              options: priorities
            }}
            onChange={selectPriority}
            style={{width: '75px'}}
          />
        </div>
        <div className={this.classes.row} style={{display: 'flex'}}>
          <Toggle
            options={frequencies}
            selectedValue={isRecurrent}
            onClick={(e) => {
              selectFrequency(e);
            }}/>
        </div>
        {isRecurrent ?
          <div className={this.classes.row} style={{display: 'flex'}}>
            <Toggle
              options={recurrentTypes}
              selectedValue={recurrentType}
              onClick={(e) => {
                selectRecurrentType(e);
              }}/>
          </div>
          :
          <div className={this.classes.row} style={{display: 'flex'}}>
            <Toggle
              options={objectiveTypes}
              selectedValue={isTarget}
              onClick={(e) => {
                selectObjectiveType(e);
              }}/>
          </div>
        }

        {/* Start by select when recurrent */}
        {isRecurrent &&
        <>
          <div style={{marginBottom: 20, display: 'flex', alignItems: 'center'}}>
            <div>
              {`Start by `}
            </div>
            <div style={{zIndex: 30, marginLeft: 10}}>
              <StartBySelect
                recurrentType={recurrentType}
                quarter={quarter}
                quarterSelect={quarterSelect}
                month={month}
                monthSelect={monthSelect}
              />
            </div>
          </div>
          <CurrentStringRecurrent
            indicator={indicator}
            recurrentType={recurrentType}
            quarter={quarter}
            historyData={historyData}
            actualIndicators={actualIndicators}
          />
          <PrevValueString
            indicator={indicator}
            recurrentType={recurrentType}
            isRecurrent={isRecurrent}
            isCustom={isCustom}
            historyData={historyData}
          />
        </>
        }

        <div className={this.classes.row}>
          <Label style={{marginBottom: 20, marginTop: 22}}>
            <RecurrentYearDropDown
              isRecurrent={isRecurrent}
              isCustom={isCustom}
              selectYear={selectYear}
              customYear={customYear}
            />
            <div hidden={(isRecurrent || isPopupMode())}>
              <NotSure
                style={{
                  marginLeft: '88px'
                }}
                onClick={this.openNotSurePopup}
              />
            </div>
          </Label>

          {
            isTarget ?
              <AmountTextField
                amount={amount}
                setAmount={setAmount}
              />
              :
              <div style={{display: 'inline-flex'}}>
                <div style={{display: 'flex', alignItems: 'center'}}>
                  <DirectionText
                    indicator={indicator}
                    isRecurrent={isRecurrent}
                    isCustom={isCustom}
                    selectCustom={selectCustom}
                    directionText={directionText}
                  />
                  <TypeSelect
                    isCustom={isCustom}
                    selectedType={isPercentage}
                    typeOptions={typeOptions}
                    selectType={selectType}
                  />
                  {
                    !(isRecurrent && isCustom) &&
                    <AmountTextField
                      amount={amount}
                      setAmount={setAmount}
                    />
                  }
                </div>
              </div>
          }

          <CustomObjectives
            isRecurrent={isRecurrent}
            isCustom={isCustom}
            predictedValues={predictedValues}
            customYearsValues={customYearsValues}
            recurrentType={recurrentType}
            customYear={customYear}
            updateCustomValue={updateCustomValue}
          />

          <ExpectedString
            targetValue={targetValue}
            indicator={indicator}
            isTarget={isTarget}
            isRecurrent={isRecurrent}
            isCustom={isCustom}
            historyData={historyData}
            startMonthIndex={startMonthIndex}
            isPercentage={isPercentage}
            amount={amount}
            fromValue={((recurrentType === 'quarterly' && quarter === getCurrentQuarter()) || (recurrentType === 'monthly' && month === getCurrentMonth())) ? getPrevValue(recurrentType, historyData, indicator) : getCurrentValue(recurrentType, historyData, indicator, actualIndicators, quarter)}
          />

        </div>

        <DateRangeSelectors
          dates={dates}
          startMonthIndex={startMonthIndex}
          startDateSelect={startDateSelect}
          monthIndex={monthIndex}
          endDateSelect={endDateSelect}
          isRecurrent={isRecurrent}
        />

        <div className={this.classes.footerCols}>
          <div className={this.classes.footerLeft}>
            <Button
              type="secondary"
              style={{width: '72px'}}
              onClick={close}>
              Cancel
            </Button>
            <Button
              type="primary"
              style={{width: '110px', marginLeft: '20px'}}
              onClick={submit}>
              {objectiveEdit ? 'Edit' : 'Add'} Objective
            </Button>
          </div>
        </div>
      </Page>
    );
  }
}