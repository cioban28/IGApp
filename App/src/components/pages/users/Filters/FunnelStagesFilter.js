import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import Component from 'components/Component';
import Select from 'components/controls/Select';
import { getNickname } from 'components/utils/indicators';
import filterStyles from 'styles/users/filters.css';
import { FilterActions, FilterItemTag } from 'components/pages/users/Filters/FilterParts';
import {ConfigPropType, FilterPropType, funnelStagesVariants, VARIANTS} from 'components/utils/filters'

const styles = filterStyles.locals;

export default class FunnelStagesFilter extends Component {
  static propTypes = {
    className: PropTypes.string,
    config: ConfigPropType.isRequired,
    currentFilter: FilterPropType,
    onCancel: PropTypes.func.isRequired,
    onAddFilter: PropTypes.func.isRequired,
  }

  state = {
    fieldIndex: get(this.props.currentFilter, 'data.fieldIndex', 0),
    variant: get(this.props.currentFilter, 'data.variant', funnelStagesVariants[0].value),
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

  setFilterVariant = (e) =>
    this.setState({
      variant: e.value,
      fieldIndex: funnelStagesVariants.findIndex((variant) => variant.value === e.value),
      selectedOptions: [],
    })

  addStage = (e) =>
    this.setState(({ selectedOptions }) => ({
      selectedOptions: [...selectedOptions, e.value],
    }))

  removeStage = (stage) =>
    this.setState(({ selectedOptions }) => ({
      selectedOptions: selectedOptions.filter((st) => st !== stage),
    }))

  render() {
    const { config, onCancel } = this.props;
    const { selectedOptions, variant, fieldIndex } = this.state;
    const stageOptions = config.options[fieldIndex]
      .filter((option) => !selectedOptions.includes(option))
      .map((stage) => ({ value: stage, label: getNickname(stage, true) }))

    return (
      <div className={styles.filterConfig}>
        <div className={styles.filterContent}>
          <header className={styles.filterHeader}>Find journeys which</header>
          <div className={styles.filterVariant}>
            <Select
              className={styles.filterVariantSelect}
              selected={variant}
              select={{ options: funnelStagesVariants }}
              onChange={this.setFilterVariant}
            />
            <span className={styles.filterVariantDesc}>the following funnel stages:</span>
          </div>
          <Select
            className={styles.optionsSelect}
            selected={-1}
            onChange={this.addStage}
            select={{
              options: stageOptions,
              optionClassName: styles.option,
            }}
            placeholder="Select stage..."
          />
          <div className={styles.filterItemTags}>
            {selectedOptions.map((stage) => (
              <FilterItemTag
                key={stage}
                title={getNickname(stage, true)}
                onRemove={() => this.removeStage(stage)}
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
