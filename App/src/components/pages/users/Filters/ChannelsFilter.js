import React from 'react';
import Component from 'components/Component';
import Select from 'components/controls/Select';
import { FilterItemTag } from 'components/pages/users/Filters/FilterParts';
import { includeVariants } from 'components/utils/filters';
import {
  getChannelIcon,
  getChannelNickname,
  getChannelsWithNicknames
} from 'components/utils/filters/channels';
import CommonFilter, { CommonPropTypes } from 'components/pages/users/Filters/CommonFilter';
import filterStyles from 'styles/users/filters.css';

const styles = filterStyles.locals;

export default class ChannelsFilter extends Component {
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
              <span className={styles.filterVariantDesc}>the following channels:</span>
            </div>
            <Select
              className={styles.optionsSelect}
              selected={-1}
              onChange={onAddItem}
              select={{
                options: getChannelsWithNicknames()
                  .filter(({ value }) => config.options.includes(value) && !selectedOptions.includes(value)),
                optionClassName: styles.option,
              }}
              iconRendererOnValue={true}
              iconRendererOnOptions={true}
              iconFromValue={getChannelIcon}
              placeholder="Search channel..."
            />
            <div className={styles.filterItemTags}>
              {selectedOptions.map((channel) => (
                <FilterItemTag
                  key={channel}
                  channel={channel}
                  title={getChannelNickname(channel)}
                  icon={getChannelIcon(channel)}
                  onRemove={() => onRemoveItem(channel)}
                />
              ))}
            </div>
          </>
        )}
      </CommonFilter>
    )
  }
}
