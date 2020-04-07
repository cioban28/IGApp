import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import {get} from 'lodash';
import {inject, observer} from 'mobx-react';

import Component from 'components/Component';
import Loader from 'components/controls/Loader';
import Page from 'components/Page';
import Popup from 'components/Popup';
import Select from 'components/controls/Select';
import {RangeCalendar} from 'components/controls/Calendar';

import {compose} from 'components/utils/utils';

import analyzeStyle from 'styles/analyze/analyze.css';
import selectStyle from 'styles/controls/select.css';
import setupStyle from 'styles/attribution/attribution-setp.css';
import style from 'styles/page.css';

const CUSTOM_VALUE = -1;

function disabledDate(current) {
  if (!current) {
    // allow empty select
    return false;
  }

  const tomorrow = moment({
    hour: 0,
    minute: 0,
    seconds: 0,
    milliseconds: 0
  }).add(1, 'days');

  return current > tomorrow;
}

const enhance = compose(
  inject(({
    attributionStore,
  }) => ({
    attributionStore,
  })),
  observer
);

class Analyze extends Component {
  style = style;
  styles = [analyzeStyle, setupStyle, selectStyle];

  state = {
    chooseCustomDate: false
  };

  static attributionModels = [
    {value: 'default', label: 'Full Journey'},
    {value: 'firsttouch', label: 'Introducer'},
    {value: 'lasttouch', label: 'Converter'},
    {value: 'linear', label: 'Linear'},
    {value: 'timeDecay', label: 'Time Decay'},
    {value: 'uShaped', label: 'U-Shaped'},
    {value: 'wShaped', label: 'W-Shaped'},
    {value: 'zShaped', label: 'Full-Path (Z-Shaped)'}
  ];

  componentDidMount() {
    const {attributionStore, children, ...restProps} = this.props;

    const {
      data,
      setAttributionModel,
      setDefaultAttributionData,
      setMetricOptions
    } = attributionStore;

    if (!Object.keys(data).length) {
      setDefaultAttributionData(restProps);
    }

    setMetricOptions();
    setAttributionModel(Analyze.attributionModels[0]);
  }

  componentWillUnmount() {
    // TODO: return this logic later
    // const {
    //   attributionStore: {cleanAttributionData, isLoaded}
    // } = this.props;

    // if (isLoaded) {
    //   cleanAttributionData();
    // }
  }

  getTitleAddition = () =>
    ` - ${get(this.props, 'children.props.route.tabName')}`;

  getSelectedTimeFrame = () => {
    const {
      attributionStore: {timeFrame}
    } = this.props;
    const {monthsExceptThisMonth, endDate, startDate} = timeFrame;

    if (monthsExceptThisMonth !== undefined) {
      const end = moment();
      const start = moment()
        .subtract(monthsExceptThisMonth, 'months')
        .date(1);
      const areYearsDifferent = end.year() !== start.year();
      const formatType = areYearsDifferent ? 'MMM D YYYY' : 'MMM D';

      return `${start.format(formatType)} - ${end.format(formatType)}`;
    }
    else {
      const end = moment(new Date(endDate));
      const start = moment(new Date(startDate));
      const areYearsDifferent = end.year() !== start.year();
      const formatType = areYearsDifferent ? 'MMM D YYYY' : 'MMM D';

      return `${start.format(formatType)} - ${end.format(formatType)}`;
    }
  };

  showCustomDatePopup = () => {
    this.setState({chooseCustomDate: true});
  };

  hideCustomDatePopup = () => {
    this.setState({chooseCustomDate: false});
  };

  pullAttributionData = (params, attributionModel) => {
    const {
      attributionStore: {pullAttributionData}
    } = this.props;

    pullAttributionData(params, attributionModel);
  };

  calcDateOptions() {
    const {
      calculatedData: {
        historyData: {historyDataLength}
      }
    } = this.props;

    const selectOptions = [];

    for (let i = 0; i < historyDataLength + 1; i++) {
      const lastXMonth = i;
      selectOptions.push({
        value: i,
        label: lastXMonth
          ? `Last ${lastXMonth + 1} months`
          : 'This month'
      });
    }

    selectOptions.push({
      value: CUSTOM_VALUE,
      label: 'Custom'
    });

    return selectOptions;
  }

  handleChangeAttributionModel = model => {
    const {
      attributionStore: {timeFrame, setAttributionModel}
    } = this.props;

    setAttributionModel(model);

    this.pullAttributionData(timeFrame, model.value);
  };

  handleChangeTimeFrame = ({value}) => {
    const {

      attributionStore: {attributionModel, setTimeFrame}
    } = this.props;

    if (value === -1) {
      console.log(value);
      this.showCustomDatePopup();
    }
    else {
      const timeFrame = {monthsExceptThisMonth: value};

      setTimeFrame(timeFrame);

      this.pullAttributionData(
        {
          monthsExceptThisMonth: value
        },
        attributionModel.value
      );
    }
  };

