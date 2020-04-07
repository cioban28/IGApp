import React from 'react';
import Component from 'components/Component';

import Label from 'components/ControlsLabel';

import style from 'styles/campaigns/campaign-summary.css';
import icons from 'styles/icons/plan.css';

export default class CampaignSummary extends Component {

  style = style;
  styles = [icons];

  constructor(props) {
    super(props);
  }

  render(){
    const budget = this.props.campaign.actualSpent || this.props.campaign.budget;
    return <div className={ this.classes.item }>
      <div className={ this.classes.top }>
        <div className={ this.classes.row } style={{  }}>
          <div className={ this.classes.cols }>
            <div className={ this.classes.colLeft }>
              <div className={ this.classes.title }>
              { this.props.campaign.name }
              </div>
            </div>
            <div className={ this.classes.colRight }>
              <div className={ this.classes.menu } data-icon="campaign:menu" onClick={ () => { this.props.showCampaign(this.props.campaign) } }/>
            </div>
          </div>
        </div>
        <div className={ this.classes.row } style={{ color: '#2CF212' }}>
          <div className={ this.classes.cols }>
            <div className={ this.classes.colLeft }>
              { budget ? '$' + budget.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',') : '$0' }
            </div>
            <div className={ this.classes.colRight }>
              <div className={ this.classes.circle }>
                <div className={ this.classes.icon } data-icon={this.props.channelIcon}>
                </div>
                <div className={ this.classes.number }>
                  { this.props.index+1 }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={ this.classes.bottom }>
        <div className={ this.classes.row } style={{ textAlign: 'center', paddingTop: '20px' }}>
          <div className={ this.classes.status }>
            { this.props.campaign.status }
          </div>
          <div className={ this.classes.row } style={{ marginTop: '15px' }}>
            <div className={ this.classes.cols }>
              <div className={ this.classes.colLeft } style={{ justifyContent: 'center' }}>
                <Label className={ this.classes.time }>
                  Marketing
                </Label>
                <Label className={ this.classes.time }>
                  {this.props.campaign.time && this.props.campaign.time.marketing}h
                </Label>
              </div>
              <div className={ this.classes.colCenter } style={{ justifyContent: 'center' }}>
                <Label className={ this.classes.time }>
                  Design
                </Label>
                <Label className={ this.classes.time }>
                  {this.props.campaign.time && this.props.campaign.time.design}h
                </Label>
              </div>
              <div className={ this.classes.colRight }>
                <Label className={ this.classes.time }>
                  Development
                </Label>
                <Label className={ this.classes.time }>
                  {this.props.campaign.time && this.props.campaign.time.development}h
                </Label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  }

}