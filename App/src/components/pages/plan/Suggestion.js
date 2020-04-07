import React from 'react';
import Component from 'components/Component';
import style from 'styles/plan/suggestion.css';
import { getNickname } from 'components/utils/channels';
import { formatNumber } from 'components/utils/budget';

export default class Suggestion extends Component {

  style = style;

  constructor(props) {
    super(props);
    this.state = {
      showIcon: null
    }
  }

  approve() {
    this.setState({showIcon: 'approve'}, () => {
      setTimeout(() => {
        this.props.approveChannel();
      }, 1000);
    });
  }

  decline() {
    this.setState({showIcon: 'decline'}, () => {
      setTimeout(() => {
        this.props.declineChannel();
      }, 1000);
    });
  }

  render() {
    const {suggested, current, channel} = this.props;
    return <div>
      { this.state.showIcon ?
        <div className={ this.classes.iconShell }>
          <div className={this.classes.actionSuccess} data-action={this.state.showIcon}/>
        </div>
        :
        <div className={this.classes.itemInner}>
          <div className={this.classes.title}>
            {getNickname(channel)}
          </div>
          <div className={this.classes.center} style={{ position: 'relative' }}>
            <div className={this.classes.channelIcon} data-icon={"plan:" + channel}/>
            <div className={this.classes.forecastButton} onClick={ this.props.forecast }/>
          </div>
          <div className={this.classes.budgets}>
            <div className={this.classes.current}>
              ${formatNumber(current)}
            </div>
            {" -> "}
            <div className={this.classes.suggested}>
              ${formatNumber(suggested)}
            </div>
          </div>
          <div className={this.classes.actions}>
            <div className={this.classes.decline} onClick={this.decline.bind(this)}/>
            <div className={this.classes.approve} onClick={this.approve.bind(this)}/>
          </div>
        </div>
      }
    </div>
  }
}