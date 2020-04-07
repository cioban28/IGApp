import React from 'react';
import PropTypes from 'prop-types';
import Component from 'components/Component';
import Button from 'components/controls/Button';
import style from 'styles/onboarding/onboarding.css';
import Page from 'components/Page';
import PopupFrame from 'components/pages/campaigns/PopupFrame';
import {getIndicatorsWithProps} from 'components/utils/indicators';
import Item from 'components/pages/indicators/Item';
import {isNil} from 'lodash';

export default class IntegrationPopup extends Component {

  style = style;

  static propTypes = {
    cancelButtonText: PropTypes.string,
    doneButtonText: PropTypes.string,
    makeServerRequest: PropTypes.func,
    validateBeforeDone: PropTypes.func,
    affectedIndicators: PropTypes.arrayOf(PropTypes.string),
    width: PropTypes.string,
    actualIndicators: PropTypes.object,
    innerClassName: PropTypes.string,
    contentClassName: PropTypes.string,
    cancelButtonAction: PropTypes.func,
    doneButtonAction: PropTypes.func,
    closeWhileWaitingForRequest: PropTypes.bool
  };

  static defaultProps = {
    cancelButtonText: 'Cancel',
    doneButtonText: 'Done',
    closeWhileWaitingForRequest: false,
    validateBeforeDone: () => true
  };

  constructor(props) {
    super(props);

    this.state = {
      error: false,
      hidden: true
    };
  }

  open = () => {
    this.setState({indicatorsPopup: false, hidden: false, error: false});
  };

  close = () => {
    this.setState({error: false, hidden: true, indicatorsPopup: false});
  };

  loadingStarted = () => {
    this.props.loadingStarted && this.props.loadingStarted();
  };

  loadingFinished = () => {
    this.props.loadingFinished && this.props.loadingFinished();
  };

  propogateStep = (openIndicatorsPopup) => {
    if (openIndicatorsPopup) {
      this.setState({indicatorsPopup: true});
    }
    else {
      this.setState({hidden: false});
    }
  };

  done = () => {
    if (this.props.validateBeforeDone()) {
      this.loadingStarted();
      this.props.closeWhileWaitingForRequest && this.close();
      this.props.makeServerRequest()
        .then((shouldShowIndicatorsPopup = true) => {
          this.setState({indicatorsPopup: shouldShowIndicatorsPopup});
          this.loadingFinished();
        })
        .catch((error) => {
          if (this.props.closeWhileWaitingForRequest) {
            window.alert(error.message);
          }
          else {
            this.setState({error: true});
          }
          this.loadingFinished();
        });
    }
  };

  render() {
    const properties = getIndicatorsWithProps() || {};
    const indicatorsItems = this.props.affectedIndicators && this.props.affectedIndicators.map(indicator =>
      <Item
        key={indicator}
        icon={'indicator:' + indicator}
        title={properties[indicator].title}
        name={indicator}
        isMenuHidden={true}
        defaultStatus={this.props.actualIndicators[indicator]}
        maxValue={properties[indicator].range.max}
        isPercentage={properties[indicator].isPercentage}
        description={properties[indicator].description}
        formula={properties[indicator].formula}
        isDirectionDown={!properties[indicator].isDirectionUp}
        automaticIndicators={true}
      />
    );
    return <div hidden={this.state.hidden && !this.state.indicatorsPopup}>
      <div hidden={this.state.hidden}>
        <Page popup={true}
              width={this.props.width}
              innerClassName={this.props.innerClassName}
              contentClassName={this.props.contentClassName}>
          <div style={{display: 'grid'}}>
            {this.props.children}
            <div className={this.classes.footer}>
              <div className={this.classes.footerLeft}>
                <Button type="secondary" style={{width: '100px'}}
                        onClick={this.props.cancelButtonAction || this.close}>
                  {this.props.cancelButtonText}
                </Button>
              </div>
              <div className={this.classes.footerRight}>
                <Button type="primary" style={{width: '100px'}}
                        onClick={this.props.doneButtonAction || this.done}>
                  {this.props.doneButtonText}
                </Button>
              </div>
            </div>
            <label hidden={!this.state.error} style={{color: 'red', marginTop: '20px'}}>
              Error occurred
            </label>
          </div>
        </Page>
      </div>
      {this.state.indicatorsPopup ?
        <PopupFrame primaryClick={this.close}
                    secondaryClick={this.open}
                    primaryButtonText="Done"
                    secondaryButtonText="Edit"
                    title="Affected Indicators">
          <div>
            {indicatorsItems}
          </div>
        </PopupFrame>
        : null}
    </div>;
  }
}
