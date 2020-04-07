import React from 'react';
import Component from 'components/Component';
import style from 'styles/indicators/crm-popup.css';
import CRMStyle from 'styles/indicators/crm-popup.css';
import tooltipStyle from 'styles/controls-label.css';
import PropTypes from 'prop-types';

export default class DataValidationCRMPart extends Component {

  style = style;
  styles = [CRMStyle, tooltipStyle];

  static propTypes = {
    crmData: PropTypes.string.isRequired
  };

  render() {
    const {
      crmData,
      groupedByMapping,
      customFilter,
      indicator
    } = this.props;
    const customFilters = customFilter && customFilter.map(filter =>
      <div key={filter.field} style={{display: 'list-item'}}>{filter.value}</div>
    );

    return <div>
      {groupedByMapping ?
        <div>
          <div className={this.classes.row} style={{display: 'inherit'}}>
            Grouped by {groupedByMapping}.
          </div>
          <b className={this.classes.row} style={{display: 'inherit'}}>
            Possible data discrepancies:
          </b>
          {groupedByMapping === 'companies' ?
            <div style={{marginLeft: '20px'}}>
              <div className={this.classes.row} style={{display: 'list-item'}}>
                There are some companies that have contacts in a more advanced stage and not calculated
                as {indicator}.
              </div>
              <div className={this.classes.row} style={{display: 'list-item'}}>
                There are some companies which are consolidated (multiple {groupedByMapping} founded as duplications
                and were consolidated).
              </div>
            </div>
            :
            <div className={this.classes.row} style={{display: 'list-item', marginLeft: '20px'}}>
              Companies aren't linked to any contact but measured as a contact.
            </div>
          }
        </div>
        : null}
      <div className={this.classes.row} style={{display: 'inherit'}}>
        Data is populated from {crmData}.
      </div>
      {customFilters ?
        <div className={this.classes.row} style={{display: 'inherit'}}>
          <b>Custom Filters:</b>
          <div style={{marginLeft: '20px'}}>
            {customFilters}
          </div>
        </div>
        : null}
    </div>;
  }
}
