import React from 'react';
import Component from 'components/Component';
import style from 'styles/plan/annual-tab.css';
import planStyles from 'styles/plan/plan.css';
import icons from 'styles/icons/plan.css';
import IndicatorsGraph from 'components/pages/plan/IndicatorsGraph';
import {
  getEndOfMonthString,
  getQuarterOffset,
  getRawDatesSpecific,
  formatSpecificDate,
  getAnnualOffset
} from 'components/utils/date';
import BudgetsTableV2 from 'components/pages/plan/BudgetTable';
import FloatingComponent from 'components/controls/FloatingComponent';
import {isNil, sumBy, union, last, orderBy, groupBy, isEmpty, isPlainObject, get, chunk, mapValues, set} from 'lodash';
import {newFunnelMapping} from 'components/utils/utils';
import Toggle from 'components/controls/Toggle';
import {projectObjective} from 'components/utils/objective';
import CommonScroll from 'components/pages/plan/CommonScroll';

const CELL_WIDTH = 140;

export default class AnnualTab extends Component {

  style = style;
  styles = [planStyles, icons];

  static defaultProps = {
    actualIndicators: {},
    planDate: '',
    events: [],
    objectives: [],
    annualBudgetArray: []
  };

  constructor(props) {
    super(props);
    this.state = {
      hoverRow: void 0,
      showSumData: true
    };
  }

    addExtraSumDataAndFormatDates = (dates, quarterOffset, annualOffset, formatDateFunc) => {
    const quarterDate = quarterData => {
      const date = quarterData[0];
      const quarterNumber = Math.floor((date.getMonth() / 3)) + 1;
      const yearStr = date.getFullYear().toString().substr(2, 2);
      return {value: `Q${quarterNumber} ${yearStr}`, isQuarter: true};
    };

    const annualDate = (annualData) => {
      const date = annualData[0];
      const yearStr = date.getFullYear().toString();
      return {value: `FY ${yearStr}`, isAnnual: true};
    };

    return this.addQuartersAndYearSumData(dates,
      quarterDate,
      annualDate,
      quarterOffset,
      annualOffset,
      formatDateFunc);
  };

  formatAndAddExtraData = (array, chunkFormattingData, itemInQuarterMap = (item) => {
    return item;
  }) => {
    const chunkFormattingDataWithOffset = chunkFormattingData.filter(({offset}) => !isNil(offset));
    const chunksAddition = union(...chunkFormattingDataWithOffset.map(({offset, itemsInChunk, chunkAdditionFormatter},
                                                                       grouperIndex) => {
      const chunkSplit = [array.slice(0, offset),
        ...chunk(array.slice(offset), itemsInChunk)];

      const mapChunk = (chunk) => chunk.map((chunk, index) => {
        return {
          putAfter: (offset + index * itemsInChunk - 1),
          value: chunkAdditionFormatter && chunkAdditionFormatter(chunk),
          orderIndex: grouperIndex
        };
      });

      // If does not need to add to last chunk
      if ((array.length - offset) % itemsInChunk !== 0) {
        return mapChunk(chunkSplit.slice(0, chunkSplit.length - 1));
      }
      else {
        return mapChunk(chunkSplit);
      }
    }));

    const orderedChunksAddition = orderBy(chunksAddition, 'orderIndex');
    const groupedAdditions = groupBy(orderedChunksAddition, 'putAfter');
    const parsedArray = array.map((item, index) => {
      const valueOfItem = itemInQuarterMap(item);
      return isPlainObject(valueOfItem)
        ? {...valueOfItem, realIndex: index}
        : {value: valueOfItem, realIndex: index};
    });

    let arrayWithAddition = parsedArray;
    Object.keys(groupedAdditions).forEach(putAfter => {
      const additions = groupedAdditions[putAfter];
      const putAfterIndex = arrayWithAddition.findIndex(item => get(item, 'realIndex', null) == putAfter);
      arrayWithAddition =
        [...arrayWithAddition.slice(0, putAfterIndex + 1),
          ...additions.map(item => item.value),
          ...arrayWithAddition.slice(putAfterIndex + 1)];
    });

    return arrayWithAddition;
  };

