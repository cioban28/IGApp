import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip as RechartsTooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { isEmpty } from 'lodash';

import NumberWithArrow from 'components/NumberWithArrow';
import Select from 'components/controls/Select';
import { formatNumber } from 'components/utils/budget';
import { getIndicatorsWithNicknames } from 'components/utils/indicators';

import styles from 'styles/analyze/analyze.css';

const classes = styles.locals;

class HistoricalPerformanceChart extends React.Component {
    static getPerformanceStat = grow => {
        let stat = grow.value;
        if (!grow.isRefreshed) {
            stat += isFinite(grow.percentage)
                ? ` (${Math.abs(grow.percentage)}%)`
                : ' (∞)';
        }
        return stat;
    };

    renderTooltip = data => {
        const { active, label, payload } = data;

        if (active && !isEmpty(payload) && payload[0]) {
            return (
                <div className={classes.performanceChartTooltip}>
                    <div className={classes.performanceChartTooltipLabel}>
                        {label}
                    </div>
                    <div className={classes.performanceChartTooltipValue}>
                        {formatNumber(payload[0].value)}
                    </div>
                </div>
            );
        }
    };

    render() {
        const {
            grow,
            indicator,
            months,
            onIndicatorChange,
            performanceData,
        } = this.props;
        const indicatorsOptions = getIndicatorsWithNicknames();

        return (
            <div
                className={classNames(
                    classes.colAuto,
                    classes.performanceChart,
                )}
            >
                <div className={classes.item}>
                    <div
                        className={classNames(
                            classes.itemTitle,
                            classes.withSelect,
                        )}
                    >
                        Historical Performance
                        <div className={classes.select}>
                            {grow.value && (
                                <NumberWithArrow
                                    stat={HistoricalPerformanceChart.getPerformanceStat(
                                        grow,
                                    )}
                                    isNegative={grow.value < 0}
                                    arrowStyle={{
                                        alignSelf: 'center',
                                        borderWidth: '0px 4px 5px 4px',
                                    }}
                                    statStyle={{
                                        alignSelf: 'center',
                                        fontWeight: '500',
                                    }}
                                />
                            )}
                            <Select
                                selected={indicator}
                                select={{ options: indicatorsOptions }}
                                onChange={onIndicatorChange}
                                style={{ width: '200px', marginLeft: 10 }}
                            />
                        </div>
                    </div>
                    <div className={classes.analyzeChart}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={performanceData}>
                                <defs>
                                    <linearGradient
                                        id="performanceGradient"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >
                                        <stop
                                            offset="5%"
                                            stopColor="#4d91fc"
                                            stopOpacity={0.3}
                                        />
                                        <stop
                                            offset="95%"
                                            stopColor="#4d91fc"
                                            stopOpacity={0.03}
                                        />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="name"
                                    ticks={months}
                                    axisLine={false}
                                    tickLine={false}
                                    tickMargin={10}
                                    tick={{
                                        fontSize: '12px',
                                        color: '#707ea7',
                                    }}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tickMargin={15}
                                    tick={{
                                        fontSize: '12px',
                                        color: '#707ea7',
                                    }}
                                />
                                <CartesianGrid
                                    vertical={false}
                                    strokeDasharray="3 3"
                                    strokeWidth={1}
                                    stroke="rgba(54, 56, 64, 0.1)"
                                />
                                <RechartsTooltip
                                    cursor={false}
                                    offset={0}
                                    content={this.renderTooltip}
                                    animationDuration={500}
                                />
                                <Area
                                    dataKey="value"
                                    type="monotone"
                                    stroke="#4d91fc"
                                    fill="url(#performanceGradient)"
                                    strokeWidth={2.5}
                                    activeDot={{
                                        fill: '#ffffff',
                                        stroke: '#4d91fc',
                                        strokeWidth: 4,
                                        r: 4,
                                    }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        );
    }
}
HistoricalPerformanceChart.defaultProps = {
    grow: {},
    performanceData: [],
};

HistoricalPerformanceChart.propTypes = {
    grow: PropTypes.shape({
        isRefreshed: PropTypes.bool,
        percentage: PropTypes.number,
        value: PropTypes.number,
    }),
    indicator: PropTypes.string,
    months: PropTypes.arrayOf(PropTypes.string),
    onIndicatorChange: PropTypes.func,
    performanceData: PropTypes.arrayOf(PropTypes.shape),
};

export default HistoricalPerformanceChart;
