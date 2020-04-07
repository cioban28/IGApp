import React from 'react';
import PropTypes from 'prop-types';
import Component from 'components/Component';

export default class ImportButton extends Component {

  static propTypes = {
    popupComponent: PropTypes.func.isRequired,
    className: PropTypes.string
  };

  render() {
    return <div style={{width: '100%'}}>
      <div className={this.props.className} onClick={() => this.refs.popup.open()}/>
      <this.props.popupComponent {...this.props} ref='popup'/>
    </div>;
  }
}