import React from 'react';
import Component from 'components/Component';
import Page from 'components/Page';
import style from 'styles/indicators/crm-popup.css';
import CRMStyle from 'styles/indicators/crm-popup.css';
import tooltipStyle from 'styles/controls-label.css';
import DataValidationCRMPart from 'components/pages/indicators/DataValidationCRMPart';
import PropTypes from 'prop-types';

export default class DataValidationPopup extends Component {

  style = style;
  styles = [CRMStyle, tooltipStyle];

  static propTypes = {
    hidden: PropTypes.bool,
    indicator: PropTypes.string.isRequired,
    crm: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.bool
    ]),
    groupedByMapping: PropTypes.string,
    customFilter: PropTypes.arrayOf(PropTypes.object),
    lastUpdateTime: PropTypes.string,
    close: PropTypes.func
  };

  render() {
    const {
      hidden,
      indicator,
      crm,
      lastUpdateTime,
      close
    } = this.props;
    let crmData;

    if (crm) {
      if (crm.toString().includes('salesforce'))
        crmData = 'Salesforce';
      else if (crm.toString().includes('hubspot')) {
        crmData = 'Hubspot';
      }
    }

    return <div hidden={hidden}>
      <Page popup={true} width={'360px'} style={{zIndex: '9'}}>
        <div className={this.classes.close} onClick={close}/>
        <div className={this.classes.title}>
          {indicator} Data Quality
        </div>
        {crmData ?
          <DataValidationCRMPart crmData={crmData} {...this.props}/>
          : null}
        {lastUpdateTime ? <div className={tooltipStyle.locals.ttSubText}>
            Last Update Time: {new Date(lastUpdateTime).toLocaleString()} (local time)
          </div>
          : null}
      </Page>
    </div>;
  }
}
