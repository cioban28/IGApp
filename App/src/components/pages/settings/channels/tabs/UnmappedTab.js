import React from 'react';
import Component from 'components/Component';
import Table from 'components/controls/Table';
import Button from 'components/controls/Button';
import MappingRule from 'components/pages/settings/channels/tabs/common/MappingRule';
import ChannelsSelect from 'components/common/ChannelsSelect';
import SaveButton from 'components/pages/profile/SaveButton';
import {isNil} from 'lodash';
import Toggle from 'components/controls/Toggle';
import style from 'styles/settings/channels/unmapped-tab.css';

const conditionStyle = {display: 'flex'};

export default class UnmappedTab extends Component {

  style = style;

  constructor(props) {
    super(props);
    this.state = {...this.getInitialState(props), isURLsTab: true};
  }

  getInitialState = (props) => {
    return {
      conditions: [props.getNewCondition()],
      channel: ''
    };
  };

  updateCondition = (index, param, value) => {
    const conditions = [...this.state.conditions];
    conditions[index][param] = value;
    this.setState({conditions});
  };

  addCondition = () => {
    const conditions = [...this.state.conditions];
    conditions.push(this.props.getNewCondition());
    this.setState({conditions});
  };

  deleteCondition = (index) => {
    let conditions = [...this.state.conditions];
    if (index) {
      conditions.splice(index, 1);
    }
    else {
      // Prevent user for deleting the first condition - initialize it instead
      conditions = [this.props.getNewCondition()];
    }
    this.setState({conditions});
  };

  createUtmConditions = (source, medium) => {
    const conditions = [];
    if (!isNil(source)) {
      conditions.push({
        value: source,
        param: 'source',
        operation: 'equals'
      });
    }
    if (!isNil(medium)) {
      conditions.push({
        value: medium,
        param: 'medium',
        operation: 'equals'
      });
    }
    this.setState({conditions});
  };

  handleChangeChannel = channel => this.setState({channel});

  addUnknownChannel = (channel) => {
    this.props.addUnknownChannel(channel);
    this.handleChangeChannel(channel);
  };

  render() {
    const {unmappedUrls = [], unmappedUtms = []} = this.props;
    const {conditions, channel, isURLsTab} = this.state;

    const unmappedUrlsColumns = [
      {
        id: 'Referrer',
        header: 'Referrer',
        cell: 'referrer_url'
      },
      {
        id: 'Count',
        header: 'Count',
        cell: 'count'
      },
      {
        id: 'map',
        header: '',
        cell: (row) => (
          <div>
            <Button type="primary"
                    style={{width: '102px'}}
                    onClick={() => {
                      this.setState({
                        conditions: [{
                          value: row.referrer_url,
                          param: 'referrer',
                          operation: 'contains'
                        }]
                      });
                      this.channelsSelect.focus();
                    }}>
              Map
            </Button>
          </div>
        )
      }
    ];

    const unmappedUtmsColumns = [
      {
        id: 'Source',
        header: 'Source',
        cell: 'utm_source'
      },
      {
        id: 'Medium',
        header: 'Medium',
        cell: 'utm_medium'
      },
      {
        id: 'Count',
        header: 'Count',
        cell: 'count'
      },
      {
        id: 'map',
        header: '',
        cell: (row) => (
          <div>
            <Button type="primary"
                    style={{width: '102px'}}
                    onClick={() => {
                      this.createUtmConditions(row.utm_source, row.utm_medium);
                      this.channelsSelect.focus();
                    }}>
              Map
            </Button>
          </div>
        )
      }
    ];
    const tableData = isURLsTab ? unmappedUrls : unmappedUtms;

    return <div>
      <Toggle
        options={[{
          text: 'URLs',
          value: true
        },
          {
            text: 'UTMs',
            value: false
          }
        ]}
        selectedValue={isURLsTab}
        onClick={(value) => {
          this.setState({isURLsTab: value});
        }}/>
      <div style={{marginLeft: -15, marginRight: -15}}>
        <Table
          key={isURLsTab}
          data={tableData}
          columns={isURLsTab ? unmappedUrlsColumns : unmappedUtmsColumns}
          showPagination
        />
      </div>
      <div style={conditionStyle}>
        <span className={this.classes.condition}>If</span>
        {conditions.map((condition, index) =>
            <MappingRule key={index}
                         param={condition.param}
                         operation={condition.operation}
                         value={condition.value}
                         updateOperation={e => this.updateCondition(index, 'operation', e.value)}
                         updateParam={e => this.updateCondition(index, 'param', e.value)}
                         updateValue={e => this.updateCondition(index, 'value', e.target.value)}
                         handleAdd={this.addCondition}
                         handleDelete={() => this.deleteCondition(index)}/>
        )}
      </div>
      <div style={conditionStyle}>
        <span className={this.classes.condition}>Then</span>
        <ChannelsSelect selected={channel}
                        withOtherChannels
                        ref={ref => this.channelsSelect = ref}
                        onChange={(e) => this.handleChangeChannel(e.value)}
                        style={{width: '277px'}}
                        onNewOptionClick={({value: channel}) => this.addUnknownChannel(channel)}/>
      </div>
      <SaveButton style={{marginTop: '15px', width: 'fit-content'}}
                  onClick={() => {
                    this.setState({saveFail: false, saveSuccess: false});
                    this.setState({saveSuccess: true});
                    this.props.addRule(channel, conditions, () => {
                      this.props.updateUserMonthPlan({
                        attributionMappingRules: this.props.attributionMappingRules
                      }, this.props.region, this.props.planDate);
                    });
                    this.setState({...this.getInitialState(this.props)});
                  }} success={this.state.saveSuccess} fail={this.state.saveFail}/>
    </div>;
  }
};