import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import Component from 'components/Component';
import Select from 'components/controls/Select';
import { FilterActions, FilterItemTag } from 'components/pages/users/Filters/FilterParts';
import { ConfigPropType, FilterPropType, includeVariants } from 'components/utils/filters';
import filterStyles from 'styles/users/filters.css';

const styles = filterStyles.locals;

export default class MultiFieldFilter extends Component {
  static propTypes = {
    className: PropTypes.string,
    config: ConfigPropType.isRequired,
    currentFilter: FilterPropType,
    onCancel: PropTypes.func.isRequired,
    onAddFilter: PropTypes.func.isRequired,
  }

  state = {
    fieldIndex: get(this.props.currentFilter, 'data.fieldIndex', 0),
    variant: get(this.props.currentFilter, 'data.variant', 0),
    selectedOptions: get(this.props.currentFilter, 'data.selectedOptions', []),
  }

  handleFilterApply = () => {
    this.props.onAddFilter({
      kind: this.props.config.kind,
      data: {
        fieldIndex: this.state.fieldIndex,
        variant: this.state.variant,
        selectedOptions: this.state.selectedOptions,
      },
    })
  }

  setFilterFieldIndex = (e) =>
    this.setState({
      fieldIndex: this.props.config.fieldKey.indexOf(e.value),
      selectedOptions: [],
    })

  setFilterVariant = (e) =>
    this.setState({
      variant: e.value,
    })

  addCustomField = (e) =>
    this.setState(({ selectedOptions }) => ({
      selectedOptions: [...selectedOptions, e.value],
    }))

  removeCustomField = (channel) =>
    this.setState(({ selectedOptions }) => ({
      selectedOptions: selectedOptions.filter((ch) => ch !== channel),
    }))

  render() {
    const { config, onCancel } = this.props;
    const { variant, selectedOptions, fieldIndex } = this.state;
    const options = config.options[fieldIndex]
      .filter((option) => !selectedOptions.includes(option))
      .map((item) => ({ label: item, value: item }));
    const fieldOptions = config.fieldKey.map((fKey, index) => ({
      label: config.fieldNames[index] || fKey,
      value: fKey,
    }))

    return (
      <div className={styles.filterConfig}>
        <div className={styles.filterContent}>
          <header className={styles.filterHeader}>Find journeys which</header>
          <div className={styles.filterVariant}>
            <Select
              className={styles.filterVariantSelect}
              selected={variant}
              select={{ options: includeVariants }}
              onChange={this.setFilterVariant}
            />
            <span className={styles.filterVariantDesc}>the following</span>
          </div>
          <div className={styles.filterVariant}>
            <Select
              className={styles.filterKeySelect}
              selected={config.fieldKey[fieldIndex]}
              select={{ options: fieldOptions }}
              onChange={this.setFilterFieldIndex}
            />
          </div>
          <Select
            className={styles.optionsSelect}
            selected={-1}
            onChange={this.addCustomField}
            select={{
              options,
              optionClassName: styles.option,
            }}
            placeholder="Select item..."
          />
          <div className={styles.filterItemTags}>
            {selectedOptions.map((customField) => (
              <FilterItemTag
                key={customField}
                title={customField}
                onRemove={() => this.removeCustomField(customField)}
              />
            ))}
          </div>
        </div>
        <FilterActions
          onApply={this.handleFilterApply}
          onCancel={onCancel}
        />
      </div>
    )
  }
}
