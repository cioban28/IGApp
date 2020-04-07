import React from 'react';
import classnames from 'classnames';
import Component from 'components/Component';
import Tooltip from 'components/controls/Tooltip';
import style from 'styles/dashboard/top-x.css';
import dashboardStyle from "styles/dashboard/dashboard.css";

export default class TopX extends Component {

  style = style;
  styles = [dashboardStyle];

  render() {
    const {data, title} = this.props;

    const rows = data && data
      .filter(item => item.score)
      .sort((item1, item2) => item2.score - item1.score)
      .slice(0, 5)
      .map((item, index, sortedData) =>
        <div className={this.classes.row} key={index}>
          <div className={this.classes.left}>
            {item.icon ? <div className={this.classes.channelIcon} data-icon={item.icon}/> : null}
            <Tooltip
                className={this.classes.text}
                tip={item.title}
                id="topX-tooltip"
            >
              {item.title}
            </Tooltip>
          </div>
          <div className={this.classes.right}>
            <div className={this.classes.bar} style={{ width: Math.round(item.score / sortedData[0].score * 165) + 'px' }}/>
          </div>
        </div>
      );

    return (
      <div className={classnames(dashboardStyle.locals.item, this.classes.container)}>
        <div className={dashboardStyle.locals.text}>
          Top {title}s
        </div>
        <div className={this.classes.row}>
          <div className={this.classes.xTitle}>
            {title}
          </div>
          <Tooltip
            className={this.classes.scoreTitle}
            tip="Total contribution across metrics, calculated with your objectives"
            id="score-tooltip"
          >
            Attribution Score
          </Tooltip>
        </div>
        <div>
          {rows}
        </div>
      </div>
    );
  }
}