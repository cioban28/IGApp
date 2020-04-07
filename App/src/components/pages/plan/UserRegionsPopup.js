import React from 'react';
import Component from 'components/Component';
import Page from 'components/Page';
import Title from 'components/onboarding/Title';
import Textfield from 'components/controls/Textfield';
import style from 'styles/onboarding/onboarding.css';
import Button from 'components/controls/Button';

export default class UserRegionsPopup extends Component {

  style = style;

  constructor(props) {
    super(props);
    this.state = {
      regionName: ''
    };
  }

  createNewRegion = () => {
    const regionName = this.state.regionName;
    if (regionName) {
      const userRegions = [...this.props.userRegions];
      if (!userRegions.includes(regionName)) {
        userRegions.push(regionName);
      }
      this.props.updateUserMonthPlan({userRegions: userRegions}, this.props.region, this.props.planDate)
        .then(() => {
          this.props.close();
          this.props.afterRegionCreation(regionName);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  render() {
    return <div hidden={this.props.hidden}>
      <Page popup={true} width={'300px'}>
        <Title title="New Region"
               popup={true}
        />
        <div className={this.classes.row}>
          <Textfield value={this.state.regionName} required={true}
                     onChange={(e) => this.setState({regionName: e.target.value})}/>
        </div>
        <div className={this.classes.footer}>
          <div className={this.classes.footerLeft}>
            <Button type="secondary" style={{width: '100px'}} onClick={this.props.close}>Cancel</Button>
          </div>
          <div className={this.classes.footerRight}>
            <Button type="primary" style={{width: '100px'}} disabled={!this.state.regionName}
                    onClick={this.createNewRegion}>Create</Button>
          </div>
        </div>
      </Page>
    </div>;
  }
}