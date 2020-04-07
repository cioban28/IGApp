import React from 'react';
import Component from 'components/Component';
import Textfield from 'components/controls/Textfield';
import Label from 'components/ControlsLabel';
import { formatNumber } from 'components/utils/budget';
import Button from 'components/controls/Button';
import copy from 'copy-to-clipboard';
import style from 'styles/onboarding/onboarding.css';
import trackingStyle from 'styles/campaigns/tracking.css';
import { getChannelsWithProps } from 'components/utils/channels';

export default class Tracking extends Component {

  style = style;
  styles = [trackingStyle];

  constructor(props) {
    super(props);
    let utms = props.campaign.tracking.utms || [];
    const channels = getChannelsWithProps();
    props.campaign.source.forEach((source, index) => {
      if (!utms[index]){
        utms[index] = {};
      }
      if (!utms[index].source) {
        utms[index].source = channels[source] && channels[source].source ? channels[source].source : source;
      }
      if (!utms[index].medium) {
        utms[index].medium = channels[source] && channels[source].medium ? channels[source].medium : 'other';
      }
    });
    this.state = {
      isHttp: true,
      copied: '',
      advancedVisible: [],
      utms: utms,
      campaignUTM: props.campaign.tracking.campaignUTM || props.campaign.name
    }
  };

  static defaultProps = {
    campaign: {
      tracking: {
        utms: []
      }
    }
  };

  componentWillReceiveProps(nextProps) {
    let utms = nextProps.campaign.tracking.utms || [];
    const channels = getChannelsWithProps();
    nextProps.campaign.source.forEach((source, index) => {
      if (!utms[index]){
        utms[index] = {};
      }
      if (!utms[index].source) {
        utms[index].source = channels[source] && channels[source].source ? channels[source].source : source;
      }
      if (!utms[index].medium) {
        utms[index].medium = channels[source] && channels[source].medium ? channels[source].medium : 'other';
      }
    });
    this.setState({
      copied: '',
      utms: utms,
      campaignUTM: this.state.campaignUTM || nextProps.campaign.name
    });
  }

  toggleProtocol() {
    let update = Object.assign({}, this.props.campaign);
    update.tracking.isHttp = !this.props.campaign.tracking.isHttp;
    this.props.updateState({campaign: update});
  }

  handleChange(parameter, event) {
    let update = Object.assign({}, this.props.campaign);
    update.tracking[parameter] = event.target.value;
    this.props.updateState({campaign: update});
  }

  handleChangeUTM(parameter, index, event) {
    let utms = this.state.utms;
    utms[index][parameter] = event.target.value;
    this.setState({utms: utms});
  }

