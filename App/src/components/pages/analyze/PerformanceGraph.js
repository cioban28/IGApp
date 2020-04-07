import React from 'react';
import memoize from 'memoize-one';
import Component from 'components/Component';
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  Bar,
  Tooltip as RechartsTooltip
} from 'recharts';
import {formatBudgetShortened} from 'components/utils/budget';
import {getIndicatorsWithProps, getNickname as getIndicatorNickname} from 'components/utils/indicators';
import {getChannelsWithProps, getNickname as getChannelNickname} from 'components/utils/channels';
import PlanPopup, {
  TextContent as PopupTextContent
} from 'components/pages/plan/Popup';
import remove from 'lodash/remove';
import {getColor} from 'components/utils/colors';
import { formatCustomDate } from 'components/utils/date';
import CustomCheckbox from 'components/controls/CustomCheckbox';
import style from 'styles/analyze/performance-graph.css';

const fillGapsWithZeros = memoize((data) => {
  const zeroData = Object.keys(getIndicatorsWithProps())
    .filter(indicator => !!data.find(item => item[indicator]))
    .reduce((res, key) => ({ ...res, [key]: 0 }), {})

  return data.map((item) => ({ ...zeroData, ...item }))
})

export default class PerformanceGraph extends Component {

  style = style;

  constructor() {
    super();

    this.state = {
      activeAdvancedIndicator: ['SQL'],
      activeAdvancedChannels: ['total'],
      selectedAdvancedIndicator: ['SQL'],
      selectedAdvancedChannels: ['total']
    };
  }

