import React from 'react';
import Component from 'components/Component';
import Item from 'components/pages/plan/ProjectionItem';
import style from 'styles/plan/projections-tab.css';
import planStyles from 'styles/plan/plan.css';
import {getIndicatorsWithProps} from 'components/utils/indicators';
import analyzeStyle from 'styles/analyze/analyze.css';
import Select from 'components/controls/Select';
import {getDatesSpecific} from 'components/utils/date';
import max from 'lodash/max';

export default class ProjectionsTab extends Component {

  styles = [planStyles, analyzeStyle];
  style = style;

  monthAdditionOptions = [0, 2, 5, 11];

  constructor(props) {
    super(props);

    this.state = {
      selectedValue: 0
    };
  }

  calculateState(item) {
    const projectedIndicators = this.props.forecastedIndicators[this.state.selectedValue];
    const committedProjection = projectedIndicators &&
      projectedIndicators[item.key] &&
      projectedIndicators[item.key].committed;
    if (committedProjection > (this.props.actualIndicators[item.key] > 0 ? this.props.actualIndicators[item.key] : 0)) {
      return item.directionDown ? 'decline' : 'grow';
    }
    else if (committedProjection <
      (this.props.actualIndicators[item.key] > 0 ? this.props.actualIndicators[item.key] : 0)) {
      return item.directionDown ? 'grow' : 'decline';
    }
    else {
      return 'normal';
    }
  }

  selectMonthAddition = (index) => {
    this.setState({
      selectedValue: index
    });
  };

  render() {
    // Specific date returns also the current month, so we need to add 1
    const dates = getDatesSpecific(this.props.planDate, 0, max(this.monthAdditionOptions) + 2);
    const selectOptions = this.monthAdditionOptions.map(addition => {
      const differenceFromCurrentMonth = addition + 1;
      return {
        value: addition,
        // Forecasting for a specific month is relevant for the next
        label: `+${differenceFromCurrentMonth} month${differenceFromCurrentMonth > 1 ? 's' : ''} (${dates[differenceFromCurrentMonth]})`
      };
    });

    const selectedValue = this.state.selectedValue;
    let groups = [];
    const properties = getIndicatorsWithProps() || {};
    const indicators = Object.keys(properties);
    indicators.forEach(indicator => {
      if (!groups.includes(properties[indicator].group)) {
        groups.push(properties[indicator].group);
      }
    });

    const {committedForecasting} = this.props.calculatedData;
    groups.sort();
    const rows = groups.map((group, i) => {
      const groupIndicators = indicators
        .filter(indicator => properties[indicator].group === group)
        .sort((a, b) => properties[a].orderInGroup - properties[b].orderInGroup);
      const indicatorsItems = groupIndicators.map((item, j) => {
        return <Item
          key={`row${i}-item${j}`}
          defaultState={this.calculateState({key: item, directionDown: !properties[item].isDirectionUp})}
          defaultValue={committedForecasting &&
          committedForecasting[selectedValue] &&
          committedForecasting[selectedValue][item]}
          grow={this.props.actualIndicators[item]
            ? Math.ceil(Math.abs(((committedForecasting[selectedValue]
              ? committedForecasting[selectedValue][item]
              : 0) - this.props.actualIndicators[item]) / this.props.actualIndicators[item]) * 100)
            : committedForecasting[selectedValue] &&
            committedForecasting[selectedValue][item] *
            100}
          icon={'indicator:' + item}
          title={properties[item].title}
          indicator={item}
        />;
      });

      return <div className={this.classes.row} key={`row${i}`}>
        {indicatorsItems}
      </div>;
    });

    return <div className={this.classes.wrap}>
      <div className={planStyles.locals.title}>
        <div className={planStyles.locals.titleMain}>
          <div className={planStyles.locals.titleText}>
            Forecasting (months)
          </div>
        </div>
        <div className={planStyles.locals.titleButtons}>
          <Select
            selected={this.state.selectedValue}
            select={{options: selectOptions}}
            onChange={(e) => {
              this.selectMonthAddition(e.value);
            }}
            className={analyzeStyle.locals.dateSelect}
            style={{width: '150px'}}
          />
        </div>
      </div>
      <div className={planStyles.locals.innerBox}>
        <div className={this.classes.content}>
          {rows}
        </div>
      </div>
    </div>;
  }
}