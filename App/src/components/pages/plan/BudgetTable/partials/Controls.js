import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';

import { classes } from 'components/pages/plan/BudgetTable';

const Controls = React.memo(({ onClick }) => (
    <div className={classes.controls}>
        <button
            className={classNames(
                classes.buttonControls,
                classes.buttonControlsPrev,
            )}
            data-direction="back"
            onClick={onClick}
        >
            <i
                className={classNames(
                    classes.icon,
                    classes.iconControls,
                    classes.iconControlsBack,
                )}
                data-icon="plan:monthNavigation"
            />
        </button>
        <button
            className={classNames(
                classes.buttonControls,
                classes.buttonControlsNext,
            )}
            onClick={onClick}
        >
            <i
                className={classNames(classes.icon, classes.iconControls)}
                data-icon="plan:monthNavigation"
            />
        </button>
    </div>
));

Controls.defaultProps = {
    onClick: () => {},
};

Controls.propTypes = {
    onClick: PropTypes.func,
};

export default Controls;
