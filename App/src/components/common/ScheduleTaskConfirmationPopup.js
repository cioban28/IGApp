import Component from 'components/Component';
import style from 'styles/indicators/crm-popup.css';
import PropTypes from 'prop-types';
import Page from 'components/Page';
import React from 'react';
import onBoardingStyle from 'styles/onboarding/onboarding.css';
import Button from 'components/controls/Button';


export default class ScheduleTaskConfirmationPopup extends Component {

  style = style;
  styles = [onBoardingStyle];

  static propTypes = {
    hidden: PropTypes.bool,
    close: PropTypes.func,
    runScheduleTask: PropTypes.func
  };

  render() {
    const {
      hidden,
      close,
      runScheduleTask
    } = this.props;

    return <div hidden={hidden}>
      <Page popup={true} width={'400px'}>
        <div className={this.classes.title} style={{borderBottom: 'solid 1px #f2f2f2', paddingBottom: '14px'}}>
          Data Update
        </div>
        <div className={this.classes.row}>
          Your next data update is scheduled for midnight.
        </div>
        <div className={this.classes.row}>
          Are you sure you want to push another update right now?
        </div>
        <div className={this.classes.row}>
          Please notice that this update will take ~30 minutes.
        </div>
        <div className={this.classes.footer} style={{display: 'flex'}}>
          <Button
            type="secondary"
            style={{width: '72px'}}
            onClick={() => close()}>Cancel
          </Button>
          <Button
            type="primary"
            style={{width: '72px', marginLeft: 'auto'}}
            onClick={() => {
              runScheduleTask();
              close();
            }}>Update
          </Button>
        </div>
      </Page>
    </div>;
  }
}
