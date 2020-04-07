import React from 'react';
import get from 'lodash/get';
import PropTypes from 'prop-types';
import { getAnnualOffset, getQuarterOffset } from 'components/utils/date';

class CommonScroll extends React.PureComponent {
    state = {
        scrollPosition: 0,
    };

    componentDidMount() {
        this.getCurrentMonthToScroll();
    }

    changeScrollPosition = toPosition => {
        this.setState({
            scrollPosition: toPosition,
        });
    };

    getCurrentMonthToScroll() {
        const {
            addQuartersAndYearSumData,
            calculatedData,
            cellWidth,
        } = this.props;
        const pastMonths = get(calculatedData, 'historyData.rawMonths');
        const quarterOffset = getQuarterOffset(pastMonths);
        const annualOffset = getAnnualOffset(pastMonths);
        const monthsWithExtraData = addQuartersAndYearSumData(
            pastMonths,
            null,
            null,
            quarterOffset,
            annualOffset,
        );

        this.setState({
            scrollPosition: monthsWithExtraData.length * cellWidth,
        });
    }

    render() {
        const { children } = this.props;
        const { scrollPosition } = this.state;

        return (
            <React.Fragment>
                {children(scrollPosition, this.changeScrollPosition)}
            </React.Fragment>
        );
    }
}
CommonScroll.propTypes = {
    addQuartersAndYearSumData: PropTypes.func,
    children: PropTypes.func.isRequired,
    cellWidth: PropTypes.number,
    calculatedData: PropTypes.shape({
        historyData: PropTypes.shape({
            rawMonths: PropTypes.array,
        }),
    }),
};

export default CommonScroll;
