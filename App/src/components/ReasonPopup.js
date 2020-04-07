import React from 'react';
import Component from 'components/Component';
import Page from 'components/Page';
import Button from 'components/controls/Button';
import style from 'styles/reason-popup.css';
import {getMemberFullName} from 'components/utils/teamMembers';

export default class ReasonPopup extends Component {

  style = style;

  constructor(props) {
    super(props);
    this.state = {
      isOther: false,
      other: ''
    };
  }

  addReasonToAccount(reason) {
    if (reason) {
      this.props.updateUserAccount({reasonForUse: reason});
      this.props.close();
    }
  }

  render() {
    const name = this.props.userAccount && this.props.userAccount.teamMembers[0] && getMemberFullName(this.props.userAccount.teamMembers[0]);
    return <div hidden={this.props.hidden}>
      <Page popup={true} width={'952px'} contentClassName={this.classes.content}>
        <div className={this.classes.center}>
          <div className={this.classes.inner}>
            <div className={this.classes.title}>
              Signup complete!
            </div>
            <div className={this.classes.subTitle}>
              {`Hey ${name}, You're about to begin the product onboarding. The process is critical as InfiniGrow is using that data to tailor its recommendations to fit your needs and to provide the best experience for you.`}
            </div>
            <div className={this.classes.subTitleBold}>
              Before we start, what would you like to use InfiniGrow for?
            </div>
            <div className={this.classes.boxes}>
              <div className={this.classes.scratch} onClick={() => {
                this.addReasonToAccount('mix from scratch');
              }}>
                <div className={this.classes.boxText}>
                  Create a marketing mix from 'scratch'
                </div>
              </div>
              <div className={this.classes.optimize} onClick={() => {
                this.addReasonToAccount('optimize current mix');
              }}>
                <div className={this.classes.boxText}>
                  Optimize my current maketing mix
                </div>
              </div>
              <div className={this.classes.control} onClick={() => {
                this.addReasonToAccount('control and visibility');
              }}>
                <div className={this.classes.boxText}>
                  Get control & visibility over my marketing mix and data
                </div>
              </div>
              <div className={this.classes.endToEnd} onClick={() => {
                this.addReasonToAccount('end to end planning');
              }}>
                <div className={this.classes.boxText}>
                  End-To-End marketing planning
                </div>
              </div>
            </div>
            <div className={this.classes.center}>
              <input
                type="checkbox"
                className={this.classes.checkbox}
                onChange={() => {
                  this.setState({isOther: !this.state.isOther});
                }}
              />
              <div className={this.classes.subTitleBold}>
                Other?
              </div>
            </div>
            <div className={this.classes.center}>
              <input
                type="text"
                value={this.state.other}
                className={this.classes.otherBox}
                onChange={(e) => this.setState({other: e.target.value})}
                disabled={!this.state.isOther}
              />
            </div>
            <div className={this.classes.center}>
              <Button
                type="primary"
                style={{width: '75px'}}
                onClick={() => {
                  this.addReasonToAccount(this.state.other);
                }}>Send
              </Button>
            </div>
          </div>
        </div>
      </Page>
    </div>;
  }

}