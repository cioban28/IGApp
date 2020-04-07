import React from 'react';
import Component from 'components/Component';
import Page from 'components/Page';
import style from 'styles/manual-plan/manual-plan.css';
import Label from 'components/ControlsLabel';
import MultiRow from 'components/MultiRow';
import Textfield from 'components/controls/Textfield';
import {extractNumberFromBudget, formatBudget} from 'components/utils/budget';
import PlanFromExcel from 'components/PlanFromExcel';
import Toggle from 'components/controls/Toggle';
import isEqual from 'lodash/isEqual';
import mapValues from 'lodash/mapValues';
import isEmpty from 'lodash/isEmpty';
import PlanButton from 'components/pages/indicators/PlanButton';
import history from 'history';
import ChannelsSelect from 'components/common/ChannelsSelect';

export default class ManualPlan extends Component {

  style = style;

  constructor(props) {
    super(props);
    this.state = {
      manualChannels: {},
      isExcel: false
    };
  }

  componentDidMount() {
    this.initializeWithConstraints(this.props.budgetConstraints);
  }

  componentWillReceiveProps(nextProps) {
    if (!isEqual(nextProps.budgetConstraints, this.props.budgetConstraints)) {
      this.initializeWithConstraints(nextProps.budgetConstraints);
    }
  }

  initializeWithConstraints = (budgetConstraints) => {
    const manualChannels = mapValues(budgetConstraints, constraint => constraint.range.min);
    this.setState({manualChannels: manualChannels});
  };

  removeManualChannel = (index) => {
    const manualChannels = {...this.state.manualChannels};
    const channel = Object.keys(manualChannels)[index];
    delete manualChannels[channel];
    this.setState({manualChannels: manualChannels});
  };

  addOrOverrideManualChannel = (index, channel) => {
    const manualChannels = {...this.state.manualChannels};
    const existingChannels = Object.keys(manualChannels);
    const numOfChannels = existingChannels.length;
    // New line
    if (index === numOfChannels) {
      if (!manualChannels[channel]) {
        manualChannels[channel] = '';
      }
    }
    else {
      // Existing line
      const oldChannel = existingChannels[index];
      manualChannels[channel] = manualChannels[oldChannel];
      delete manualChannels[oldChannel];
    }
    this.setState({manualChannels: manualChannels});
  };

  handleChangeBudget = (channel, value) => {
    const manualChannels = {...this.state.manualChannels};
    manualChannels[channel] = extractNumberFromBudget(value);
    this.setState({manualChannels: manualChannels});
  };

  commitBudgets = () => {
    let planBudgets = [];
    if (this.state.isExcel) {
      planBudgets = this.props.planBudgets;
    }
    else {
      planBudgets = this.props.planBudgets.map(() => {
        return mapValues(this.state.manualChannels, budget => {
          return {
            isSoft: false,
            committedBudget: budget,
            userBudgetConstraint: budget
          };
        });
      });
    }
    if (!isEmpty(planBudgets) && planBudgets.some(item => !isEmpty(item))) {
      this.props.forecast(planBudgets)
        .then((forecastedIndicaotrs) => {
          this.props.updateUserMonthPlan({
            planBudgets: planBudgets,
            forecastedIndicators: forecastedIndicaotrs
          }, this.props.region, this.props.planDate)
            .then(() => {
              history.push('/plan/annual');
            });
        });
    }
  };

  render() {
    const {manualChannels, isExcel} = this.state;
    const manualChannelsKeys = Object.keys(manualChannels);

    return <div>
      <Page popup={true} width={'700px'}>
        <div className={this.classes.title}>
          Build your first budget ($)
        </div>
        <div className={this.classes.subTitle}>
          Define the basics for your budget
        </div>
        <Toggle
          options={[{
            text: 'Import',
            value: true
          },
            {
              text: 'Build',
              value: false
            }
          ]}
          selectedValue={isExcel}
          onClick={(value) => {
            this.setState({isExcel: value});
          }}/>
        <div className={this.classes.inner}>
          {isExcel ?
            <PlanFromExcel {...this.props}/>
            :
            <div>
              <Label>
                What channels you're looking to use in your first plan/budget?
              </Label>
              <MultiRow numOfRows={manualChannelsKeys.length} rowRemoved={this.removeManualChannel}>
                {({index, data, update, removeButton}) => {
                  return <div style={{display: 'flex', marginBottom: '10px'}}>
                    <ChannelsSelect style={{width: '262px'}}
                                    selected={manualChannelsKeys[index]}
                                    isChannelDisabled={channel => manualChannelsKeys.includes(channel)}
                                    onChange={(e) => this.addOrOverrideManualChannel(index, e.value)}
                    />
                    <Textfield disabled={!manualChannelsKeys[index]}
                               value={formatBudget(manualChannels[manualChannelsKeys[index]])}
                               placeHolder='Monthly Budget'
                               onChange={(e) => this.handleChangeBudget(manualChannelsKeys[index], e.target.value)}
                               style={{width: '132px', marginLeft: '20px'}}/>
                    <div style={{marginLeft: '25px', alignSelf: 'center'}}>
                      {removeButton}
                    </div>
                  </div>;
                }}
              </MultiRow>
            </div>
          }
        </div>
        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
          <PlanButton onClick={this.commitBudgets}/>
        </div>
      </Page>
    </div>;
  }

}