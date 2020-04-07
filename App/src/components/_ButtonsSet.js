import React from 'react';
import Component from 'components/Component';

import style from 'styles/buttons-set.css';

import Button from 'components/controls/Button';

export default class ButtonsSet extends Component {
  style = style;
  state = {
    selectedButton: 0
  };

  renderItem = ({ selected, key, params, onClick }) => {
    return <Button
      key={ key }
      selected={ selected }
      onClick={ onClick }
    >{ params.text }</Button>;
  }

  render() {
    const renderItem = this.props.renderItem || this.renderItem;
    const buttons = this.props.buttons.map((params, i) => {
      const key = params.key || i;

      return renderItem({
        selected: key === this.state.selectedButton,
        key: key,
        params: params,
        onClick: () => {
          this.setState({
            selectedButton: key
          });

          if (this.props.onChange) {
            this.props.onChange(key);
          }
        }
      });
    });

    let help;

    if (this.props.help) {
      help = <div className={ this.classes.helpWrap }>
        <div role="button"
          className={ this.classes.help }
          onClick={ this.onPopup }
        >
          Not sure?
        </div>

        { this.getPopup() }
      </div>
    }

    return <div className={ this.classes.box }>
      <div className={ this.classes.inner }>
        { buttons }
        { help }
      </div>
    </div>
  }

  getPopup() {
    this.popup = <Popup style={{
      top: '50%',
      transform: 'translate(0, -50%)'
    }} hidden={ this.state.popupHidden } onClose={() => {
      this.setState({
        popupHidden: true
      });
    }}>
      { this.props.popup }
    </Popup>

    return this.popup;
  }

  onPopup = () => {
    this.setState({
      popupHidden: false
    });
  }
}