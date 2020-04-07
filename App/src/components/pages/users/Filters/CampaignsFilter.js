import React from 'react';
import Component from 'components/Component';
import Select from 'components/controls/Select';
import { FilterItemTag } from 'components/pages/users/Filters/FilterParts';
import { includeVariants } from 'components/utils/filters';
import CommonFilter, { CommonPropTypes } from 'components/pages/users/Filters/CommonFilter';
import filterStyles from 'styles/users/filters.css';

const styles = filterStyles.locals;

export default class CampaignsFilter extends Component {
  static propTypes = CommonPropTypes

  render() {
    return (
      <CommonFilter {...this.props}>
        {({ config, variant, onSetVariant, selectedOptions, onAddItem, onRemoveItem }) => (
          <>
            <header className={styles.filterHeader}>Find journeys which</header>
            <div className={styles.filterVariant}>
              <Select
                className={styles.filterVariantSelect}
                selected={variant}
                select={{ options: includeVariants }}
                onChange={onSetVariant}
              />
              <span className={styles.filterVariantDesc}>the following campaigns:</span>
            </div>
            <Select
              className={styles.optionsSelect}
              selected={-1}
              onChange={onAddItem}
              select={{
                options: config.options
                  .filter((campaign) => !selectedOptions.includes(campaign))
                  .map((campaign) => ({ value: campaign, label: campaign })),
                optionClassName: styles.option,
              }}
              placeholder="Select campaign..."
            />
            <div className={styles.filterItemTags}>
              {selectedOptions.map((campaign) => (
                <FilterItemTag
                  key={campaign}
                  title={campaign}
                  onRemove={() => onRemoveItem(campaign)}
                />
              ))}
            </div>
          </>
        )}
      </CommonFilter>
    )
  }
}
