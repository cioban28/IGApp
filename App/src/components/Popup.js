import React from 'react';
import ReactDOM from 'react-dom';
import assign from 'object-assign';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Component from 'components/Component';
import style from 'styles/popup.css';

export default class Popup extends Component {
  style = style;

  static propTypes = {
    hidden: PropTypes.bool.isRequired,
    className: PropTypes.string,
    style: PropTypes.object,
    close: PropTypes.func
  }

  static defaultProps = {
    hidden: false
  }

  constructor(props) {
    super(props);

    this.state = {
      hidden: !!props.hidden
    };
  }

  componentWillReceiveProps(props) {
    if (props.hidden !== this.state.hidden) {
      this.setState({
        hidden: props.hidden
      });
    }
  }

  componentWillUnmount() {
    this.unlistenGlobal();
  }

  onOutsideClick = (e) => {
    if (this.props.onClose) {
      const elem = ReactDOM.findDOMNode(this);

      if (elem !== e.target && !elem.contains(e.target)) {
        this.props.onClose();
      }
    }
  }

  close() {
    if (this.props.onClose) {
      this.props.onClose();
    }
  }

  hide() {
    this.setState({
      hidden: true
    });
  }

  listenGlobal() {
    document.addEventListener('mousedown', this.onOutsideClick, true);
    document.addEventListener('touchstart', this.onOutsideClick, true);
  }

  unlistenGlobal() {
    document.removeEventListener('mousedown', this.onOutsideClick, true);
    document.removeEventListener('touchstart', this.onOutsideClick, true);
  }

  render() {
    const {className, style, children} = this.props;
    const {hidden} = this.state;

    const popupStyle = assign({}, style);

    if (hidden) {
      this.unlistenGlobal();
      popupStyle.display = 'none';
    } else {
      popupStyle.display = '';
      this.listenGlobal();
    }

    return (
      <div
        className={classnames(this.classes.popup, className)}
        style={popupStyle}
      >
        {children}
      </div>
    );
  }
}