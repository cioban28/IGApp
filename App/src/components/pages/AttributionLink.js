import React from 'react';
import Component from 'components/Component';
import AttributionSetup from 'components/pages/AttributionSetup';
import {getProfile} from 'components/utils/AuthService';

export default class Setup extends Component {
  render() {
    const {UID} = this.props.params;

    return <AttributionSetup UID={UID} isPopup={false} isStaticPage={true}/>;
  }
}