import React from 'react';
import PropTypes from 'prop-types';
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  Tooltip as RechartsTooltip
} from 'recharts';
import Component from 'components/Component';
import {INDICATORS, COLUMNS} from 'components/pages/PlannedVsActual';
import PlanPopup, {
  TextContent as PopupTextContent
} from 'components/pages/plan/Popup';
import CustomCheckbox from 'components/controls/CustomCheckbox';
import {getColor} from 'components/utils/colors';
import {formatBudget, formatBudgetShortened} from 'components/utils/budget';
import {
  getChannelsWithProps,
  getNickname as getChannelNickname
} from 'components/utils/channels';
import {
  getNickname as getIndicatorNickname
} from 'components/utils/indicators';
import style from 'styles/plan/planned-vs-actual-chart.css';

export default class PlannedVsActualChart extends Component {

  style = style;

  static propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    months: PropTypes.arrayOf(PropTypes.string).isRequired
  }

  constructor() {
    super();

    this.state = {
      activeIndicator: 'spending',
      activeColumn: COLUMNS.planVsActual.value,
      activeChannel: 'total',
      selectedIndicator: 'spending',
      selectedColumn: COLUMNS.planVsActual.value,
      selectedChannel: 'total'
    };
  }

  getIndicatorNicknameWithSpending = (indicator) => {
    return indicator === 'spending' ? 'Spending' : getIndicatorNickname(indicator);
  }

  getIndicatorOptions = () => {
    const {selectedIndicator} = this.state;

    return INDICATORS.map(indicator => (
      <CustomCheckbox
        key={indicator}
        checked={indicator === selectedIndicator}
        onChange={() => this.setState({selectedIndicator: indicator})}
        className={this.classes.checkboxContainer}
        checkboxClassName={this.classes.checkbox}
        checkMarkClassName={this.classes.checkboxMark}
        childrenClassName={this.classes.checkboxLabel}
      >
        {this.getIndicatorNicknameWithSpending(indicator)}
      </CustomCheckbox>
    ));
  }

  getColumnOptions = () => {
    const {selectedColumn} = this.state;

    return [COLUMNS.planned, COLUMNS.actual, COLUMNS.planVsActual].map(column => (
      <CustomCheckbox
        key={column.value}
        checked={column.value === selectedColumn}
        onChange={() => this.setState({selectedColumn: column.value})}
        className={this.classes.checkboxContainer}
        checkboxClassName={this.classes.checkbox}
        checkMarkClassName={this.classes.checkboxMark}
        childrenClassName={this.classes.checkboxLabel}
      >
        {column.label}
      </CustomCheckbox>
    ));
  }

  getChannelOptions = () => {
    const {data} = this.props;
    const {selectedChannel} = this.state;

    let channels = ['total'];
    data.forEach(item => {
      channels = channels.concat(item.parsedChannels.map(o => o.channel));
    });

    const channelsProperties = getChannelsWithProps();
    return ['total', ...Object.keys(channelsProperties)]
      .filter(channel => !!channels.find(item => item === channel))
      .map(channel => (
        <CustomCheckbox
          key={channel}
          checked={channel === selectedChannel}
          onChange={() => this.setState({selectedChannel: channel})}
          className={this.classes.checkboxContainer}
          checkboxClassName={this.classes.checkbox}
          checkMarkClassName={this.classes.checkboxMark}
          childrenClassName={this.classes.checkboxLabel}
        >
          {channel === 'total' ? 'Total' : channelsProperties[channel].nickname}
        </CustomCheckbox>
      )
    );
  }

  saveSettings = () => {
    this.setState(prevState => ({
      activeIndicator: prevState.selectedIndicator,
      activeColumn: prevState.selectedColumn,
      activeChannel: prevState.selectedChannel
    }));
  }

  cancelSettings = () => {
    this.setState(prevState => ({
      selectedIndicator: prevState.activeIndicator,
      selectedColumn: prevState.activeColumn,
      selectedChannel: prevState.activeChannel
    }));
  }

  closePopup = (saveSettings) => {
    if (saveSettings) {
      this.saveSettings();
    }
    this.popup.close();
  }

  getTableData = () => {
    const {data, months} = this.props;

    return data.map((item, index) => {
      let totalItem = {
        channel: 'total'
      };
      INDICATORS.forEach(indicator => {
        totalItem[indicator] = {
          planned: 0,
          actual: 0,
          planVsActual: 0
        }
      });

      let channels = item.parsedChannels.map(item => {
        let channelItem = {
          channel: item.channel
        }
        INDICATORS.forEach(indicator => {
          channelItem[indicator] = {
            planned: item[indicator].planned,
            actual: item[indicator].actual,
            planVsActual: item[indicator].actual - item[indicator].planned
          };
          totalItem[indicator].planned += channelItem[indicator].planned;
          totalItem[indicator].actual += channelItem[indicator].actual;
          totalItem[indicator].planVsActual += channelItem[indicator].planVsActual;
        });
        return channelItem;
      });
      channels.push(totalItem);

      return {
        name: months[index],
        channels
      };
    });
  }

  getBarData = (item) => {
    const {
      activeIndicator,
      activeColumn,
      activeChannel
    } = this.state;

    const channel = item.channels.find(o => o.channel === activeChannel);
    return channel ? channel[activeIndicator][activeColumn] : 0;
  }

  getChartTooltip = (data) => {
    const { active, payload, label } = data;
    const {
      activeIndicator,
      activeColumn,
      activeChannel
    } = this.state;

    if (active) {
      const channel = payload[0].payload.channels.find(item => item.channel === activeChannel);
      const value = channel ? channel[activeIndicator][activeColumn] : 0;

      return (
        <div className={this.classes.chartTooltip}>
          <div className={this.classes.chartTooltipTitle}>
          {label}
          </div>
          <div className={this.classes.chartTooltipIndicatorLabel}>
            {this.getIndicatorNicknameWithSpending(activeIndicator)}
            {` - `}
            {COLUMNS[activeColumn].label}
          </div>
          <div className={this.classes.chartTooltipIndicatorValue}>
            {activeIndicator === 'spending' ? formatBudget(value, true).replace('+', '') : value}
          </div>
        </div>
      );
    }
  }

  formatTick = (value) => {
    const {activeIndicator} = this.state;

    if (activeIndicator === 'spending') {
      return `${value < 0 ? '-$' : '$'}${formatBudgetShortened(Math.abs(value))}`
    } else {
      return `${value < 0 ? '-' : ''}${formatBudgetShortened(Math.abs(value))}`
    }
  }

  render() {
    const {activeIndicator, activeColumn, activeChannel} = this.state;

    return (
      <div className={this.classes.item}>
        <div className={this.classes.itemTitle}>
          {`${COLUMNS[activeColumn].label} - ${this.getIndicatorNicknameWithSpending(activeIndicator)}`}
          <div className={this.classes.settingsContainer}>
            <div
              className={this.classes.settings}
              onClick={() => this.popup.open()}
            />
            <PlanPopup
              ref={el => this.popup = el}
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
                      Dimension
                    </div>
                    {this.getIndicatorOptions()}
                  </div>
                  <div className={this.classes.popupContentColumn}>
                    <div className={this.classes.popupContentColumnTitle}>
                      Board Type
                    </div>
                    {this.getColumnOptions()}
                  </div>
                  <div className={this.classes.popupContentColumn}>
                    <div className={this.classes.popupContentColumnTitle}>
                      Total or Single Channel
                    </div>
                    {this.getChannelOptions()}
                  </div>
                </div>
              </PopupTextContent>
            </PlanPopup>
          </div>
        </div>
        <div className={this.classes.chart}>
          <ResponsiveContainer width='100%' height='100%'>
            <ComposedChart
              data={this.getTableData()}
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
                tickFormatter={this.formatTick}
              />
              <Bar
                yAxisId='left'
                dataKey={this.getBarData}
                stackId='channels'
                fill={getColor(0)}
                barSize={40}
              />
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
          <div className={this.classes.legend}>
            <div
              className={this.classes.legendThumbnail}
              style={{backgroundColor: getColor(0)}}
            />
            <div className={this.classes.legendLabel}>
              {activeChannel === 'total' ? 'Total' : getChannelNickname(activeChannel)}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
