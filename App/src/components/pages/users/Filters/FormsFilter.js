import React from 'react';
import Component from 'components/Component';
import Select from 'components/controls/Select';
import { FilterItemTag } from 'components/pages/users/Filters/FilterParts';
import CommonFilter, { CommonPropTypes } from 'components/pages/users/Filters/CommonFilter';
import { includeVariants } from 'components/utils/filters';
import filterStyles from 'styles/users/filters.css';

const styles = filterStyles.locals;

export default class FormsFilter extends Component {
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
              <span className={styles.filterVariantDesc}>the following forms:</span>
            </div>
            <Select
              className={styles.optionsSelect}
              selected={-1}
              onChange={onAddItem}
              select={{
                options: config.options
                  .filter((option) => !selectedOptions.includes(option))
                  .map((option) => ({ label: option, value: option })),
                optionClassName: styles.option,
              }}
              placeholder="Search form..."
            />
            <div className={styles.filterItemTags}>
              {selectedOptions.map((form) => (
                <FilterItemTag
                  key={form}
                  title={form}
                  onRemove={() => onRemoveItem(form)}
                />
              ))}
            </div>
          </>
        )}
      </CommonFilter>
    )
  }
}
