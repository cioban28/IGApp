import React, { Component } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import {
    formatBudgetShortened,
    formatNumberWithDecimalPoint,
} from 'components/utils/budget';
import { getNickname } from 'components/utils/indicators';

import StatSquare from 'components/common/StatSquare';

import styles from 'styles/analyze/analyze.css';

const classes = styles.locals;

class StatsSquares extends Component {
    getStatSquareData() {
        const { totalCost, totalPipeline, totalRevenue } = this.props;

        return [
            {
                title: 'Total Cost',
                stat: `$${formatBudgetShortened(totalCost)}`,
                iconUrl: '/assets/analyze-icons/stat-total-cost.svg',
            },
            {
                title: 'Total Pipeline Revenue',
                stat: `$${formatBudgetShortened(totalPipeline)}`,
                iconUrl: '/assets/analyze-icons/stat-total-pipeline.svg',
            },
            {
                title: 'Pipeline ROI',
                stat: `${formatNumberWithDecimalPoint(
                    totalCost ? totalPipeline / totalCost : 0,
                )}x`,
                iconUrl: '/assets/analyze-icons/stat-pipeline-roi.svg',
            },
            {
                title: 'Total Revenue',
                stat: `$${formatBudgetShortened(totalRevenue)}`,
                iconUrl: '/assets/analyze-icons/stat-total-revenue.svg',
            },
            {
                title: 'Revenue ROI',
                stat: `${formatNumberWithDecimalPoint(
                    totalCost ? totalRevenue / totalCost : 0,
                )}x`,
                iconUrl: '/assets/analyze-icons/stat-revenue-roi.svg',
            },
        ];
    }

    render() {
        const { costPerFunnel } = this.props;

        return (
            <React.Fragment>
                <div className={classNames(classes.stats, classes.rows)}>
                    {this.getStatSquareData().map(statProps => (
                        <StatSquare
                            className={classes.statSquare}
                            containerClassName={classes.statSquareContainer}
                            key={statProps.title}
                            {...statProps}
                        />
                    ))}
                </div>
                <div className={classNames(classes.stats, classes.rows)}>
                    {Object.keys(costPerFunnel).map(indicator => (
                        <StatSquare
                            key={indicator}
                            title={`Cost per ${getNickname(indicator, true)}`}
                            stat={costPerFunnel[indicator]}
                            className={classes.statSquare}
                            containerClassName={classes.statSquareContainer}
                            iconText={getNickname(indicator, true)}
                        />
                    ))}
                </div>
            </React.Fragment>
        );
    }
}

StatsSquares.propTypes = {
    costPerFunnel: PropTypes.shape({}),
    totalCost: PropTypes.number,
    totalPipeline: PropTypes.number,
    totalRevenue: PropTypes.number,
};

export default StatsSquares;
