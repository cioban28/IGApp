import React from 'react';
import Component from 'components/Component';
import ReactDOM from 'react-dom';
import Popup from 'components/Popup';
import ChooseButton from 'components/pages/profile/ChooseButton';
import NotSure from 'components/onboarding/NotSure';

import style from 'styles/profile/buttons-set.css';

export default class ButtonsSet extends Component {
  style = style;

  static defaultProps = {
    lines: 1
  }

  constructor(props) {
    super(props);
    this.state = {
      selectedButton: props.selectedKey || 0,
      popupHidden: true,
      validationError: false
    };
  }
  componentWillReceiveProps(nextProps){
    nextProps.buttons.map((params, i) => {
      if (nextProps.selectedKey == params.key){
        this.state.selectedButton = params.key;
        this.setState({validationError: false});
      }
    });
  }

  renderItem = ({ selected, key, params, onClick }) => {
    return <ChooseButton
      key={ key }
      selected={ selected }
      text={ params.text }
      icon={ params.icon }
      onClick={ onClick }
    />;
  }

  focus() {
    ReactDOM.findDOMNode(this.refs.input).scrollIntoView({});
  }

  validationError() {
    this.focus();
    this.setState({validationError: true});
  }

  render() {
    let selectedIndex = 0;
    const renderItem = this.props.renderItem || this.renderItem;
    const gridColums = new Array(this.props.lines);
    // debugger;
    const grid = Array.apply(null, {length: this.props.lines})
    .map((val, i) => {
      // debugger;
      const lineItems = this.props.buttons
        .slice(
          Math.ceil(i * this.props.buttons.length / this.props.lines),
          Math.ceil((i+1) * this.props.buttons.length / this.props.lines)
        ).map((params, i) => {
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

      if( i === this.props.lines - 1) {
        lineItems.push(<div key='validation' hidden={!this.state.validationError} className={this.classes.validationError}/>);
      }
        return (
          <div key={''+i} className={`${this.classes.igGridRow} ig-grid-row-${i}`}>
            {lineItems}
            </div>
        )
    });
    
    let help;

    if (this.props.help) {
      help = <div className={ this.classes.helpWrap }>
        <NotSure onClick={ this.onPopup } />
        { this.getPopup() }
      </div>
    }

    return <div className={ this.classes.box } ref="input">
      <div className={ this.classes.inner }>
        { grid }
        { help }
      </div>
    </div>
  }

  hidePopup() {
    this.setState({
      popupHidden: true
    });
  }

  selectButton = (index) => {
    if (index < 0) {
      index = this.props.buttons.length - 1;
    } else if (index >= this.props.buttons.length) {
      index = 0;
    }

    this.setState({
      selectedButton: index
    });
  }

  selectNextButton = () => {
    this.selectButton(this.state.selectedButton + 1);
  }

  selectPrevButton = () => {
    this.selectButton(this.state.selectedButton - 1);
  }

  getPopup() {
    this.popup = <Popup style={{
      width: '318px',
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
