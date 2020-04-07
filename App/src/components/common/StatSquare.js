import React, {Fragment} from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import {uniqueId} from 'lodash';
import Component from 'components/Component';
import Tooltip from 'components/controls/Tooltip';
import NumberWithArrow from 'components/NumberWithArrow';
import style from 'styles/stat-square.css';

export default class StatSquare extends Component {

  static propTypes = {
    // main content props
    title: PropTypes.string.isRequired,
    stat: PropTypes.node.isRequired,
    // detail/description props
    context: PropTypes.shape({
      stat: PropTypes.string.isRequired,
      text: PropTypes.string,
      type: PropTypes.oneOf(["positive", "negative", "neutral"]),
      withArrow: PropTypes.bool,
      tooltipText: PropTypes.string
    }),
    note: PropTypes.shape({
      text: PropTypes.string.isRequired,
      tooltipText: PropTypes.string,
    }),
    // empty placeholder props
    showEmptyStat: PropTypes.bool,
    emptyStatMessage: PropTypes.string,
    // styling props
    className: PropTypes.string,
    containerClassName: PropTypes.string,
    // other props
    tooltipText: PropTypes.string,
    iconUrl: PropTypes.string,
    iconText: PropTypes.string
  };

  static defaultProps = {
    iconUrl: '/assets/analyze-icons/stat-total-cost.svg'
  };

  style = style;

  getContext = () => {
    const {
      context: {
        stat,
        text,
        type,
        withArrow,
        tooltipText
      }
    } = this.props;

    const node = <div className={this.classes.context}>
      {withArrow ?
        <NumberWithArrow
          stat={stat}
          isNegative={type === "negative"}
          arrowStyle={{alignSelf: 'center', borderWidth: '0px 4px 5px 4px'}}
          statStyle={{alignSelf: 'center', fontWeight: '500'}}
        /> :
        <div
          className={classnames(
            this.classes.contextStat,
            type === "positive" && this.classes.positive,
            type === "negative" && this.classes.negative
          )}
        >
          {stat}
        </div>
      }
      {text && <span className={this.classes.contextText}>{text}</span>}
    </div>;

    return tooltipText ?
      <Tooltip id={`stat-context-tip-${uniqueId()}`} tip={tooltipText}>
        {node}
      </Tooltip>
      : node;
  }

  getNote = () => {
    const {
      note: {
        text,
        tooltipText
      }
    } = this.props;

    const node = <div className={this.classes.note}>{text}</div>

    return tooltipText ?
      <Tooltip id={`stat-note-tip-${uniqueId()}`} tip={tooltipText}>
        {node}
      </Tooltip>
      : node;
  }

  render() {
    const {
      title,
      stat,
      context,
      note,
      tooltipText,
      iconUrl,
      iconText,
      showEmptyStat,
      emptyStatMessage,
      className,
      containerClassName
    } = this.props;

    return (
      <div className={classnames(this.classes.container, containerClassName)}>    
        <div className={classnames(this.classes.item, className)}>
          <div className={this.classes.header}>
            <div className={this.classes.icon} style={{backgroundImage: `url(${iconUrl})`}}>
              {iconText && <div className={this.classes.iconText}>{iconText}</div>}
            </div>
          </div>
          <div className={this.classes.content}>
            <div className={this.classes.title}>{title}</div>
            {showEmptyStat ?
              <Fragment>
                <div className={this.classes.center}>
                  <div className={this.classes.sadIcon}/>
                </div>
                <div className={this.classes.noMetrics}>
                  {emptyStatMessage}
                </div>
              </Fragment>
              :
              <Fragment>
                <div className={this.classes.stat}>{stat}</div>
                {context && this.getContext()}
              </Fragment>
            }
          </div>
          {note && this.getNote()}
        </div>
        {tooltipText && 
          <Tooltip id={`stat-tip-${uniqueId()}`} tip={tooltipText} className={this.classes.tooltipContainer}>
            <div className={this.classes.tooltip}/>
          </Tooltip>
        }
      </div>
    );
  }
}