  handleChangeCustomTimeFrame = ({startDate, endDate}) => {
    const {
      attributionStore: {attributionModel, setTimeFrame}
    } = this.props;
    const timeFrame = {
      startDate: startDate.toString(),
      endDate: endDate.toString(),
      customDateMode: true
    };

    setTimeFrame(timeFrame);

    this.hideCustomDatePopup();

    this.pullAttributionData(
      {
        startDate: startDate.toString(),
        endDate: endDate.toString()
      },
      attributionModel.value
    );
  };

  render() {
    const {
      children,
      attributionStore: {
        attributionModel,
        timeFrame,
        isLoading,
        metricsOptions,
        conversionIndicator,
        setConversionIndicator,
      },
    } = this.props;
    const {chooseCustomDate} = this.state;
    const {
      startDate,
      endDate,
      monthsExceptThisMonth,
      customDateMode
    } = timeFrame;
    const isUsersPage = location.pathname === '/analyze/journeys';
    const isOverviewPage = location.pathname === '/analyze/overview';

    if (isLoading) {
      return <Loader/>;
    }

    return (
      <Page width="100%">
        <div className={this.classes.container}>
          <div className={this.classes.contentHead}>
            <div className={this.classes.contentHeadTitle}>
              Analyze {this.getTitleAddition()}
            </div>
            <div className={analyzeStyle.locals.filter}>
              {/* Temporarily hiding this select on overview page */}
              {!(isOverviewPage || isUsersPage) && (
                <div className={analyzeStyle.locals.filterItem}>
                  Conversion goal
                  <Select
                    className={analyzeStyle.locals.conversionSelect}
                    selected={conversionIndicator}
                    select={{
                      options: metricsOptions
                    }}
                    onChange={(e) => setConversionIndicator(e.value)}
                  />
                </div>
              )}
              <div className={analyzeStyle.locals.filterItem}>
                <div className={analyzeStyle.locals.text}>
                  Time Frame
                </div>
                <div
                  className={
                    analyzeStyle.locals.dateSelectBlock
                  }
                >
                  <Select
                    selected={
                      customDateMode
                        ? CUSTOM_VALUE
                        : monthsExceptThisMonth
                    }
                    select={{
                      options: this.calcDateOptions(),
                      valueRenderer: item => (
                        <div
                          style={{
                            display: 'flex'
                          }}
                        >
                          <div
                            className={
                              selectStyle.locals
                                .icon
                            }
                            data-icon="icons:calendar"
                          />
                          <div
                            className={
                              selectStyle.locals
                                .text
                            }
                          >
                            {item.label}
                          </div>
                        </div>
                      )
                    }}
                    onChange={this.handleChangeTimeFrame}
                    className={
                      analyzeStyle.locals.dateSelect
                    }
                  />
                  <div
                    className={selectStyle.locals.exactDate}
                  >
                    {this.getSelectedTimeFrame()}
                  </div>
                  <Popup
                    className={
                      analyzeStyle.locals.datePopup
                    }
                    hidden={!chooseCustomDate}
                    onClose={this.hideCustomDatePopup}
                  >
                    <RangeCalendar
                      className={
                        analyzeStyle.locals.calendar
                      }
                      onSelect={
                        this.handleChangeCustomTimeFrame
                      }
                      onClose={this.hideCustomDatePopup}
                      defaultSelectedValue={
                        customDateMode && [
                          moment(new Date(startDate)),
                          moment(new Date(endDate))
                        ]
                      }
                      disabledDate={disabledDate}
                    />
                  </Popup>
                </div>
              </div>

              <div className={analyzeStyle.locals.filterItem}>
                Attribution Model
                <Select
                  selected={attributionModel.value}
                  select={{
                    options: Analyze.attributionModels
                  }}
                  onChange={this.handleChangeAttributionModel}
                  className={analyzeStyle.locals.modelSelect}
                />
              </div>
            </div>
          </div>
          {children}
        </div>
      </Page>
    );
  }
}

Analyze.propTypes = {
  attributionStore: PropTypes.shape({
    attributionModel: PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.string
    }),
    // all data from app state + attribution data
    data: PropTypes.shape({}),
    timeFrame: PropTypes.shape({
      monthsExceptThisMonth: PropTypes.number,
      endDate: PropTypes.string,
      startDate: PropTypes.string
    }),
    isLoaded: PropTypes.bool,
    isLoading: PropTypes.bool,
    pullAttributionData: PropTypes.func,
    setAttributionModel: PropTypes.func,
    setDefaultAttributionData: PropTypes.func,
    setMetricOptions: PropTypes.func
  }),
  calculatedData: PropTypes.shape({
    historyData: PropTypes.shape({
      historyDataLength: PropTypes.number
    })
  }),
  children: PropTypes.node,
  updateState: PropTypes.func
};

export default enhance(Analyze);
