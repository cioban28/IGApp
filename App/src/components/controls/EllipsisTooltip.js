import React from 'react';
import PropTypes from 'prop-types';
import {uniqueId} from 'lodash';
import classnames from 'classnames';
import Component from 'components/Component';
import Tooltip from 'components/controls/Tooltip';
import style from 'styles/controls/ellipsis-tooltip.css';

export default class Tags extends Component {
  style = style;

  static propTypes = {
    text: PropTypes.string.isRequired,
    className: PropTypes.string,
    place: PropTypes.oneOf(['top', 'right', 'bottom', 'left'])
  }

  constructor(props) {
    super(props);
    this.state = {
      overflow: false
    }
    this.container = React.createRef();
  }

  componentDidMount() {
    if (this.container.current.offsetWidth < this.container.current.scrollWidth) {
      // text content is longer than it's box/container
      // text content will be cut (followed by ellipsis '...')
      this.setState({overflow: true});
    }
  }

  render() {
    const {text, className, place} = this.props;
    const {overflow} = this.state;

    return (
      <div className={classnames(this.classes.container, className)}>
        {
          overflow ? (
            <Tooltip
              id={uniqueId('ellipsis-tooltip-')}
              tip={text}
              place={place}
            >
              <div ref={this.container} className={this.classes.withEllipsis}>{text}</div>
            </Tooltip>
          ) : (
            <div ref={this.container} className={this.classes.withEllipsis}>{text}</div>
          )
        }
      </div>
    )
  }
}
