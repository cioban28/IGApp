import React from 'react';
import PropTypes from 'prop-types';
import get from 'lodash/get';
import Component from 'components/Component';
import { FilterActions } from 'components/pages/users/Filters/FilterParts';
import { ConfigPropType, FilterPropType } from 'components/utils/filters';
import filterStyles from 'styles/users/filters.css';

const styles = filterStyles.locals;

export const CommonPropTypes = {
  className: PropTypes.string,
  config: ConfigPropType.isRequired,
  currentFilter: FilterPropType,
  onCancel: PropTypes.func.isRequired,
  onAddFilter: PropTypes.func.isRequired,
}

export default class CommonFilter extends Component {
  static propTypes = {
    ...CommonPropTypes,
    children: PropTypes.func.isRequired,
  }

  state = {
    variant: get(this.props.currentFilter, 'data.variant', 0),
    selectedOptions: get(this.props.currentFilter, 'data.selectedOptions', []),
  }

  handleFilterApply = () => {
    this.props.onAddFilter({
      kind: this.props.config.kind,
      data: {
        variant: this.state.variant,
        selectedOptions: this.state.selectedOptions,
      },
    })
  }

  setFilterVariant = (e) =>
    this.setState({
      variant: e.value,
    })

  addItem = (e) =>
    this.setState(({ selectedOptions }) => ({
      selectedOptions: [...selectedOptions, e.value],
    }))

  removeItem = (item) =>
    this.setState(({ selectedOptions }) => ({
      selectedOptions: selectedOptions.filter((it) => it !== item),
    }))

  render() {
    const { config, onCancel, children } = this.props;
    const { variant, selectedOptions } = this.state;

    return (
      <div className={styles.filterConfig}>
        <div className={styles.filterContent}>
          {children({
            config,
            variant,
            selectedOptions,
            onAddItem: this.addItem,
            onRemoveItem: this.removeItem,
            onSetVariant: this.setFilterVariant,
          })}
        </div>
        <FilterActions
          onApply={this.handleFilterApply}
          onCancel={onCancel}
        />
      </div>
    )
  }
}
