import React, { Fragment } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';

import NumberWithArrow from 'components/NumberWithArrow';
import Popup from 'components/Popup';
import Objective from 'components/pages/dashboard/Objective';
import OverviewTable from 'components/pages/analyze/OverviewTable';
import { getNickname as getIndicatorNickname } from 'components/utils/indicators';
import { projectObjective } from 'components/utils/objective';


import styles from 'styles/analyze/analyze.css';

const classes = styles.locals;

class HistoryOverviewTable extends React.Component {
    state = {
        objectivePopupIndex: null
    };

    showObjectivePopup = (index) => () => {
      this.setState({ objectivePopupIndex: index });
    };
  
    hideObjectivePopup = () => {
      this.setState({ objectivePopupIndex: null });
    };  

    getObjectiveFormattedDate(date) {
        const today = moment();
        const yesterday = moment().subtract(1, 'day');
        if (moment(date).isSame(today, 'day')) {
            return 'Today';
        } else if (moment(date).isSame(yesterday, 'day')) {
            return 'Yesterday';
        } else {
            return moment(date).format('MMMM D, YYYY');
        }
    };

    getColumns = () => {
        const {
            committedForecasting,
            indicators,
            actualIndicators
        } = this.props;
        const { objectivePopupIndex } = this.state;
        return [
            {
                id: 'Objective',
                header: 'Objective',
                cell: (objective, row) => (
                    <Fragment>
                        <button
                            type="button"
                            onClick={this.showObjectivePopup(row.index)}
                            className={classes.objectiveCell}
                        >
                            {getIndicatorNickname(objective.indicator)}
                        </button>
                        <Popup
                            onClose={this.hideObjectivePopup}
                            hidden={objectivePopupIndex !== row.index}
                            className={classes.objectivePopup}
                        >
                        <Objective
                            historyIndicators={indicators.map(o => o.indicator)}
                            actualIndicator={actualIndicators[objective.indicator] || 0}
                            indicator={objective.indicator}
                            target={objective.target}
                            title={getIndicatorNickname(objective.indicator)}
                            timeFrame={objective.dueDate}
                            actualValue={objective.value}
                            project={projectObjective(committedForecasting, objective)}
                        />
                        </Popup>
                    </Fragment>
                ),
                minWidth: 90,
                className: classes.titleColumn
            },
      
            {
                id: 'Result',
                header: 'Result',
                cell: ({ value, target }) => (
                    <div>
                        {value}
                        <span style={{ color: '#707ea7', marginLeft: 4 }}>
                            out of {target}
                        </span>
                    </div>
                ),
                minWidth: 90,
            },
            {
                id: 'Delta',
                header: 'Delta',
                cell: ({ value, target }) => {
                    const grow = Math.round(value - target);

                    return (
                        <div>
                            {grow ? (
                                <NumberWithArrow
                                    stat={Math.abs(grow)}
                                    isNegative={grow < 0}
                                    arrowStyle={{
                                        alignSelf: 'center',
                                        borderWidth: '0px 4px 5px 4px',
                                    }}
                                    statStyle={{
                                        alignSelf: 'center',
                                        fontWeight: '500',
                                    }}
                                />
                            ) : (
                                <div
                                    className={dashboardStyle.locals.checkMark}
                                />
                            )}
                        </div>
                    );
                },
            },
            {
                id: 'Date',
                header: 'Date',
                cell: ({ dueDate }) => this.getObjectiveFormattedDate(dueDate),
                className: classes.dateColumn,
            },
        ];
    };

    render() {
        const { data } = this.props;

        return (
            <OverviewTable
                title="Objectives - Planned vs Actual"
                data={data}
                columns={this.getColumns()}
            />
        );
    };
}

HistoryOverviewTable.defaultProps = {
    data: [],
};

HistoryOverviewTable.propTypes = {
    data: PropTypes.arrayOf(PropTypes.shape).isRequired,
    committedForecasting: PropTypes.arrayOf(PropTypes.object).isRequired,
    indicators: PropTypes.arrayOf(PropTypes.object).isRequired,
    actualIndicators: PropTypes.object.isRequired
};

export default HistoryOverviewTable;
