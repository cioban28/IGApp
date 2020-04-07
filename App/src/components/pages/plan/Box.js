import React from 'react';
import Component from 'components/Component';
import names from 'classnames';
import history from 'history';

import style from 'styles/plan/box.css';

import Popup from 'components/Popup';

export default class Box extends Component {
  style = style;

  static defaultProps = {
    progress: 0
  }

  state = {
    tooltipHidden: true
  }

  render() {
    let className;

    if (this.props.className) {
      className = this.props.className;
    } else {
      className = this.classes.box;
    }

    return <div className={ className }>
      <div className={ this.classes.head }>
        {
          this.props.price !== '$-1' ?
            <div className={ this.classes.headPrice }>
              { this.props.price }
            </div>
            :
            <div className={ this.classes.inhouseIcon }/>
        }
        <div className={ this.classes.headType }
             data-link={ this.props.channel ? true : null }
             onClick={ ()=> { if (this.props.channel) {
               history.push({
                 pathname: '/campaigns/by-channel',
                 query: { hash: this.props.channel }
               })
             } } }>{ this.props.title }</div>
        <div className={ this.classes.infoIconI } role="button" style={{
          opacity: '0.33',
          marginTop: '7px'
        }} onClick={ this.props.onInfoClick } />

        <div className={ this.classes.headProgress } onMouseEnter={() => {
          this.setState({
            tooltipHidden: false
          });
        }} onMouseLeave={() => {
          this.setState({
            tooltipHidden: true
          });
        }}>
          <div className={ this.classes.headProgressBar } style={{
            height: this.props.progress + '%'
          }}>
            <Popup
              className={ this.classes.progressTooltip }
              hidden={ this.state.tooltipHidden }
            >
              { this.props.progress }%
            </Popup>
          </div>
        </div>
      </div>
      <div className={ this.classes.content }>
        { this.props.children }
      </div>
    </div>
  }
}


export class Row extends Component {
  style = style;

  render() {
    let titleElem;

    if (typeof this.props.link === 'string') {
      titleElem = <a href={ this.props.link } className={ this.classes.rowLink }>
        { this.props.title }
      </a>
    } else {
      titleElem = <div className={ this.classes.rowText }
                       data-link={ this.props.channel ? true : null }
                       onClick={ ()=> { if (this.props.channel) {
                         history.push({
                           pathname: '/campaigns/by-channel',
                           query: { hash: this.props.channel }
                         })
                       } } }>
        { this.props.title }
      </div>
    }

    return <div className={ this.classes.basicRow }>
      <div className={ this.classes.rowIcon } data-icon={ this.props.icon } />
      { titleElem }

      <div className={ this.classes.rowRight }>
        {
          this.props.price !== '$-1' ?
            <div className={this.classes.rowPrice}>
              {this.props.price}
            </div>
            :
            <div className={ this.classes.inhouseIconSmall }/>
        }
        <div className={ this.classes.infoIconI } role="button" style={{
          opacity: '0.19',
          marginRight: '6px'
        }} onClick={(e) => {
          this.props.onInfoClick(e, 0);
        }} />
        <div className={ this.classes.infoIconE } role="button" style={{
          opacity: '0.19',
          marginRight: '8px'
        }} onClick={(e) => {
          this.props.onInfoClick(e, 1);
        }} />
      </div>
    </div>
  }
}

export class LeveledRow extends Component {
  style = style;

  render() {
    return <div className={ this.classes.leveledRow }>
      { this.props.children }
    </div>
  }
}

export class Level extends Component {
  style = style;

  static defaultProps = {
    level: 0
  }

  render() {
    let children;

    if (this.props.children) {
      children = <div className={ this.classes.levelChildren }>
        { this.props.children }
      </div>
    }

    let boxClassName = this.classes.levelBox;

    if (this.props.disabled) {
      boxClassName += ' ' + this.classes.disabledLevel;
    }

    return <div className={ this.classes.level }>
      <div className={ boxClassName }>
        <div className={ this.classes.levelIcon } data-icon={ this.props.icon } />
        <div className={ this.classes.levelText }
             data-link={ this.props.channel ? true : null }
             onClick={ ()=> { if (this.props.channel) {
               history.push({
                 pathname: '/campaigns/by-channel',
                 query: { hash: this.props.channel }
               })
             } } }>
          { this.props.title }
        </div>

        <div className={ this.classes.levelRight }>
          {
            this.props.price !== '$-1' ?
              <div className={ this.classes.levelPrice }>
                { this.props.price }
              </div>
              :
              <div className={ this.classes.inhouseIconSmall }/>
          }

          <div className={ this.classes.infoIconI } role="button" style={{
            opacity: '0.19',
            marginRight: '6px',
            visibility: this.props.disabled ? 'hidden' : ''
          }} onClick={(e) => {
            this.props.onInfoClick(e, 0);
          }}/>
          <div className={ this.classes.infoIconE } role="button" style={{
            opacity: '0.19',
            marginRight: '8px',
            visibility: this.props.disabled ? 'hidden' : ''
          }} onClick={(e) => {
            this.props.onInfoClick(e, 1);
          }}/>
        </div>
      </div>

      { children }
    </div>
  }
}