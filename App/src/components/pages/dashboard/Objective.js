import React from 'react';
import PropTypes from 'prop-types';
import {get, sum, uniqueId} from 'lodash';
import Component from 'components/Component';
import style from 'styles/dashboard/objective.css';
import {formatNumber} from 'components/utils/budget';
import {extractCustomMilestones, extractMilestones} from 'components/utils/objective';
import ObjectiveIcon from 'components/common/ObjectiveIcon';
import {getNumberOfDaysBetweenDates} from 'components/utils/date';
import {getIndicatorDisplaySign, isRefreshed} from 'components/utils/indicators';
import Milestones from 'components/pages/dashboard/Milestones';
import {getColor} from 'components/utils/colors';

export default class Objective extends Component {

  style = style;
  clipId = uniqueId('cut-off-bottom-');

  static propTypes = {
    historyIndicators: PropTypes.array.isRequired,
    actualIndicator: PropTypes.number.isRequired,
    indicator: PropTypes.string.isRequired,
    target: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    timeFrame: PropTypes.instanceOf(Date),
    color: PropTypes.string.isRequired,
    sqSize: PropTypes.number.isRequired,
    strokeWidth: PropTypes.number.isRequired,
    actualValue: PropTypes.number, // actualIndicator for history objectives
    project: PropTypes.any
  };

  static defaultProps = {
    sqSize: 200, // size of the enclosing square
    strokeWidth: 16,
    color: getColor(0),
    objectives: []
  };

  getDaysLeft() {
    const {timeFrame} = this.props;

    const numberOfDays = getNumberOfDaysBetweenDates(timeFrame);
    if (numberOfDays) {
      return `${numberOfDays} days left`;
    }
    return 'Finished!';
  }

  render() {
    const {
      sqSize,
      strokeWidth,
      historyIndicators,
      actualIndicator,
      indicator,
      target,
      title,
      color,
      project,
      actualValue,
      objectives
    } = this.props;

    // SVG centers the stroke width on the radius, subtract out so circle fits in square
    const radius = (sqSize - strokeWidth) / 2;
    // Enclose cicle in a circumscribing square
    const viewBox = `0 0 ${sqSize} ${sqSize}`;
    // Arc length at 100% coverage is the circle circumference
    const dashArray = radius * Math.PI * 2;

    const firstObjective = objectives.find(objective => get(objective, [indicator], []));
    const isQuarterly = get(firstObjective, [indicator, 'userInput', 'recurrentType'], null) === 'quarterly';
    const isRefreshedValue = isRefreshed(indicator);
    let milestones;
    if (isRefreshedValue) {
      milestones = isQuarterly ? extractMilestones(historyIndicators, indicator) : extractCustomMilestones([historyIndicators, indicator], indicator, firstObjective);
    }
    else {
      milestones = [];
    }
    const value = (actualValue || actualIndicator) + sum(milestones);

    // Scale 100% coverage overlay with the actual percent
    const dashOffset = dashArray - dashArray * Math.min(1, value / target) / 2;
    const indicatorDisplaySign = getIndicatorDisplaySign(indicator);

    return (
      <div className={this.classes.inner} style={{position: 'relative'}}>
        <svg
          style={{marginTop: '25px'}}
          width={sqSize * 1.1}
          height={sqSize}
          viewBox={viewBox}>
          <clipPath id={this.clipId}>
            <rect x='0' y='0' width={sqSize} height={sqSize / 2}/>
          </clipPath>
          <circle
            className={this.classes.circleBackground}
            cx={sqSize / 2}
            cy={sqSize / 2}
            r={radius}
            strokeWidth={strokeWidth}
            style={{
              clipPath: `url(#${this.clipId})`
            }}
          />
          <text
            className={this.classes.target}
            x='95%'
            y='50%'
            dy='20px'
            textAnchor='middle'
            alignmentBaseline='text-after-edge'>
            {formatNumber(Math.round(target)) || 0}
          </text>
          <circle
            className={this.classes.circleProgress}
            cx={sqSize / 2}
            cy={sqSize / 2}
            r={radius}
            strokeWidth={`${strokeWidth}px`}
            // Start progress marker at 12 O'Clock
            transform={`rotate(-180 ${sqSize / 2} ${sqSize / 2})`}
            style={{
              strokeDasharray: dashArray,
              strokeDashoffset: dashOffset,
              stroke: color
            }}/>
          <text x='50%' y='35%' textAnchor='middle'>
            <tspan className={this.classes.current}>
              {formatNumber(Math.round(value) || 0)}
            </tspan>
            <tspan className={this.classes.currentMark} dy={-5} dx={2}>
              {indicatorDisplaySign}
            </tspan>
          </text>
          <text className={this.classes.title} x='50%' y='45%' textAnchor='middle'>
            {title}
          </text>
        </svg>
        <Milestones
          classes={this.classes}
          cy={sqSize / 2}
          color={color}
          strokeWidth={strokeWidth}
          radius={radius}
          milestones={milestones}
          width={sqSize * 1.1}
          target={target}
          height={sqSize}
          indicatorDisplaySign={indicatorDisplaySign}
        />
        <div className={this.classes.bottom}>
          <ObjectiveIcon
            project={project}
            target={target}
            value={value}
          />
          <div className={this.classes.progress}>
            <div className={this.classes.progressFill}
                 style={{backgroundImage: `linear-gradient(to right, #e6e8f0, ${color})`}}/>
            <div className={this.classes.timeLeft}>
              {this.getDaysLeft()}
            </div>
          </div>
        </div>
      </div>
    );
  }

}