  generateLinks() {
    let update = Object.assign({}, this.props.campaign);
    update.tracking.urls = [];
    update.tracking.utms = this.state.utms;
    update.tracking.campaignUTM = this.state.campaignUTM;
    update.source.forEach((source, index) => {
      if (!this.state.campaignUTM) {
        this.refs.campaign.focus();
      }
      else if (!this.state.utms[index].source || this.state.utms[index].source.includes("(")) {
        this.refs["source" + index].focus();
      }
      else if (!this.state.utms[index].medium) {
        this.refs["medium" + index].focus();
      }
      else {
        const url = (update.tracking.isHttp ? 'http://' : 'https://') +
          update.tracking.baseUrl +
          '/?utm_source=' + this.state.utms[index].source +
          '&utm_medium=' + this.state.utms[index].medium +
          '&utm_campaign=' + this.state.campaignUTM +
          (this.state.utms[index].content ? '&utm_content=' + this.state.utms[index].content : '' ) +
          (this.state.utms[index].term ? '&utm_term=' + this.state.utms[index].term : '');
        fetch('https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyDEoi0JNfWmDlnN8swZz_tZc3Vu14yV0rw', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({longUrl: encodeURI(url)})
        })
          .then((response) => {
            response.json()
              .then((data) => {
                if (data) {
                  update.tracking.urls.splice(index, 0, {
                    long: data.longUrl,
                    short: data.id,
                    createDate: new Date()
                  });
                  if (update.tracking.urls.length === update.source.length) {
                    this.props.updateState({campaign: update, unsaved: false});
                    this.props.updateCampaign(update);
                  }
                }
              })
          })
          .catch((error) => {
            console.log(error);
          });
      }
    })
  }

  handleFocus(event) {
    event.target.select();
  }

  copy(value) {
    this.setState({copied: ''});
    copy(value);
    this.setState({copied: value});
  }

  toggleAdvanced(index) {
    const advancedVisible = this.state.advancedVisible;
    advancedVisible[index] = !advancedVisible[index];
    this.setState({advancedVisible: advancedVisible});
  }

  render() {
    const sources = this.props.campaign.source.map((source, index) => {
      const isBrackets = this.state.utms[index].source.includes("(");
      return <div key={index}>
        <div className={ this.classes.row }>
          <Label>{"Source " + (index+1)}</Label>
          <Textfield
            value={ isBrackets ? '' : this.state.utms[index].source }
            onChange={ this.handleChangeUTM.bind(this, 'source', index) }
            placeHolder={ isBrackets ? this.state.utms[index].source.replace(/[()]/g, "") : '' }
            ref={"source" + index}
          />
        </div>
        <div className={ this.classes.row }>
          <Label>{"Medium " + (index+1)}</Label>
          <Textfield value={ this.state.utms[index].medium } onChange={ this.handleChangeUTM.bind(this, 'medium', index) } ref={"medium" + index}/>
        </div>
        <div className={ this.classes.row }>
          <div className={ trackingStyle.locals.advanced } onClick={ this.toggleAdvanced.bind(this, index) }>Advanced</div>
        </div>
        <div hidden={ !this.state.advancedVisible[index] }>
          <div className={ this.classes.row }>
            <Label>{"Content " + (index+1)}</Label>
            <Textfield value={ this.state.utms[index].content } onChange={ this.handleChangeUTM.bind(this, 'content', index) }/>
          </div>
          <div className={ this.classes.row }>
            <Label>{"Term " + (index+1)}</Label>
            <Textfield value={ this.state.utms[index].term } onChange={ this.handleChangeUTM.bind(this, 'term', index) }/>
          </div>
        </div>
      </div>
    });

    const tracking = this.props.campaign.tracking.urls ?
      this.props.campaign.tracking.urls.map((url, index) => {
        return <div className={trackingStyle.locals.urls } key={index}>
          <div className={ trackingStyle.locals.urlLine }>
            <Label className={ trackingStyle.locals.urlTitle }>{"Full Tracking URL" + (index+1)}</Label>
            <Textfield inputClassName={ trackingStyle.locals.urlTextbox } style={{ width: '469px' }} value={ url.long } readOnly={true} onFocus={ this.handleFocus.bind(this) }/>
            <div className={ trackingStyle.locals.copyToClipboard } onClick={ this.copy.bind(this, url.long) }/>
            <div className={ trackingStyle.locals.copyMessage } hidden={ this.state.copied !== url.long }>
              Copied!
            </div>
          </div>
          <div className={ trackingStyle.locals.urlLine }>
            <Label className={ trackingStyle.locals.urlTitle }>{"Shortened Tracking URL" + (index+1)}</Label>
            <Textfield inputClassName={ trackingStyle.locals.urlTextbox } style={{ width: '469px' }} value={ url.short } readOnly={true} onFocus={ this.handleFocus.bind(this) }/>
            <div className={ trackingStyle.locals.copyToClipboard } onClick={ this.copy.bind(this, url.short) }/>
            <div className={ trackingStyle.locals.copyMessage } hidden={ this.state.copied !== url.short }>
              Copied!
            </div>
          </div>
        </div>
      })
      : null;

    return <div>
      <div className={ trackingStyle.locals.baseUrl }>
        <div className={ trackingStyle.locals.protocolBox } onClick={ this.toggleProtocol.bind(this) }>
          <div className={ trackingStyle.locals.protocol }>
            {this.props.campaign.tracking.isHttp ? 'http://' : 'https://' }
          </div>
        </div>
        <div className={ trackingStyle.locals.userBoxUrl }>
          <input className={ trackingStyle.locals.userInputUrl } placeholder="Enter URL" value={ this.props.campaign.tracking.baseUrl } onChange={ this.handleChange.bind(this, 'baseUrl') }/>
        </div>
      </div>
      <div className={ this.classes.row }>
        <Label style={{ fontSize: '18px', fontWeight: 'bold' }}>UTMs</Label>
      </div>
      <div className={ this.classes.row }>
        <Label>Campaign</Label>
        <Textfield value={ this.state.campaignUTM } onChange={ (e)=>{ this.setState({campaignUTM: e.target.value}) } } ref={"campaign"}/>
      </div>
      { sources }
      <div className={ trackingStyle.locals.rowCenter }>
        <Button type="primary" style={{ width: '170px' }} onClick={ this.generateLinks.bind(this) }>
          Generate links
        </Button>
      </div>
      {tracking}
    </div>
  }

}