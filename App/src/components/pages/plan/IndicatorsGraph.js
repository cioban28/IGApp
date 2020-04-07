import React from 'react';
import classnames from 'classnames';
import Component from 'components/Component';
import {Area, AreaChart, CartesianGrid, ReferenceDot, Tooltip, XAxis, YAxis} from 'recharts';
import style from 'styles/plan/indicators-graph.css';
import onboardingStyle from 'styles/onboarding/onboarding.css';
import {formatIndicatorDisplay, getIndicatorsWithProps} from 'components/utils/indicators';
import {formatBudgetShortened} from 'components/utils/budget';
import isEqual from 'lodash/isEqual';
import CustomCheckbox from 'components/controls/CustomCheckbox';
import isNil from 'lodash/isNil';
import get from 'lodash/get';
import findIndex from 'lodash/findIndex';
import {shouldUpdateComponent} from 'components/pages/plan/planUtil';
import ObjectiveIcon from 'components/common/ObjectiveIcon';
import {getColor} from 'components/utils/colors';
import {projectObjective} from 'components/utils/objective';
import throttle from 'lodash/throttle';

const DASHED_OPACITY = '0.7';
const DASHED_KEY_SUFFIX = '_DASEHD';
const TOOLTIP_VALUE_SUFFIX = '_TOOLTIP';
const ACCUMULATIVE_VALUE_SUFFIX = '_ACCUM';

export default class IndicatorsGraph extends Component {

  style = style;
  styles = [onboardingStyle];
  areas = {}; // area refs

  constructor(props) {
    super(props);

    const initialIndicators = this.getInitialIndicators(this.props);
    this.state = {
      checkedIndicators: initialIndicators ? initialIndicators : [],
      activeTooltipIndex: 0,
      tooltipPosition: 0
    };
  }

  componentDidMount() {
    this.refs.chart.addEventListener('scroll', throttle(this.handleScroll, 100));
  }

