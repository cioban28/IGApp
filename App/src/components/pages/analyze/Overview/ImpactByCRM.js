import React from 'react';
import PropTypes from 'prop-types';

import FiltersPanel from 'components/pages/users/Filters/FiltersPanel';
import GeneratedImpact from 'components/pages/analyze/GeneratedImpact';
import Select from 'components/controls/Select';

import styles from 'styles/analyze/analyze.css';

const classes = styles.locals;

const CRMCacheKey = Symbol('CRM');

const ImpactByCRM = ({
    crmData,
    filters,
    groupBy,
    indicator,
    location,
    metricsOptions,
    onFiltersChange,
    onGroupByChange,
    onIndicatorChange,
    filterConfigs,
}) => (
    <div className={classes.rows}>
        <GeneratedImpact data={crmData} title="Impact by custom CRM data">
            <div className={classes.select}>
                <div className={classes.selectLabel}>Conversion goal</div>
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
                        marginRight: '15px',
                    }}
                />
                <div className={classes.selectLabel}>Group by</div>
                <Select
                    selected={groupBy}
                    select={{
                        options: [
                            { value: 'product', label: 'Product' },
                            { value: 'region', label: 'Region' },
                            {
                                value: 'external_lead_source',
                                label: 'CRM Lead Source',
                            },
                        ],
                    }}
                    onChange={onGroupByChange}
                    style={{
                        width: '143px',
                        marginLeft: '10px',
                        fontWeight: 500,
                    }}
                />
            </div>
            <FiltersPanel
                className={classes.crmFilters}
                filters={filters}
                onFiltersChange={onFiltersChange}
                filterConfigs={filterConfigs}
                location={location}
                cacheKey={CRMCacheKey}
            />
        </GeneratedImpact>
    </div>
);

ImpactByCRM.defaultProps = {
    crmData: [],
};

ImpactByCRM.propTypes = {
    crmData: PropTypes.arrayOf(PropTypes.shape({})),
    groupBy: PropTypes.string,
    indicator: PropTypes.string,
    metricsOptions: PropTypes.arrayOf(PropTypes.shape({})),
    onIndicatorChange: PropTypes.func,
};

export default ImpactByCRM;
