import React from 'react';
import PropTypes from 'prop-types';
import {formatNumberWithDecimalPoint} from 'components/utils/budget';
import GeneratedImpact from 'components/pages/analyze/GeneratedImpact';
import Select from 'components/controls/Select';
import styles from 'styles/analyze/analyze.css';

const classes = styles.locals;

const ImpactByMarketing = ({categoryData, indicator, metricsOptions, onIndicatorChange}) => (
  <div className={classes.rows}>
    <GeneratedImpact
      data={categoryData}
      valuesFormatter={formatNumberWithDecimalPoint}
      title="Marketing-Generated Business Impact"
    >
      <div className={classes.select}>
        <div className={classes.selectLabel}>Conversion goal</div>
        <Select
          selected={indicator}
          select={{
            options: metricsOptions
          }}
          onChange={onIndicatorChange}
          style={{
            width: '143px',
            marginLeft: '10px',
            fontWeight: 500
          }}
        />
      </div>
    </GeneratedImpact>
  </div>
);

ImpactByMarketing.defaultProps = {
  categoryData: []
};

ImpactByMarketing.propTypes = {
  categoryData: PropTypes.arrayOf(PropTypes.shape({})),
  indicator: PropTypes.string,
  metricsOptions: PropTypes.arrayOf(PropTypes.shape({})),
  onIndicatorChange: PropTypes.func
};

export default ImpactByMarketing;
