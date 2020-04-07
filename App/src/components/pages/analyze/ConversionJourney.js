import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'classnames';
import Component from 'components/Component';
import Table from 'components/controls/Table';
import Tooltip from 'components/controls/Tooltip';
import {getNickname} from 'components/utils/channels';
import getChannelColor from 'components/utils/getChannelColor';
import {hexToRgb} from 'components/utils/colors';
import {getChannelIcon} from 'components/utils/filters/channels';
import style from 'styles/analyze/conversion-journey.css';
import analyzeStyle from 'styles/analyze/analyze.css';

export default class ConversionJourney extends Component {
  style = style;
  styles = [analyzeStyle];

  static propTypes = {
    conversionIndicator: PropTypes.string.isRequired,
    getMetricDataByMapping: PropTypes.func.isRequired,
    chartData: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.number
    })).isRequired,
    chartDataSum: PropTypes.number.isRequired,
  };

  getJourneysColumns = (journeysData, journeysSum) => {

    const conversionColumnWidth = 125;
    const percentageColumnWidth = 120;
    const availableSpace = this.tableContainer
      ? this.tableContainer.clientWidth - conversionColumnWidth - percentageColumnWidth
      : 0;

    // set journey column width based on
    // the width of longest journey item
    let journeyColumnWidth = 0;
    journeysData.forEach(item => {
      const horizontalPadding = 48;
      const journeysItemWidth = item.channels.length * 125;
      const journeysItemMargin = Math.max(item.channels.length - 1, 0) * 32;
      const width = horizontalPadding + journeysItemWidth + journeysItemMargin;
      if (width > journeyColumnWidth) {
        journeyColumnWidth = width;
      }
    });

    return [
      {
        id: 'channels',
        header: 'Journey',
        cell: ({channels}) => (
          <div className={this.classes.journeyRow}>
            {
              channels.map((channel, index) => {
                const channelNickname = getNickname(channel);
                return (
                  <div
                    key={index}
                    className={this.classes.journeyItem}
                    style={{
                      backgroundColor: `rgba(${hexToRgb(getChannelColor(channel)).join(',')}, 0.2)`
                    }}
                  >
                    <div
                      className={this.classes.journeyItemIcon}
                      data-icon={getChannelIcon(channel)}
                    />
                    <div className={this.classes.journeyItemLabelContainer}>
                      <Tooltip
                        id={`channel-tooltip-${index}`}
                        className={this.classes.journeyItemLabel}
                        tip={channelNickname}
                        style={{
                          color: getChannelColor(channel)
                        }}
                      >
                        {channelNickname}
                      </Tooltip>
                    </div>
                  </div>
                );
              })
            }
          </div>
        ),
        ...(journeyColumnWidth > 0 && journeyColumnWidth > availableSpace && {width: journeyColumnWidth})
      },
      {
        id: 'conversion',
        header: 'Conversion',
        className: this.classes.sticky,
        headerClassName: this.classes.sticky,
        cell: ({count}) => count,
        width: 125
      },
      {
        id: 'percentage',
        header: '% of Total',
        className: this.classes.sticky,
        headerClassName: this.classes.sticky,
        cell: ({count}) => `${(count / journeysSum * 100).toFixed(1)}%`,
        width: 120
      }
    ];
  };

  getJourneys = () => {
    const {conversionIndicator, getMetricDataByMapping} = this.props;

    const journeys = [];
    let journeysSum = 0;

    getMetricDataByMapping(conversionIndicator).forEach(user => {
      const journey = user.sessions
        .filter(item =>
          item.channel &&
          item.channel !== 'direct' &&
          Object.keys(item.funnelStages).includes(conversionIndicator)
        )
        .map(item => item.channel);
      if (journey && journey.length > 0) {
        journeysSum++;
        const alreadyExists = journeys.find(item =>
          item.channels.length === journey.length &&
          item.channels.every((item, index) => item === journey[index])
        );
        if (alreadyExists) {
          alreadyExists.count++;
        }
        else {
          journeys.push({
            channels: journey,
            count: 1
          });
        }
      }
    });

    const formattedJourneys = journeys.map(({channels, count}) => {
      const noConsecutiveRepeatChannels = [];
      let lastChannel = '';
      channels.forEach(channel => {
        if (channel !== lastChannel) {
          noConsecutiveRepeatChannels.push(channel);
        }
        lastChannel = channel;
      });

      return {
        channels: noConsecutiveRepeatChannels,
        count
      };
    });

    const uniqueJourneysObj = formattedJourneys.reduce((result, item) => {
      const stringKey = JSON.stringify(item.channels);
      if (result[stringKey]) {
        result[stringKey] += item.count;
      } else {
        result[stringKey] = item.count;
      }
      return result;
    }, {});
    const uniqueJourneys = Object.keys(uniqueJourneysObj)
      .map(key => ({
        channels: JSON.parse(key),
        count: uniqueJourneysObj[key]
      }))
      .sort((a, b) => b.count - a.count);

    return {
      journeysData: uniqueJourneys,
      journeysColumns: this.getJourneysColumns(formattedJourneys, journeysSum)
    };
  };

  render() {
    const {chartData, chartDataSum} = this.props;
    const {journeysData, journeysColumns} = this.getJourneys();

    return (
      <div className={analyzeStyle.locals.rows}>
        <div className={analyzeStyle.locals.item}>
          <div className={classnames(analyzeStyle.locals.itemTitle, analyzeStyle.locals.withSelect)}>
            Top Conversion Journeys
          </div>
          <div className={this.classes.container}>
            <div className={this.classes.chart}>
              {
                chartData
                  .sort((a, b) => b.value - a.value)
                  .map((element, i) => (
                    <div key={i} className={this.classes.chartItem}>
                      <div
                        className={this.classes.chartItemFill}
                        style={{width: `${Math.round(element.value / chartDataSum * 100)}%`}}
                      />
                      <div className={this.classes.chartItemLabel}>
                        {element.name}
                      </div>
                      <div className={this.classes.chartItemValue}>
                        {Math.round(element.value)}
                        <span>({Math.round(element.value / chartDataSum * 100)}%)</span>
                      </div>
                    </div>
                  ))
              }
            </div>
            <div ref={el => this.tableContainer = el} className={this.classes.journey}>
              <Table
                style={{height: 328}}
                className={classnames(analyzeStyle.locals.channelsImpactsTable, this.classes.journeyTable)}
                rowGroupClassName={analyzeStyle.locals.rowGroup}
                rowClassName={analyzeStyle.locals.row}
                headerClassName={analyzeStyle.locals.header}
                headRowClassName={analyzeStyle.locals.headerRow}
                footerClassName={analyzeStyle.locals.footer}
                footRowClassName={analyzeStyle.locals.footerRow}
                cellClassName={classnames(analyzeStyle.locals.cell, this.classes.cell)}
                data={journeysData}
                columns={journeysColumns}
                noPadding
                minRows={0}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
