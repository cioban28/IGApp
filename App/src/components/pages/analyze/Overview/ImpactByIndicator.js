import React from 'react';
import { FeatureToggle } from 'react-feature-toggles';
import PropTypes from 'prop-types';

import GeneratedImpact from 'components/pages/analyze/GeneratedImpact';
import Select from 'components/controls/Select';

import styles from 'styles/analyze/analyze.css';

const classes = styles.locals;

const ImpactByIndicator = ({
    impactData,
    indicator,
    metricsOptions,
    onIndicatorChange,
}) => (
    <FeatureToggle featureName="marketingVsSales">
        <div className={classes.rows}>
            <GeneratedImpact
                data={impactData}
                title="Marketing vs Sales Impact"
            >
                <div className={classes.select}>
                    <Select
                        selected={indicator}
                        select={{
                            options: metricsOptions,
                        }}
                        onChange={onIndicatorChange}
                        style={{
                            width: '143px',
                            marginLeft: '10px',
                            fontWeight: 500,
                        }}
                    />
                </div>
            </GeneratedImpact>
        </div>
    </FeatureToggle>
);

ImpactByIndicator.defaultProps = {
    impactData: [],
};

ImpactByIndicator.propTypes = {
    impactData: PropTypes.arrayOf(PropTypes.shape({})),
    indicator: PropTypes.string,
    metricsOptions: PropTypes.arrayOf(PropTypes.shape({})),
    onIndicatorChange: PropTypes.func,
};

export default ImpactByIndicator;
