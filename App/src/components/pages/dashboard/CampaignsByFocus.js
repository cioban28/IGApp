import React from "react";
import Component from "components/Component";
import style from 'styles/dashboard/campaigns-by-focus.css';
import { formatBudgetShortened } from 'components/utils/budget';

export default class CampaignsByFocus extends Component {

  style = style;

  render() {
    const {campaigns} = this.props;
    let focuses = {
      Acquisition: 0,
      Activation: 0,
      Retention: 0,
      Revenue: 0,
      Referral: 0
    };
    let numberOfCampaigns = 0;
    let campaignsWithFocus = 0;
    let totalBudget = 0;
    campaigns.forEach(campaign => {
      if (campaign.isArchived !== true) {
        numberOfCampaigns++;
        const budget = campaign.actualSpent || campaign.budget || 0;
        totalBudget += budget;
        if (campaign.focus) {
          campaignsWithFocus++;
          focuses[campaign.focus] += budget;
        }
      }
    });
    const focusItems = Object.keys(focuses).map(focus =>
      <div className={this.classes.focus} key={focus}>
        <div className={this.classes.focusText}>
          {focus}
        </div>
        <div className={this.classes.focusBudget}>
          ${formatBudgetShortened(focuses[focus])}
        </div>
        <div className={this.classes.focusPercentage}>
          {totalBudget ? Math.round(focuses[focus]/totalBudget*100) : 0}%
        </div>
      </div>
    );
    return <div className={this.classes.inner}>
      <div className={this.classes.row}>
        <div className={this.classes.left}>
          <div className={this.classes.planned}>
            Planned
          </div>
          <div className={this.classes.numberOfCampaigns}>
            {numberOfCampaigns} campaigns
          </div>
        </div>
        <div className={this.classes.campaignsBudget}>
          ${formatBudgetShortened(totalBudget)}
        </div>
        <div className={this.classes.right}>
          <div className={this.classes.supporting}>
            <div className={this.classes.supportingNumber}>
              {numberOfCampaigns ? Math.round(campaignsWithFocus / numberOfCampaigns * 100) : 0}%
            </div>
            <div className={this.classes.supportingText}>
              {" supporting"}
            </div>
          </div>
          <div className={ this.classes.pipe }>
            <div className={ this.classes.pipeFill } style={{
              width: (Math.min(1, campaignsWithFocus / numberOfCampaigns) * 100) + '%'
            }}/>
          </div>
        </div>
      </div>
      <div className={this.classes.row}>
        {focusItems}
      </div>
    </div>
  }
}