import React from 'react';
import Component from 'components/Component';
import Page from 'components/Page';
import style from 'styles/plan/plan.css';
import SettingsSideBar from 'components/pages/settings/SettingsSideBar';
import {userPermittedToPage} from 'utils';
import Attribution from 'components/pages/Attribution';
import ChannelsSettings from 'components/pages/settings/channels/Channels';

export default class Settings extends Component {

  style = style;

  render() {

    const {children, ...otherProps} = this.props;
    const childrenWithProps = React.Children.map(children,
      (child) => React.cloneElement(child, otherProps));

    const attributionActive = this.props.children ? this.props.children.type === Attribution : null;
    const channelsSettingsActive = this.props.children ? this.props.children.type === ChannelsSettings : null;

    return <div>
      <Page contentClassName={this.classes.content} innerClassName={(attributionActive || channelsSettingsActive) ? "" : this.classes.pageInner} width="100%">
        {userPermittedToPage('settings')
          ? <div>
              <div>
                {childrenWithProps}
              </div>
            </div>
          : <div>
              {childrenWithProps}
            </div>
        }
      </Page>
    </div>;
  }
}