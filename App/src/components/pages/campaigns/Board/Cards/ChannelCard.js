import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Component from 'components/Component';
import { formatNumber } from 'components/utils/budget';

import { DraggableCampaignCard } from './DraggableCard'

import style from 'styles/campaigns/card.css';

class Card extends Component {
  style = style;

  static propTypes = {
    item: PropTypes.object.isRequired,
    style: PropTypes.object,
    x: PropTypes.number,
    y: PropTypes.number,
    draggingPreview: PropTypes.bool,
  };

  static contextTypes = {
    showCampaign: PropTypes.func,
    addNewCampaign: PropTypes.func
  };

  state = {
    expanded: false
  };

  handleClick = () => {
    this.setState({
      expanded: !this.state.expanded,
    });
  };

  renderCampaigns() {
    const { x, y, stopScrolling, item } = this.props;

    return item.campaigns.map((campaign, index) => (
      <DraggableCampaignCard
        key={campaign.id}
        item={campaign}
        onClick={() => this.openPopup(index)}
        x={x}
        y={y}
        stopScrolling={stopScrolling}
        first={index === 0}
        last={index === item.campaigns.length - 1}
      />
    ))
  }

  openPopup = (index) => {
    if (index !== undefined) {
      this.context.showCampaign(this.props.item.campaigns[index]);
    } else {
      this.context.addNewCampaign({ status: this.props.item.status, source: this.props.item.name ? [this.props.item.name] : []});
    }
  };

  render() {
    const {style, item, draggingPreview} = this.props;
    return (
      <div style={style} className={classnames(this.classes.cardContainer, {
        [this.classes.expanded]: this.state.expanded,
        [this.classes.noCampaigns]: !item.campaigns || item.campaigns.length === 0,
        [this.classes.draggingPreview]: draggingPreview,
      })} id={style ? item.id : null}>
        <div className={this.classes.card} onClick={this.handleClick}>
          <div className={this.classes.cardName}>{item.title}</div>
          <div className={this.classes.cardFooter}>
            <span className={this.classes.cardBudget}>${formatNumber(item.campaignsBudget || 0)}</span>
            <span className={this.classes.budget}>{" / $" + formatNumber(item.budget)}</span>
            <div className={this.classes.campaignsCount}>{item.campaigns.length}</div>
            <div className={ this.classes.cardIcon } data-icon={item.icon} />
          </div>
        </div>
        {this.state.expanded && this.renderCampaigns()}
        {
          this.state.expanded &&
          <button key="button" className={ this.classes.addButton } onClick={ () => {
            this.openPopup();
          }}>
            Add Campaign
          </button>
        }
      </div>
    );
  }
}

export default Card
