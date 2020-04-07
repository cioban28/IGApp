import React from 'react';
import Component from 'components/Component';
import style from 'styles/campaigns/template-box.css';

export default class TemplateBox extends Component {

  style = style;

  render() {
    const icons = this.props.icons && this.props.icons.map((item, index) =>
      <div key={index} data-icon={item || null} className={this.classes.icon}/>
    );
    return <div className={this.classes.frame} data-white={this.props.isWhite ? true : null} onClick={this.props.onClick} data-selected={this.props.selected ? true : null}>
      <div className={this.classes.inner}>
        { this.props.isBack ?
          <div className={this.classes.iconPosition}>
            <div className={this.classes.backIcon}/>
          </div>
          : null }
        <div className={this.props.isCenter ? this.classes.frameTextCenter : this.classes.frameTextTop}>
          { this.props.text }
        </div>
        { icons ?
          <div className={this.classes.icons}>
            { icons }
          </div>
          : null
        }
        {
          this.props.number ?
            <div className={this.classes.number}>
              { this.props.number }
            </div>
            : null
        }
      </div>
    </div>
  }

}