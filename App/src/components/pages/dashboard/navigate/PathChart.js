import React from 'react';
import PropTypes from 'prop-types';
import {ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Line} from 'recharts';
import ReactTooltip from 'react-tooltip';
import Component from 'components/Component';
import MonthsPopup from 'components/pages/dashboard/MonthsPopup';
import style from 'styles/dashboard/navigate.css';
import {getNickname} from 'components/utils/indicators';
import {formatNumber} from 'components/utils/budget';

const styles = style.locals;
const LINE_COLOR = '#4d91fc';

const ObjectiveSelect = ({objective, onNext, onPrev}) => {
  return (
    <div className={styles.objectiveSelect}>
      <button className={styles.prevObjective} onClick={onPrev}/>
      <div className={styles.objective}>
        <div className={styles.objectiveName}>{getNickname(objective.name)}</div>
        <div className={styles.objectiveTarget}>{formatNumber(objective.target)}</div>
      </div>
      <button className={styles.nextObjective} onClick={onNext}/>
    </div>
  );
};

const Channels = ({channels, tipSuffix}) => (
  <div className={styles.channels}>
    {channels.map((channel) => (
      <div
        key={channel.key}
        className={styles.channel}
        data-icon={channel.icon}
        style={{'--score': channel.score}}
        data-tip={`${channel.key}::${tipSuffix}`}
        data-for="pathChart"
        data-place="right"
      />
    ))}
  </div>
);

class PeriodsPanel extends Component {
  render() {
    const {months, onChange, maxMonths, channels} = this.props;

    return (
      <div className={styles.panelContainer}>
        <div className={styles.past}>
          <div className={styles.header}>
            past {months} months
            <div className={styles.editBlock}>
              <button
                className={styles.editButton}
                onClick={() => this.pastPopup.open()}
              />
              <MonthsPopup
                className={styles.editPopup}
                months={months}
                maxMonths={maxMonths}
                onChange={onChange}
                getRef={ref => this.pastPopup = ref}
              />
            </div>
          </div>
          <Channels channels={channels.past} tipSuffix="past"/>
        </div>
        <div className={styles.now}>
          <div className={styles.nowHeader}>
            now
          </div>
          <div className={styles.centerBlock}>
            <div className={styles.centerUnderlay}/>
            <div className={styles.centerDownCorner}/>
            <div className={styles.centerUpCorner}/>
          </div>
          <div className={styles.centerLine}/>
          <div className={styles.centerPointer}/>
          <Channels channels={channels.present} tipSuffix="present"/>
        </div>
        <div className={styles.future}>
          <div className={styles.header}>
            next {months} months
            <div className={styles.editBlock}>
              <button
                className={styles.editButton}
                onClick={() => this.futurePopup.open()}
              />
              <MonthsPopup
                className={styles.editPopup}
                months={months}
                maxMonths={maxMonths}
                onChange={onChange}
                getRef={ref => this.futurePopup = ref}
              />
            </div>
          </div>
          <Channels channels={channels.future} tipSuffix="future"/>
        </div>
      </div>
    );
  }
}

const TargetDot = ({cx, cy, dotsCount, index}) => {
  if (dotsCount !== index + 1) {
    return null;
  }

  return (
    <svg
      className={styles.pulse}
      viewBox="0 0 6 6"
      x={cx - 3}
      y={cy - 3}
      width={6}
      height={6}
    >
      <circle className={styles.firstCircle} fill={LINE_COLOR} cx="3" cy="3" r="3"/>
      <circle className={styles.secondCircle} fill={LINE_COLOR} cx="3" cy="3" r="3"/>
      <circle className={styles.thirdCircle} fill={LINE_COLOR} cx="3" cy="3" r="3"/>
      <circle fill={LINE_COLOR} cx="3" cy="3" r="3"/>
    </svg>
  );
};

class PathChart extends Component {

  style = style;

  get currentObjective() {
    return this.props.objectives[this.props.currentObjective];
  }

  get chartData() {
    const {months, data: {future, past}} = this.props;

    return [
      // Remove elements from end of array
      ...past.slice(-(months || 1)),
      ...future.slice(0, months)
    ].map((month, index) => ({
      name: index,
      value: month[this.currentObjective.name]
    }));
  }

  handlePrev = this.props.handleObjectiveChange(-1);
  handleNext = this.props.handleObjectiveChange(1);

  renderTooltip = (dataTip) => {
    if (!dataTip) {
      return null;
    }

    const [channel, suffix] = dataTip.split('::');
    const tooltipRenderer = this.props.tooltip[suffix];

    return tooltipRenderer ? tooltipRenderer(channel) : null;
  };

  render() {
    const {maxMonths, channels, handleMonthsChange, months} = this.props;
    const {chartData, currentObjective} = this;

    return (
      <div className={this.classes.chartWrapper}>
        <div className={this.classes.chartContainer}>
          <PeriodsPanel
            maxMonths={maxMonths}
            months={months}
            onChange={handleMonthsChange}
            channels={channels}
          />
          <ObjectiveSelect
            objective={currentObjective}
            onNext={this.handleNext}
            onPrev={this.handlePrev}
          />
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              className={styles.chart}
              key={`${currentObjective.name}-${chartData.length}`}
              layout="vertical"
              width={400}
              height={700}
              data={chartData}
              margin={{top: 5, right: 30, left: 20, bottom: 5}}
            >
              <defs>
                <linearGradient id="linear">
                  <stop offset="0%" stopColor="rgba(77, 145, 252, 0.2)"/>
                  <stop offset="100%" stopColor={LINE_COLOR}/>
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" horizontal={false}/>
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{fontSize: '12px', fill: '#67759e', fontWeight: 600, letterSpacing: '0.1px'}}
                tickMargin={10}
              />
              <YAxis dataKey="name" type="category" reversed hide/>
              <Line
                type="monotone"
                dataKey="value"
                stroke="url(#linear)"
                strokeWidth={2}
                dot={<TargetDot dotsCount={chartData.length}/>}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <ReactTooltip
          key={months}
          className={this.classes.tooltip}
          getContent={this.renderTooltip}
          id="pathChart"
        />
      </div>
    );
  }
}

const DataType = PropTypes.objectOf(PropTypes.number);
const DataArrayType = PropTypes.arrayOf(DataType).isRequired;
const ChannelType = PropTypes.shape({
  key: PropTypes.string.isRequired,
  score: PropTypes.number.isRequired,
  icon: PropTypes.string.isRequired
});
const ChannelsType = PropTypes.arrayOf(ChannelType).isRequired;
const ObjectiveType = PropTypes.shape({
  name: PropTypes.string.isRequired,
  target: PropTypes.number.isRequired
});

PathChart.propTypes = {
  data: PropTypes.shape({
    past: DataArrayType,
    future: DataArrayType
  }),
  channels: PropTypes.shape({
    past: ChannelsType,
    future: ChannelsType,
    present: ChannelsType
  }),
  tooltip: PropTypes.shape({
    past: PropTypes.func.isRequired,
    future: PropTypes.func.isRequired,
    present: PropTypes.func.isRequired
  }),
  objectives: PropTypes.arrayOf(ObjectiveType).isRequired
};

export default PathChart;
