import React from 'react';
import PropTypes from 'prop-types';
import Component from 'components/Component';
import Masonry from 'react-masonry-component';
import ChannelCube, {formatPrice} from 'components/pages/plan/ChannelCube';
import {parseBudgets} from 'data/parseAnnualPlan';
import style from 'styles/plan/current-tab.css';
import planStyles from 'styles/plan/plan.css';
import icons from 'styles/icons/plan.css';
import Paging from 'components/Paging';
import {formatDate} from 'components/utils/date';

export default class CurrentTab extends Component {

  style = style;
  styles = [planStyles, icons];

  static propTypes = {
    planDate: PropTypes.string,
    committedBudgets: PropTypes.array
  };

  static defaultProps = {
    planDate: null
  };

  constructor(props) {
    super(props);
    this.state = props;
  }

  componentWillReceiveProps(nextProps) {
    this.setState(nextProps);
  }

  render() {
    const {planDate, calculatedData: {committedBudgets}, planUnknownChannels, inHouseChannels} = this.state;

    const planData = parseBudgets(committedBudgets, planUnknownChannels, inHouseChannels);
    const planDataChannels = Object.keys(planData).filter(channelName => channelName !== '__TOTAL__');
    const monthBudget = planData['__TOTAL__'].approvedValues[0];

    const events = this.state.events ?
      this.state.events
        .filter(event => {
          const currentMonth = parseInt(planDate.split('/')[0]);
          const eventMonth = parseInt(event.startDate.split('/')[1]);
          return currentMonth === eventMonth;
        })
        .map((event, index) => {
          return <p key={index}>
            {event.link
              ? <a href={event.link} target="_blank">{event.eventName}</a>
              : event.eventName} {event.startDate} {event.location}
          </p>;
        })
      : null;

    const formattedDate = formatDate(planDate);

    return <div className={this.classes.wrap}>
      <Paging title={formattedDate}/>
      <div className={planStyles.locals.title}>
        <div className={planStyles.locals.titleMain}>
          <div className={planStyles.locals.titleText}>
            {formattedDate}: Budget
          </div>
          <div className={planStyles.locals.titlePrice}>{formatPrice(monthBudget)}</div>
        </div>
        {/*
        <div className={planStyles.locals.titleButtons}>
          <Button type="accent2" style={{
            width: '106px'
          }} onClick={() => {
            this.refs.eventsPopup.open();
          }}>Events</Button>

          <div style={{position: 'relative'}}>
            <PlanPopup ref="eventsPopup" style={{
              width: '367px',
              right: '0',
              left: 'auto',
              top: '20px'
            }} title="EVENTS">
              <PopupTextContent>
                {events.length > 0 ? events : <p>No events</p>}
              </PopupTextContent>
            </PlanPopup>
          </div>
        </div>
        */}
      </div>
      <div className={this.classes.innerBox}>
        <Masonry className={this.classes.boxesContainer} options={{
          fitWidth: true,
          gutter: 15
        }}>
          {
            planDataChannels.map((channelName) => (
              <ChannelCube
                key={channelName}
                title={channelName}
                data={planData[channelName]}
                month={0}
                monthBudget={monthBudget}
              />
            ))
          }
        </Masonry>
      </div>
      {/*
       <Explanation title="Explanation" text="Your strategy was built based on 89 experts and statistical analysis of 23 similar companies.
       The 2 main fields (channels) that are recommended to you in the current month are: Advertising and Public Relations. 81% of similar companies to yours are using Advertising as the main channel in their strategy in we thought that you should too. In contrary, only 22% of these companies are using Public Relations as one of the main channels. But in your case, we thought that this channel would be a perfect fit to your marketing mix due to the fact that your main goal is getting as much awareness as possible." />
       */}
    </div>;
  }
}
