import React from 'react';

import styles from 'styles/plan/budget-table-v2.css';
import reactTablesStylesOverride from 'styles/global/budget-table-v2-react-table.css';
import reactTablesStyles from 'react-table/react-table.css';

import ScrollableContainer from 'components/pages/plan/BudgetTable/partials/ScrollableContainer';
import Table from 'components/pages/plan/BudgetTable/partials/Table';

const classes = styles.locals;

class BudgetsTable extends React.Component {
    componentDidMount() {
        reactTablesStyles.use();
        styles.use();
        reactTablesStylesOverride.use();
    }

    componentWillUnmount() {
        reactTablesStyles.unuse();
        styles.unuse();
        reactTablesStylesOverride.unuse();
    }

    render() {
        const {
            changeScrollPosition,
            scrollPosition,
            cellWidth,
            ...restProps
        } = this.props;

        return (
            <ScrollableContainer
                cellWidth={cellWidth}
                changeScrollPosition={changeScrollPosition}
                scrollPosition={scrollPosition}
            >
                <Table cellWidth={cellWidth} {...restProps} />
            </ScrollableContainer>
        );
    }
}

BudgetsTable.defaultProps = {
    data: [],
    dates: [],
    numberOfPastDates: 0,
};

BudgetsTable.propTypes = {};

export { classes };
export default BudgetsTable;
