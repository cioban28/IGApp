import React from 'react';
import Component from 'components/Component';

const TOP_DEFAULT_OFFSET = 12;
const RECT_HEIGHT = 20;
const TOP_MINIMUM_OFFSET = 3;
const RECT_WIDTH = 50;

export default class RechartBarLabel extends Component {
  render() {
    const {x, y, height, width, label} = this.props;

    const xOffset = Math.round((width - RECT_WIDTH) / 2);
    const topCalculatedOffset = height > (TOP_DEFAULT_OFFSET * 2 + RECT_HEIGHT)
      ? TOP_DEFAULT_OFFSET
      : Math.round((height - RECT_HEIGHT) / 2);
    return topCalculatedOffset > TOP_MINIMUM_OFFSET
      ? <svg>
        <rect
          x={x + xOffset}
          y={y + topCalculatedOffset}
          fill="#979797"
          width={RECT_WIDTH}
          height={RECT_HEIGHT}
        />
        <text
          x={x + xOffset + 25}
          y={y - 20 + topCalculatedOffset}
          dy={34}
          fontSize='11'
          fill='#ffffff'
          textAnchor="middle">
          {label}
        </text>
      </svg>
      : null
  }
}