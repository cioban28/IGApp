import React from 'react';
import PropTypes from 'prop-types';
import Component from 'components/Component';
import Page from 'components/Page';
import style from 'styles/plan/new-scenario-popup.css';

export default class NewScenarioPopup extends Component {

  style = style;

  static propTypes = {
    hidden: PropTypes.bool.isRequired,
    onScratchClick: PropTypes.func.isRequired,
    onCommittedClick: PropTypes.func.isRequired
  };

  static defaultProps = {
    hidden: true
  };

  render() {
    const {hidden, onScratchClick, onCommittedClick, onClose} = this.props;
    return <div hidden={hidden}>
      <Page popup={true} width={'572px'} contentClassName={this.classes.content} onClose={onClose}>
        <div className={this.classes.center}>
          <div className={this.classes.inner}>
            <div className={this.classes.title}>
              Create a new planning scenario
            </div>
            <div className={this.classes.subTitle}>
              How would you want to start your alternative scenario?
            </div>
            <div className={this.classes.boxes}>
              <div className={this.classes.scratch} onClick={onScratchClick}>
                <div className={this.classes.boxText}>
                  Start from ‘scratch’
                </div>
              </div>
              <div className={this.classes.committed} onClick={onCommittedClick}>
                <div className={this.classes.boxText}>
                  Start from my committed plan
                </div>
              </div>
            </div>
          </div>
        </div>
      </Page>
    </div>;
  }

}