  addQuartersAndYearSumData = (array,
                               quarterSumFunc,
                               annualSumFunc,
                               quarterOffset,
                               annualOffset,
                               itemParseFunc) => {

    if (isEmpty(array)) {
      return [];
    }
    else {
      return this.formatAndAddExtraData(array, this.state.showSumData ?
        [
          {offset: quarterOffset, itemsInChunk: 3, chunkAdditionFormatter: quarterSumFunc},
          {offset: annualOffset, itemsInChunk: 12, chunkAdditionFormatter: annualSumFunc}
        ] : [], itemParseFunc);
    }
  };

  render() {
    const {budgetsData, editMode, interactiveMode, secondaryPlanForecastedIndicators, primaryPlanForecastedIndicators, calculatedData, historyData: {indicators}, planDate, editCommittedBudget, changeBudgetConstraint, setRef, deleteChannel, openAddChannelPopup, userRegions, addRegionToChannel, onPageScrollEventRegister} = this.props;
    const {objectives: {collapsedObjectives}, committedForecasting} = calculatedData;

    const showSecondaryIndicatorGraph = secondaryPlanForecastedIndicators &&
      secondaryPlanForecastedIndicators.length > 0;

    const parsedObjectives = {};
    collapsedObjectives
      .forEach(objective => {
        const target = objective.target;
        const date = objective.dueDate;
        const endOfMonth = getEndOfMonthString(date);
        parsedObjectives[objective.indicator] = {parsedData: {x: endOfMonth, y: target}, rawData: {...objective}};
      });

    const numberOfPastDates = budgetsData && budgetsData.filter((month) => month.isHistory).length;
    const dates = budgetsData && getRawDatesSpecific(planDate,
      numberOfPastDates,
      budgetsData.length - numberOfPastDates);
    const quarterOffset = getQuarterOffset(dates);
    const annualOffset = getAnnualOffset(dates);

    const datesWithAddition = dates &&
      this.addExtraSumDataAndFormatDates(dates, quarterOffset, annualOffset, item => formatSpecificDate(item, false));

    const sumBudgetsData = (chunk) => {
      const channelsInChunk = union(...chunk.map(month => Object.keys(month.channels)));
      const chunkSummedChannels = {};
      channelsInChunk.forEach(channel => {
        const primaryBudget = sumBy(chunk, month => {
          return get(month, ['channels', channel, 'primaryBudget'], 0);
        });
        const secondaryBudget = sumBy(chunk, month => {
          return get(month, ['channels', channel, 'secondaryBudget'], 0);
        });

        const regionsInChannel = union(...chunk.map(
          month => Object.keys(get(month, ['channels', channel, 'regions'], {}))
        ));

        const summedRegions = {};
        regionsInChannel && regionsInChannel.forEach(region => {
          summedRegions[region] = sumBy(chunk, month => get(month, ['channels', channel, 'regions', region], 0));
        });

        chunkSummedChannels[channel] = {primaryBudget, secondaryBudget, regions: summedRegions};
      });

      return {channels: chunkSummedChannels, isHistory: last(chunk).isHistory};
    };

    const addBudgetQuarterData = (chunk) => {
      return {...sumBudgetsData(chunk), isQuarter: true};
    };

    const addAnnualBudgetData = (chunk) => {
      return {...sumBudgetsData(chunk), isAnnual: true};
    };

    const dataWithSumAddition = budgetsData &&
      this.addQuartersAndYearSumData(budgetsData, addBudgetQuarterData, addAnnualBudgetData,
        quarterOffset, annualOffset);

    const numberOfPastDatesWithSumAddition = dataWithSumAddition &&
      dataWithSumAddition.filter((item) => item.isHistory).length;
    const datesForGraphWithPeriodMonths = dates && this.addExtraSumDataAndFormatDates(dates,
      quarterOffset, annualOffset,
      item => getEndOfMonthString(item));

    const objectiveAccumulatedData = dates && new Array(dates.length).fill(null);
    objectiveAccumulatedData &&
    collapsedObjectives
      .forEach(objective => {
        for (let i = 0; i <= objective.monthIndex; i++) {
          set(objectiveAccumulatedData,
            [numberOfPastDates + i, objective.indicator],
            projectObjective(committedForecasting, objective, i));
        }
      });

    const objectiveAccumulatedDataWithAddedData = objectiveAccumulatedData &&
      this.addQuartersAndYearSumData(objectiveAccumulatedData,
        quarterData => last(quarterData),
        yearlyData => last(yearlyData),
        quarterOffset,
        annualOffset,
        item => item);

    const forecastingDataForChunk = (chunk) => {
      const indicators = Object.keys(last(chunk));
      const summedIndicators = {};
      indicators.forEach(indicator => {
        const summedValue = newFunnelMapping[indicator]
          ? sumBy(chunk, month => month[indicator])
          : last(chunk)[indicator];

        summedIndicators[indicator] = {
          graphValue: last(chunk)[indicator],
          tooltipValue: summedValue
        };
      });

      return summedIndicators;
    };

    const addQuarterDataForForecasting = (quarterData) => {
      return {indicators: forecastingDataForChunk(quarterData), isQuarter: true};
    };

    const addAnnualDataForForecasting = (annualData) => {
      return {indicators: forecastingDataForChunk(annualData), isAnnual: true};
    };

    const parseRegularMonthForForecasting = (month) => {
      return {
        indicators: mapValues(month, (value) => {
          return {graphValue: value, tooltipValue: value};
        }),
        isQuarter: false,
        isAnnual: false
      };
    };

    const pastIndicators = indicators;
    const parseForecastingIndicators = (forecasting) => {
      return this.addQuartersAndYearSumData([...pastIndicators,
          ...forecasting.map(month => mapValues(month, indicator => indicator.committed))],
        addQuarterDataForForecasting, addAnnualDataForForecasting,
        quarterOffset, annualOffset,
        parseRegularMonthForForecasting);
    };

    const primaryDataWithSumAddition = dates &&
      parseForecastingIndicators(primaryPlanForecastedIndicators);

    const secondaryDataWithSumAddition = dates && secondaryPlanForecastedIndicators &&
      parseForecastingIndicators(secondaryPlanForecastedIndicators);

    return <div>
      <div className={this.classes.wrap}>
        <div className={this.classes.innerBox}>
          <div className={this.classes.quarterlySumToggle}>
            <div className={this.classes.quarterlySumLabel}>Q/Y Sums</div>
            <Toggle options={[{value: true, text: 'Show'}, {value: false, text: 'Hide'}]}
                    selectedValue={this.state.showSumData}
                    onClick={(value) => {
                      this.setState({showSumData: value});
                    }}
            />
          </div>
          <CommonScroll
              calculatedData={calculatedData}
              cellWidth={CELL_WIDTH}
              addQuartersAndYearSumData={this.addQuartersAndYearSumData}
          >
              {(scrollPosition, changeScrollPosition) => (
                  <React.Fragment>
                      <BudgetsTableV2
                          cellWidth={CELL_WIDTH}
                          changeScrollPosition={changeScrollPosition}
                          data={dataWithSumAddition}
                          dates={datesWithAddition}
                          deleteChannel={deleteChannel}
                          editCommittedBudget={editCommittedBudget}
                          isEditMode={editMode}
                          numberOfPastDates={numberOfPastDatesWithSumAddition}
                          openAddChannelPopup={openAddChannelPopup}
                          scrollPosition={scrollPosition}
                          changeBudgetConstraint={changeBudgetConstraint}
                          isConstraintsEnabled={interactiveMode}
                      />
                      <div className={this.classes.indicatorsGraph}>
                          <FloatingComponent popup={interactiveMode} shownText={'Forecast'}>
                              <IndicatorsGraph parsedObjectives={parsedObjectives}
                                               dimensions={this.state.graphDimensions}
                                               changeScrollPosition={changeScrollPosition}
                                               scrollPosition={scrollPosition}
                                               cellWidth={CELL_WIDTH}
                                               mainLineData={(showSecondaryIndicatorGraph
                                                   ? secondaryDataWithSumAddition
                                                   : primaryDataWithSumAddition) || []}
                                               dashedLineData={showSecondaryIndicatorGraph ? primaryDataWithSumAddition : null}
                                               labelDates={datesForGraphWithPeriodMonths || []}
                                               preiodDates={datesWithAddition || []}
                                               numberOfPastDates={numberOfPastDatesWithSumAddition || 0}
                                               objectiveAccumulativeData={objectiveAccumulatedDataWithAddedData || []}
                                               calculatedData={calculatedData}
                              />
                          </FloatingComponent>
                      </div>
                  </React.Fragment>
              )}
              </CommonScroll>
        </div>
      </div>
    </div>;
  }
}