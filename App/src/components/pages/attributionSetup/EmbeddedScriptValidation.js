import React from 'react';
import Component from 'components/Component';
import Label from 'components/ControlsLabel';
import style from 'styles/onboarding/onboarding.css';
import Button from 'components/controls/Button';
import navStyle from 'styles/profile/market-fit-popup.css';
import popupStyle from 'styles/welcome/add-member-popup.css';
import Page from 'components/Page';

export default class EmbeddedScriptValidation extends Component {

  style = style;
  styles = [popupStyle, navStyle];

  constructor() {
    super();

    this.state = {
      show: true,
      success: true
    };
  }

  render() {
    return (
      this.props.show ?
        this.props.success ?
          <div>
            <Page popup={true} width={'410px'} contentClassName={popupStyle.locals.content}
                  innerClassName={popupStyle.locals.inner}>
              <div className={popupStyle.locals.title}>
                It's a match!
              </div>
              <div className={this.classes.row}>
                <Label>
                  Successful connection
                </Label>
              </div>
              <div className={this.classes.footerCols}>
                <div className={this.classes.footerLeft}>
                  <Button
                    type="secondary"
                    style={{width: '72px'}}
                    onClick={this.props.close}>Close
                  </Button>
                </div>
              </div>
            </Page>
          </div>
          :
          <div>
            <Page popup={true} width={'410px'} contentClassName={popupStyle.locals.content}
                  innerClassName={popupStyle.locals.inner}>
              <div className={popupStyle.locals.title}>
                <div>We didn't find a connection yet</div>
              </div>
              <div className={this.classes.row}>
                Open a new tab, enter your website to trigger the connection and come back here
              </div>
              <div>
                Still not working? <a className={this.classes.linkText}
                                      href="mailto:support@infinigrow.com?&subject=Support Request"
                                      target="_blank">Contact us</a>
              </div>
              <div className={this.classes.footerCols}>
                <div  style={{marginTop: '20px'}} className={this.classes.footerLeft}>
                  <Button
                    type="secondary"
                    style={{width: '72px'}}
                    onClick={this.props.close}>Close
                  </Button>
                </div>
              </div>
            </Page>
          </div>
        : null
    );
  }
}

