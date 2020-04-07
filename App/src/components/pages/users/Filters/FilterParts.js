import React from 'react';
import classnames from 'classnames';
import Button from 'components/controls/Button';
import filterStyles from 'styles/users/filters.css';
import getChannelColor from 'components/utils/getChannelColor';
import {hexToRgb} from 'components/utils/colors';
import EllipsisTooltip from 'components/controls/EllipsisTooltip';

const styles = filterStyles.locals;

export const FilterActions = ({ onApply, onCancel }) => (
  <footer className={styles.filterActions}>
    <Button className={classnames(styles.filterActionsButtonWrap, styles.filterActionSecondary)} contClassName={styles.filterActionsButton} type="secondary" onClick={onCancel}>Cancel</Button>
    <Button type="primary" className={styles.filterActionsButtonWrap} contClassName={styles.filterActionsButton} onClick={onApply}>Apply filter</Button>
  </footer>
);

export const FilterItemTag = ({ channel, title, icon, onRemove }) => (
  <div className={styles.filterItemTagWrapper}>
    <div className={styles.filterItemTag} style={{
      color: getChannelColor(channel),
      backgroundColor: `rgba(${hexToRgb(getChannelColor(channel)).join(',')}, 0.2)`
    }}>
      {icon && <div className={styles.filterItemIcon} data-icon={icon}/>}
      <EllipsisTooltip text={title} className={styles.filterItemTitle}/>
      <button className={styles.filterItemRemoveButton} onClick={onRemove}/>
    </div>
  </div>
);