  componentWillUnmount() {
    this.refs.chart.removeEventListener('scroll', this.handleScroll);
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.parsedObjectives, this.props.parsedObjectives)) {
      const objectives = this.getInitialIndicators(nextProps);
      if (objectives) {
        this.setState({
          checkedIndicators: objectives
        });
      }
    }
    if (!isNil(nextProps.scrollPosition)) {
      this.refs.chart.scrollLeft = nextProps.scrollPosition;
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    return shouldUpdateComponent(nextProps, nextState, this.props, this.state, 'scrollPosition');
  }

  handleScroll = () => {
    this.props.changeScrollPosition(this.refs.chart.scrollLeft);
  };

  handleMouseMove = ({activeTooltipIndex}) => {
    if (this.areas && Number.isInteger(activeTooltipIndex) && this.state.activeTooltipIndex !== activeTooltipIndex) {
      this.setState({
        activeTooltipIndex,
        tooltipPosition: Math.min(
          ...Object.values(this.areas)
            .filter((a) => !!a)
            .map((a) => a.props.points[activeTooltipIndex].y)
        )
      });
    }
  };

  getInitialIndicators = (props) => {
    const objectives = Object.keys(props.parsedObjectives);
    const objective = objectives && objectives[0];
    return objective ? [objective] : null;
  };

  toggleCheckbox = (indicator) => {
    let checkedIndicators = [...this.state.checkedIndicators];
    const index = checkedIndicators.indexOf(indicator);
    if (index !== -1) {
      checkedIndicators.splice(index, 1);
    }
    else {
      checkedIndicators.push(indicator);
    }
    this.setState({checkedIndicators: checkedIndicators});
  };

  getTooltipContent = () => {
  };

  getAreasData = () => {
    const forecastingData = [];
    const numberOfPastDates = this.props.numberOfPastDates;
    const pastLabelDates = this.props.labelDates.slice(0, numberOfPastDates);
    const futureLabelDates = this.props.labelDates.slice(numberOfPastDates);
    const pastTooltipDates = this.props.preiodDates.slice(0, numberOfPastDates);
    const futureTooltipDates = this.props.preiodDates.slice(numberOfPastDates);
    const mainFutureData = this.props.mainLineData.slice(numberOfPastDates);
    const pastIndicators = this.props.mainLineData.slice(0, numberOfPastDates);
    const dashedLineData = this.props.dashedLineData && this.props.dashedLineData.slice(numberOfPastDates);
    const futureObjectiveAccumulative = this.props.objectiveAccumulativeData &&
      this.props.objectiveAccumulativeData.slice(numberOfPastDates);

    pastIndicators.forEach(({indicators: month}, index) => {
      const json = {};
      Object.keys(month).forEach(key => {
        json[key] = month[key].graphValue;
        json[key + TOOLTIP_VALUE_SUFFIX] = month[key].tooltipValue;

        if (dashedLineData) {
          json[key + DASHED_KEY_SUFFIX] = json[key];
          json[key + DASHED_KEY_SUFFIX + TOOLTIP_VALUE_SUFFIX] = json[key + TOOLTIP_VALUE_SUFFIX];
        }
      });

      forecastingData.push({
        ...json,
        name: pastLabelDates[index].value,
        tooltipDate: pastTooltipDates[index].value
      });
    });

    mainFutureData.forEach(({indicators: month}, monthIndex) => {
      const json = {};

      Object.keys(month).forEach(key => {
        json[key] = month[key].graphValue;
        json[key + TOOLTIP_VALUE_SUFFIX] = month[key].tooltipValue;

        const accumulativeObjectiveValue = get(futureObjectiveAccumulative, [monthIndex, key], null);
        json[key + ACCUMULATIVE_VALUE_SUFFIX] = accumulativeObjectiveValue;
      });

      if (dashedLineData) {
        const dashedIndicators = dashedLineData[monthIndex].indicators;
        Object.keys(dashedIndicators).forEach((key) => {
          json[key + DASHED_KEY_SUFFIX] = dashedIndicators[key].graphValue;
          json[key + DASHED_KEY_SUFFIX + TOOLTIP_VALUE_SUFFIX] = dashedIndicators[key].tooltipValue;
        });
      }

      forecastingData.push({
        ...json,
        name: futureLabelDates[monthIndex] && futureLabelDates[monthIndex].value,
        tooltipDate: futureTooltipDates[monthIndex] && futureTooltipDates[monthIndex].value
      });

    });

    // duplicate first element values so we can match indicator table's width
    // n table columns === n + 1 graph ticks
    // remove name attribute so it won't show tooltip on hover
    forecastingData.unshift({...forecastingData[0], name: undefined});

    return forecastingData;
  };

  getObjectiveIconFromData = (objectiveData, currentValue = objectiveData.value) => {
    const {committedForecasting} = this.props.calculatedData;
    const project = projectObjective(committedForecasting, objectiveData);
    return <div className={this.classes.objectiveIcon}>
      <ObjectiveIcon target={objectiveData.target}
                     value={currentValue}
                     project={project}/>
    </div>;
  };

  render() {
    const indicators = getIndicatorsWithProps();
    const {parsedObjectives, floating} = this.props;
    const {tooltipPosition} = this.state;
    const indicatorsMapping = {};
    Object.keys(indicators)
      .filter(item => indicators[item].isObjective)
      .forEach(item =>
        indicatorsMapping[item] = indicators[item].nickname
      );

    const areaData = this.getAreasData();
    const areaHeight = floating ? 230 : 400;

    const {collapsedObjectives} = this.props.calculatedData.objectives;
    const menuItems = Object.keys(indicatorsMapping).map((indicator, index) => {
      const objectiveIndex = findIndex(collapsedObjectives, (item) => {
        return item.indicator === indicator;
      });

      const objectiveIcon = objectiveIndex > -1
        ? <div>
          {this.getObjectiveIconFromData(collapsedObjectives[objectiveIndex])}
        </div>
        : null;

      return <div className={this.classes.menuItem} key={indicator}>
        <CustomCheckbox checked={this.state.checkedIndicators.indexOf(indicator) !== -1}
                        onChange={() => this.toggleCheckbox(indicator)}
                        className={this.classes.label}
                        checkboxStyle={{
                          backgroundColor: getColor(index)
                        }}>{indicatorsMapping[indicator]}</CustomCheckbox>
        {objectiveIcon}
      </div>;
    });

    const defs = this.state.checkedIndicators.map(indicator => {
      const index = Object.keys(indicatorsMapping).indexOf(indicator);
      return <defs key={indicator}>
        <linearGradient id={indicator} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={getColor(index)} stopOpacity={0.2}/>
          <stop offset="100%" stopColor={getColor(index)} stopOpacity={0}/>
        </linearGradient>
      </defs>;
    });

    const areas = this.state.checkedIndicators.map((indicator) => {
      const index = Object.keys(indicatorsMapping).indexOf(indicator);
      return <Area key={indicator}
                   ref={ref => this.areas[indicator] = ref}
                   isAnimationActive={false}
                   type='monotone'
                   dataKey={indicator}
                   stroke={getColor(index)}
                   fill={`url(#${indicator})`}
                   fillOpacity={1}
                   strokeWidth={2}/>;
    });

    const dashedAreas = this.state.checkedIndicators.map((indicator) => {
      const index = Object.keys(indicatorsMapping).indexOf(indicator);
      return <Area key={indicator + 1}
                   type='monotone'
                   isAnimationActive={false}
                   dataKey={indicator + DASHED_KEY_SUFFIX}
                   stroke={getColor(index)}
                   strokeWidth={2}
                   fill='transparent'
                   strokeDasharray="7 11"
                   style={{opacity: DASHED_OPACITY}}
      />;
    });

    const CustomizedLabel = ({viewBox}) => viewBox.x >= 0 && viewBox.y >= 0 && (
      <image x={viewBox.x} y={viewBox.y} width="24" height="24" href="/assets/objective-dot.svg"/>
    );

    const dots = this.state.checkedIndicators.map((indicator, index) =>
      parsedObjectives[indicator] &&
      <ReferenceDot {...parsedObjectives[indicator].parsedData}
                    fill="none"
                    stroke="none"
                    key={index}
                    label={<CustomizedLabel/>}
                    ifOverflow="extendDomain"
                    isFront={true}/>
    );

    const tooltip = (data) => {
      const currentIndex = areaData.findIndex(month => month.name === data.label);
      if (data.active && data.payload && data.payload.length > 0 && currentIndex !== -1) {
        const parsedIndicators = data.payload.filter((item) => !item.dataKey.includes(DASHED_KEY_SUFFIX))
          .map((item) => {
            const secondaryItem = data.payload.find((secondaryItem) => secondaryItem.dataKey ==
              item.dataKey +
              DASHED_KEY_SUFFIX);

            const tooltipValue = item.payload[item.dataKey + TOOLTIP_VALUE_SUFFIX];
            const secondaryTooltipValue = secondaryItem &&
              secondaryItem.payload[secondaryItem.dataKey + TOOLTIP_VALUE_SUFFIX];

            const accumulativeObjectiveValue = item.payload[item.dataKey + ACCUMULATIVE_VALUE_SUFFIX];
            return {
              ...item,
              tooltipValue: tooltipValue,
              secondaryTooltipValue: secondaryTooltipValue,
              accumulativeObjectiveValue: accumulativeObjectiveValue
            };
          });

        const tooltipTimePeriod = areaData[currentIndex].tooltipDate;

        return (
          <div className={classnames(
            this.classes.customTooltip,
            currentIndex === 0 && this.classes.firstItemTooltip,
            currentIndex === areaData.length - 1 && this.classes.lastItemTooltip
          )}>
            <div className={this.classes.customTooltipHeader}>
              {tooltipTimePeriod}
            </div>
            {

              parsedIndicators.map((item, index) => {
                const showLegend = !!item.secondaryTooltipValue;
                const indicator = item.dataKey;
                const colorIndex = Object.keys(indicatorsMapping).indexOf(indicator);
                const indicatorColor = getColor(colorIndex);
                if (item.value && !item.dataKey.includes(DASHED_KEY_SUFFIX)) {
                  return <div key={index} style={{display: 'flex', flexDirection: 'column'}}>
                    <div className={this.classes.customTooltipIndicator}>
                      {indicatorsMapping[indicator]}
                    </div>
                    <div className={this.classes.customTooltipValues}>
                      <div className={this.classes.valueClass}>
                        {showLegend ? <div className={this.classes.tooltipLegend}
                                           style={{borderColor: indicatorColor}}/> : null}
                        <div className={this.classes.customTooltipValue}
                             style={{color: indicatorColor}}>
                          {formatIndicatorDisplay(indicator, item.tooltipValue)}
                        </div>
                      </div>
                      {item.secondaryTooltipValue ?
                        <div className={this.classes.valueClass}>
                          {showLegend ? <div className={this.classes.tooltipLegend}
                                             style={{
                                               borderColor: indicatorColor,
                                               opacity: DASHED_OPACITY,
                                               borderStyle: 'dashed'
                                             }}/> : null}
                          <div className={this.classes.customTooltipValue}
                               style={{
                                 color: indicatorColor,
                                 opacity: DASHED_OPACITY
                               }}>
                            {formatIndicatorDisplay(indicator, item.secondaryTooltipValue)}
                          </div>
                        </div> : null
                      }
                    </div>
                    {parsedObjectives[indicator] ?
                      <div className={this.classes.customTooltipObjective}>
                        Objective Progress:
                        <div className={this.classes.customTooltipProgress}>
                          {item.tooltipValue ? formatIndicatorDisplay(indicator, item.tooltipValue) : 0} / {formatIndicatorDisplay(
                          indicator,
                          parsedObjectives[indicator].rawData.target)}
                          {this.getObjectiveIconFromData(parsedObjectives[indicator].rawData,
                            item.tooltipValue)}
                        </div>
                      </div>
                      : null}
                  </div>;
                }
              })
            }
          </div>
        );
      }
      return null;
    };

    const xAxis = (
      <XAxis dataKey="name"
             tick={<CustomizedTick/>}
             tickLine={false}
             interval={0}
      />
    );

    // chart width should be equal to table width
    // n of data * cell width (minus last duplicate)
    const chartWidth = this.props.cellWidth * (areaData.length - 1);

    return <div className={classnames(this.classes.inner, {[this.classes.floating]: floating})}>
      <div className={this.classes.menu}>
        <div className={this.classes.menuTitle}>
          Forecasting
        </div>
        <div className={this.classes.menuItems}>
          {menuItems}
        </div>
      </div>
      <div className={this.classes.chart}>
        <CustomizedLegend hidden={!this.props.dashedLineData}/>
        <div className={this.classes.chartScroller} ref='chart'>
          <AreaChart
            className={this.classes.chartContent}
            data={areaData} height={areaHeight} width={chartWidth}
            margin={{top: 10, right: 0, left: 0, bottom: 21}}
            onMouseMove={this.handleMouseMove}
          >
            <CartesianGrid vertical={false} stroke='#EBEDF5' strokeWidth={1}/>
            {xAxis}
            {dots}
            <Tooltip
              content={tooltip}
              offset={0}
              position={{y: tooltipPosition}}
            />
            {defs}
            {areas}
            {dashedAreas}
          </AreaChart>
        </div>
        {/* area with fixed position and hidden content, except y-axis */}
        <AreaChart
          className={this.classes.fixedChartOverlay}
          data={areaData} height={areaHeight} width={chartWidth}
          margin={{top: 10, right: 0, left: 0, bottom: 21}}
        >
          {xAxis}
          {dots}
          {areas}
          {dashedAreas}
          <YAxis axisLine={false}
                 tickLine={false}
                 stroke="white"
                 tickFormatter={formatBudgetShortened}
                 tick={{fontSize: '14px', fill: '#b2bbd5', fontWeight: 600, letterSpacing: '0.1px'}}
                 tickMargin={21}
                 domain={['auto', 'auto']}/>
        </AreaChart>
      </div>
    </div>;
  }
};

class CustomizedLegend extends Component {

  style = style;

  render() {
    return this.props.hidden ? null :
      <div className={this.classes.legend} style={{display: 'flex'}}>
        <div style={{display: 'flex'}}>
          <div className={this.classes.legendIcon}/>
          <div className={this.classes.legendText}>
            Committed
          </div>
        </div>
        <div style={{display: 'flex'}}>
          <div className={this.classes.legendIconDashed}/>
          <div className={this.classes.legendText}>
            Alternative Scenario
          </div>
        </div>
      </div>;
  }
};

class CustomizedTick extends Component {

  style = style;

  render() {
    const {x, y, payload, visibleTicksCount} = this.props;
    return (
      <g transform={`translate(${x},${y})`}>
        <text
          x={0}
          y={0}
          dy={16}
          textAnchor={visibleTicksCount === payload.index + 1 ? 'end' : 'start'}
          className={this.classes.customTick}
        >{payload.value}</text>
      </g>
    );
  };
};
