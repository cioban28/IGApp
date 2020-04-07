import React from 'react';
import Component from 'components/Component';
import style from 'styles/dashboard/milestones.css';
import {get} from 'lodash';

export default class Milestones extends Component {
  style = style;

  render() {
    const {classes, cy, color, strokeWidth, radius, width, height, target, milestones, indicatorDisplaySign} = this.props;
    const {milestoneG, clockFace} = this.classes;
    const svgParams = {
      width: width + 50, // + padding-right + padding-left
      height,
      clipPathHeight: height / 2 + 20,
      fontSize: '10px'
    };
    const tickParams = {
      strokeWidth: strokeWidth * 1.05,
      radius: radius + strokeWidth * 0.15,
      lineWidth: 2
    };
    const cx = svgParams.width / 2;
    tickParams.p = 2 * Math.PI * tickParams.radius - tickParams.lineWidth * 2; // circle length
    tickParams.arcStart = tickParams.p / 2 - tickParams.lineWidth; // point, where ticks start

    const tickLines = milestones.reduce((prev, current, index) => {
      const value = get(prev, `${[index - 1]}.text.value`, 0) + current;
      const percent = (100 / target * value) / 100;
      const angle = (1 - percent) * Math.PI; // angle in radians
      prev.push({
        arcLength: percent * tickParams.arcStart + tickParams.arcStart,
        text: {
          value,
          text: current,
          x: (tickParams.radius + 30) * Math.cos(angle) + svgParams.width / 2,
          y: -(tickParams.radius + 15) * Math.sin(angle) + cy,
          textAnchor: percent < 0.4 ? 'start' : (percent > 0.6 ? 'end' : 'middle')
        }
      });
      return prev;
    }, []);

    return <svg style={{position: 'absolute', top: 0, left: 0}} viewBox={`0 -40 ${svgParams.width} ${svgParams.height}`}
                width={svgParams.width} height={svgParams.height}>
      <clipPath id="milestones-cut-off-bottom">
        <rect x="25" y="-20" width={svgParams.width} height={svgParams.clipPathHeight}/>
      </clipPath>
      {/*clock face*/}
      <circle
        cx={cx}
        cy={cy}
        r={radius + strokeWidth}
        strokeWidth={strokeWidth}
        className={clockFace}
        style={{
          stroke: 'transparent',
          clipPath: 'url(#milestones-cut-off-bottom)'
        }}
      />
      {/*ticks and text*/}
      {
        tickLines.map(({text: {x, y, textAnchor, value}, arcLength}, index) => (
          <g className={milestoneG} key={index}>
            <text x={x} y={y} textAnchor={textAnchor} className={classes.current}
                  style={{fontSize: svgParams.fontSize}}>{indicatorDisplaySign}{value}</text>
            <circle
              cx={cx}
              cy={cy}
              r={tickParams.radius}
              strokeWidth={tickParams.strokeWidth}
              style={{
                stroke: color,
                strokeDasharray: `${tickParams.lineWidth} ${arcLength}`,
                clipPath: 'url(#milestones-cut-off-bottom)'
              }}
            />
          </g>
        ))
      }
    </svg>;
  }
};