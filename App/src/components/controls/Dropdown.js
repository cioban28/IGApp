import React from 'react';
import Component from 'components/Component';

import ReactDropdown from 'react-dropdown';
import dropdownStyle from 'styles/global/dropdown.css';

// import style from 'styles/controls/select.css';

export default class Select extends Component {
  // style = style;
  styles = [dropdownStyle];

  render() {
    const select = this.props.select;

    return <div style={ this.props.style } className={ this.props.className } >
      <ReactDropdown { ... select } value={ select.options[ this.props.selected | 0 ] } />
    </div>
  }
}