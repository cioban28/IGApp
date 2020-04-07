import React from 'react';
import Component from 'components/Component';
import AttributionSetup from 'components/pages/AttributionSetup';
import {isPopupMode} from 'modules/popup-mode';
import {getProfileSync} from 'components/utils/AuthService';

export default class Setup extends Component {
  render() {
    const {UID} = this.props;
    const profile = getProfileSync();

    return <AttributionSetup UID={UID}
                             isStaticPage={false}
                             senderEmail={profile.email}
                             isPopup={isPopupMode()}
                             sendSnippetEmail={this.props.sendSnippetEmail}
                             getScriptValidator={this.props.getScriptValidator}/>;
  }
}