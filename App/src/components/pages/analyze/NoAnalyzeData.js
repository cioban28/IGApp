import React from 'react';
import Component from 'components/Component';
import Page from 'components/Page';
import style from 'styles/plan/plan.css';
import analyzeStyle from 'styles/analyze/analyze.css';
import {Link} from 'react-router';
import setupStyle from 'styles/attribution/attribution-setp.css';
import {getNumberOfDaysBetweenDates} from 'components/utils/date';

export default class NoAnalyzeData extends Component {

  style = style;
  styles = [analyzeStyle, setupStyle];

  render() {
    const {userAccount: {startTime}} = this.props;

    const daysToAttributionData = 4 - getNumberOfDaysBetweenDates(new Date(), new Date(startTime));
    const daysForAttributionDataText = `${daysToAttributionData} day${daysToAttributionData === 1 ? '' : 's'}`;

    return <div>
      <Page contentClassName={this.classes.content} width="100%">
        <div className={this.classes.head}>
          <div className={this.classes.headTitle}>Analyze</div>
        </div>
        <div style={{paddingTop: '90px'}}>
          <div className={setupStyle.locals.contentTitle} style={{margin: '40px'}}>There is not enough data to show
            here, please come back in {daysForAttributionDataText}.<br/>
            If you haven’t placed our tracking script into your website yet, click <Link
              to="/settings/attribution/setup">here</Link>
          </div>
        </div>
      </Page>
    </div>;
  }
}