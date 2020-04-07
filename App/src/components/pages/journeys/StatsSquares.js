import React from 'react';
import StatSquare from 'components/common/StatSquare';
import PropTypes from 'prop-types';

import styles from 'styles/users/users.css';

const classes = styles.locals;

const StatsSquares = React.memo(({ items }) => {
    return (
        <div className={classes.stats}>
            {items.map(({ title, stat }) => (
                <StatSquare
                    className={classes.statSquare}
                    containerClassName={classes.statSquareContainer}
                    key={title}
                    stat={stat}
                    title={title}
                />
            ))}
        </div>
    );
});

StatsSquares.propTypes = {
    items: PropTypes.arrayOf(
        PropTypes.shape({
            stat: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
            title: PropTypes.string,
        }),
    ),
};

export default StatsSquares;
