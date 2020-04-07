import React from 'react';
import Component from 'components/Component';
import Page from 'components/Page';
import style from 'styles/plan/plan.css';
import pageStyle from 'styles/page.css';
import UploadOfflinePopup from 'components/pages/attribution/UploadOfflinePopup';
import {FeatureToggle} from 'react-feature-toggles';
import Button from 'components/controls/Button';
import Offline from 'components/pages/attribution/Offline';

export default class Attribution extends Component {

  style = style;
  styles = [pageStyle];

  constructor(props) {
    super(props);
    this.state = {
      selectedTab: 0,
      showOfflinePopup: false
    };
  }

  selectTab(index) {
    this.setState({
      selectedTab: index
    });
  }

  render() {
    const offlineTabActive = this.props.children ? this.props.children.type === Offline : null;

    const childrenWithProps = React.Children.map(this.props.children,
      (child) => React.cloneElement(child, this.props));
    return <FeatureToggle featureName="attribution">
      <div>
        <Page width="100%">
          <div className={pageStyle.locals.container}>
          <div className={pageStyle.locals.contentHead}>
            <div className={pageStyle.locals.contentHeadTitle}>Attribution</div>
            <div className={this.classes.headPlan}>
              {offlineTabActive ?
                <Button type="primary"
                        style={{width: '102px'}}
                        selected={this.state.showOfflinePopup ? true : null}
                        onClick={() => {
                          this.setState({showOfflinePopup: true});
                        }}>
                  Upload
                </Button>
                : null
              }
            </div>
          </div>
          <div>
            {childrenWithProps}
            <div hidden={!this.state.showOfflinePopup}>
              <UploadOfflinePopup
                close={() => {
                  this.setState({showOfflinePopup: false});
                }}
                setDataAsState={this.props.setDataAsState}/>
            </div>
          </div>
          </div>
        </Page>
      </div>
    </FeatureToggle>;
  }
}