  componentDidMount() {
    this.setState({activeAdvancedIndicator: [this.props.defaultIndicator]});
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.defaultIndicator !== this.props.defaultIndicator) {
      this.setState({activeAdvancedIndicator: [nextProps.defaultIndicator]});
    }
  }

  changeIndicatorsSettings = (indicator) => {
    const selectedAdvancedIndicator = [...this.state.selectedAdvancedIndicator];
    const found = selectedAdvancedIndicator.findIndex(i => i === indicator);

    if (found > -1) {
      selectedAdvancedIndicator.splice(found, 1)
    }
    else {
      selectedAdvancedIndicator.push(indicator)
    }

    this.setState({selectedAdvancedIndicator});
  }

  changeChannelsSettings = (channel) => {
    const selectedAdvancedChannels = this.state.selectedAdvancedChannels.slice();
    if (selectedAdvancedChannels.includes('total')) {
      this.setState({selectedAdvancedChannels: [channel]});
    }
    else if (channel === 'total') {
      this.setState({selectedAdvancedChannels: ['total']});
    }
    else {
      const removed = remove(selectedAdvancedChannels, (item) => item === channel);

      if (!removed || removed.length === 0) {
        if (selectedAdvancedChannels.length < 3) {
          selectedAdvancedChannels.push(channel);
        }
      }

      this.setState({selectedAdvancedChannels});
    }
  }

  getSettingsIndicators = () => {
    const {data} = this.props;
    const {selectedAdvancedIndicator} = this.state;
    const indicatorsProperties = getIndicatorsWithProps();

    return Object.keys(indicatorsProperties)
      .filter(indicator => !!data.find(month => month[indicator]))
      .map(indicator => (
        <CustomCheckbox
          key={indicator}
          checked={selectedAdvancedIndicator.includes(indicator)}
          onChange={() => this.changeIndicatorsSettings(indicator)}
          className={this.classes.checkboxContainer}
          checkboxClassName={this.classes.checkbox}
          checkMarkClassName={this.classes.checkboxMark}
          childrenClassName={this.classes.checkboxLabel}
        >
          {indicatorsProperties[indicator].nickname}
        </CustomCheckbox>
      ));
  }

  getSettingsChannels = () => {
    const {data} = this.props;
    const {selectedAdvancedChannels} = this.state;
    const channelsProperties = getChannelsWithProps();

    return ['total', ...Object.keys(channelsProperties)]
      .filter(channel => !!data.find(month => month[channel]))
      .map(channel => (
        <CustomCheckbox
          key={channel}
          checked={selectedAdvancedChannels.includes(channel)}
          onChange={() => this.changeChannelsSettings(channel)}
          className={this.classes.checkboxContainer}
          checkboxClassName={this.classes.checkbox}
          checkMarkClassName={this.classes.checkboxMark}
          childrenClassName={this.classes.checkboxLabel}
        >
          {channel === 'total' ? 'Total' : channelsProperties[channel].nickname}
        </CustomCheckbox>
      ));
  }

  saveSettings = () => {
    this.setState(prevState => ({
      activeAdvancedIndicator: prevState.selectedAdvancedIndicator,
      activeAdvancedChannels: prevState.selectedAdvancedChannels
    }));
  }

  cancelSettings = () => {
    this.setState(prevState => ({
      selectedAdvancedIndicator: prevState.activeAdvancedIndicator,
      selectedAdvancedChannels: prevState.activeAdvancedChannels
    }));
  }

  closePopup = (saveSettings) => {
    if (saveSettings) {
      this.saveSettings();
    }
    this.refs.advancedSettingsPopup.close();
  }

  getBars = () => {
    const {activeAdvancedChannels, activeAdvancedIndicator} = this.state;

    const getShape = ({fill, x, y, width, height}) => {
      return height === 0 ? null : (
        <path
          d={`M ${x},${y + 2} h ${width} v ${height - 2} h -${width} Z`}
          stroke='none'
          fill={fill}
        />
      );
    };

    return activeAdvancedChannels.map((channel, index) =>
      <Bar
        key={channel}
        yAxisId='left'
        dataKey={channel}
        stackId='channels'
        fill={getColor(index)}
        shape={getShape}
        barSize={40}
      />
    );
  }

  getChartTooltip = (data) => {
    const { active, payload, label } = data;
    const {activeAdvancedIndicator, activeAdvancedChannels} = this.state;

    if (active) {
      const setValueText = (selector, placeholder, prefix) => {
        const activePayload = payload.find(i => i.name === selector);
        return activePayload ? `${prefix ? prefix : ''}${formatBudgetShortened(activePayload.payload[selector])}` : placeholder;
      }

      return (
        <div className={this.classes.chartTooltip}>
          <div className={this.classes.chartTooltipTitle}>
          {label}
          </div>
          <div className={this.classes.chartTooltipChannelLabel}>
            SPENDING
          </div>
          <div className={this.classes.chartTooltipChannelValue}>
            {
              activeAdvancedChannels.map((channel, index) => (
                <div key={index} className={this.classes.chartTooltipChannelItem}>
                  <div
                    className={this.classes.chartTooltipChannelThumbnail} 
                    style={{
                      backgroundColor: getColor(index)
                    }}
                  />
                  {setValueText(channel, '$0', '$')}
                  <div className={this.classes.chartTooltipChannelText}>
                    {this.getChannelLabel(channel, 'total spent')}
                  </div>
                </div>
              ))
            }
          </div>
          <div className={this.classes.chartTooltipChannelLabel}>
            METRICS
          </div>
          <div className={this.classes.chartTooltipChannelValue}>
            {
              activeAdvancedIndicator.map((indicator, index) => (
                <div key={indicator} className={this.classes.chartTooltipChannelItem}>
                  <div
                    className={this.classes.chartTooltipChannelThumbnail}
                    style={{
                      backgroundColor: this.getIndicatorColor(index)
                    }}
                  />
                  {setValueText(indicator, '0')}
                  <div className={this.classes.chartTooltipChannelText}>
                    {this.getIndicatorLabel(indicator)}
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      );
    }
  }

  getLines = () => this.state.activeAdvancedIndicator.map((indicator, index) =>
    <Line
      key={indicator}
      dataKey={indicator}
      yAxisId='right'
      type='monotone'
      stroke={this.getIndicatorColor(index)}
      fill='#ffffff'
      strokeWidth={2.5}
    />
  )

  getChannelLabel = (channel, totalLabel) => {
    return channel === 'total' ? totalLabel : `Spent on ${getChannelNickname(channel)}`
  }

  getIndicatorLabel = (indicator) => `${getIndicatorNickname(indicator)}`

  // prevent colors doubling
  getIndicatorColor = (index) => getColor(index + this.state.activeAdvancedChannels.length)

  render() {
    const {isPast, months, customDateMode, customDate} = this.props;
    const {activeAdvancedIndicator, activeAdvancedChannels} = this.state;
    const data = fillGapsWithZeros(this.props.data);
    let dateText

    if (customDateMode) {
      dateText = formatCustomDate(customDate)
    } else {
      dateText = `${isPast ? 'Last' : 'Next'} ${months} Month${months > 1 ? 's' : ''}`
    }

    return (
      <div className={this.classes.item}>
        <div className={this.classes.itemTitle}>
          {isPast ? 'Past' : 'Future'} Spend & Impact
          <div className={this.classes.timeText}>
             {dateText}
          </div>
          <div className={this.classes.settingsContainer}>
            <div
              className={this.classes.settings}
              onClick={() => this.refs.advancedSettingsPopup.open()}
            />
            <PlanPopup
              ref='advancedSettingsPopup'
              title='Settings'
              className={this.classes.popup}
              onClose={this.cancelSettings}
              primaryButton={{
                text: 'Save settings',
                onClick: () => this.closePopup(true)
              }}
              secondaryButton={{
                text: 'Cancel',
                onClick: () => this.closePopup(false)
              }}
            >
              <PopupTextContent>
                <div className={this.classes.popupContentContainer}>
                  <div className={this.classes.popupContentColumn}>
                    <div className={this.classes.popupContentColumnTitle}>
                      Metrics
                    </div>
                    {this.getSettingsIndicators()}
                  </div>
                  <div className={this.classes.popupContentColumn}>
                    <div className={this.classes.popupContentColumnTitle}>
                      Spend
                    </div>
                    {this.getSettingsChannels()}
                  </div>
                </div>
              </PopupTextContent>
            </PlanPopup>
          </div>
        </div>
        <div className={this.classes.chart}>
          <ResponsiveContainer width='100%' height='100%'>
            <ComposedChart
              data={data}
              maxBarSize={85}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray='3 3'
                strokeWidth={1}
                stroke='rgba(54, 56, 64, 0.1)'
              />
              <XAxis
                dataKey='name'
                axisLine={false}
                tick={{fontSize: '12px', color: '#707ea7'}}
                tickLine={false}
                tickMargin={10}
              />
              <YAxis
                yAxisId='left'
                axisLine={false}
                tick={{fontSize: '12px', color: '#707ea7'}}
                tickLine={false}
                tickMargin={15}
                tickFormatter={v => '$' + formatBudgetShortened(v)}
              />
              <YAxis
                yAxisId='right'
                orientation='right'
                axisLine={false}
                tick={{fontSize: '12px', color: '#707ea7'}}
                tickLine={false}
                tickMargin={15}
                tickFormatter={formatBudgetShortened}
              />
              {this.getBars()}
              {this.getLines()}
              <RechartsTooltip
                cursor={false}
                offset={0}
                isAnimationActive={false}
                content={this.getChartTooltip}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className={this.classes.chartLegend}>
          {
            activeAdvancedChannels.map((channel, index) => (
              <div key={index} className={this.classes.legend}>
                <div
                  className={this.classes.legendThumbnail} 
                  style={{
                    backgroundColor: getColor(index)
                  }}
                />
                <div className={this.classes.legendLabel}>
                  {this.getChannelLabel(channel, 'Total')}
                </div>
              </div>
            ))
          }
          {
            activeAdvancedIndicator.map((indicator, index) => {
              return (
                <div key={indicator} className={this.classes.legend}>
                  <div
                    className={this.classes.indicatorLegendThumbnail}
                    style={{
                      borderColor: this.getIndicatorColor(index)
                    }}
                  />
                  <div className={this.classes.legendLabel}>
                    {this.getIndicatorLabel(indicator)}
                  </div>
                </div>
              )
            })
          }
        </div>
      </div>
    );
  }
}
