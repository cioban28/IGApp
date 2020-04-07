import React from 'react';
import Component from 'components/Component';
import style from 'styles/settings/channels/channels-tab.css';
import Select from 'components/controls/Select';
import Textfield from 'components/controls/Textfield';
import {getChannelIcon, getChannelsWithProps, getNickname as getChannelNickname} from 'components/utils/channels';
import {groupBy, sortBy, uniq, set} from 'lodash';
import SaveButton from 'components/pages/profile/SaveButton';
import Button from 'components/controls/Button';
import MappingRule from 'components/pages/settings/channels/tabs/common/MappingRule';

const departmentOptions = [
  {value: 'marketing', label: 'marketing'},
  {value: 'sales', label: 'sales'},
  {value: 'other', label: 'other'}
];

const WIDTH = '200px';

export default class ChannelsTab extends Component {

  style = style;

  constructor(props) {
    super(props);
    this.state = {};
  }

  editChannel = (name, category, channel, department) => {
    const userChannelsSchema = {...this.props.userChannelsSchema};

    set(userChannelsSchema, [channel, 'nickname'], name);
    set(userChannelsSchema, [channel, 'category'], category);
    set(userChannelsSchema, [channel, 'department'], department);

    this.props.updateState({userChannelsSchema: userChannelsSchema}, () => {
      this.props.updateUserMonthPlan({
        userChannelsSchema: userChannelsSchema,
        attributionMappingRules: this.props.attributionMappingRules
      }, this.props.region, this.props.planDate);
      this.setState({
        categoryEdit: undefined,
        channelEdit: undefined,
        departmentEdit: undefined,
        selectedChannel: channel,
        selectedCategory: category
      });
    });
  };

  updateRule = (ruleIndex, conditionIndex, key, value) => {
    const {attributionMappingRules} = this.props;
    attributionMappingRules[ruleIndex].conditions[conditionIndex][key] = value;
    this.props.updateState({attributionMappingRules});
  };

  deleteCondition = (ruleIndex, conditionIndex) => {
    const {attributionMappingRules} = this.props;
    attributionMappingRules[ruleIndex].conditions.splice(conditionIndex, 1);

    // If last condition, delete rule
    if (attributionMappingRules[ruleIndex].conditions.length === 0) {
      attributionMappingRules.splice(ruleIndex, 1);
    }

    this.props.updateState({attributionMappingRules});
  };

  addCondition = (ruleIndex) => {
    const {attributionMappingRules} = this.props;
    attributionMappingRules[ruleIndex].conditions.push({...this.props.getNewCondition()});

    this.props.updateState({attributionMappingRules});
  };

  render() {
    const channelsWithProps = getChannelsWithProps();
    const propsArray = Object.keys(channelsWithProps).map(channel => {
      return {
        channel,
        ...channelsWithProps[channel]
      };
    });
    const channelsByCategory = groupBy(sortBy(propsArray, ['nickname']), 'category');
    const categories = uniq(Object.keys(channelsByCategory)).sort();
    const categoriesOptions = categories.map(category => {
      return {
        value: category,
        label: category
      };
    });

    const getDefaultChannel = category => channelsByCategory[category][0].channel;

    const {selectedCategory = categories[0], selectedChannel = getDefaultChannel(selectedCategory), channelEdit = getChannelNickname(selectedChannel), categoryEdit = selectedCategory, departmentEdit = channelsWithProps[selectedChannel].department || 'marketing'} = this.state;
    const {attributionMappingRules} = this.props;
    const channelRules = attributionMappingRules
      .map((rule, index) => {
        return {
          ...rule,
          index
        };
      })
      .filter(rule => rule.channel === selectedChannel);

    return <div>
      <div style={{display: 'flex'}}>
        <div className={this.classes.categoriesMenu}>
          {
            categories.map(category =>
              <div className={this.classes.categoryBox}
                   key={category}
                   data-selected={category === selectedCategory ? true : null}
                   onClick={() => {
                     this.setState({selectedCategory: category, selectedChannel: getDefaultChannel(category)});
                   }}>
                {category}
              </div>)
          }
        </div>
        <div className={this.classes.channelsMenu}>
          {
            channelsByCategory[selectedCategory] && channelsByCategory[selectedCategory].map(item =>
              <div className={this.classes.channelBox}
                   key={item.channel}
                   data-selected={selectedChannel === item.channel ? true : null}
                   onClick={() => {
                     this.setState({selectedChannel: item.channel});
                   }}>
                <div className={this.classes.channelIcon} data-icon={getChannelIcon(item.channel)}/>
                {item.nickname}
              </div>)
          }
        </div>
        <div className={this.classes.inner}>
          <div className={this.classes.category}>
            {selectedCategory}
          </div>
          <div className={this.classes.channel}>
            <div className={this.classes.channelIcon} data-icon={getChannelIcon(selectedChannel)}/>
            {getChannelNickname(selectedChannel)}
          </div>
          <div className={this.classes.flexRow}>
            <div className={this.classes.fieldText}>
              Name
            </div>
            <Textfield value={channelEdit}
                       style={{width: WIDTH}}
                       onChange={e => {
                         this.setState({channelEdit: e.target.value});
                       }}/>
          </div>
          <div className={this.classes.flexRow}>
            <div className={this.classes.fieldText}>
              Category
            </div>
            <Select select={{options: categoriesOptions}} style={{width: WIDTH}}
                    selected={categoryEdit}
                    onChange={e => {
                      this.setState({categoryEdit: e.value});
                    }}/>
          </div>
          <div className={this.classes.flexRow}>
            <div className={this.classes.fieldText}>
              Department
            </div>
            <Select select={{options: departmentOptions}} style={{width: WIDTH}}
                    selected={departmentEdit}
                    onChange={e => {
                      this.setState({departmentEdit: e.value});
                    }}/>
          </div>
          <div>
            <div className={this.classes.titleText} style={{marginTop: '30px'}}>
              Mapping
            </div>
            {
              channelRules.map((rule, index) =>
                <div key={index}>
                  {
                    rule.conditions.map((condition, conditionIndex) =>
                      <MappingRule key={`${rule.index}-${conditionIndex}`}
                                   updateValue={e => this.updateRule(rule.index, conditionIndex, 'value', e.target.value)}
                                   updateParam={e => this.updateRule(rule.index, conditionIndex, 'param', e.value)}
                                   updateOperation={e => this.updateRule(rule.index, conditionIndex, 'operation', e.value)}
                                   value={condition.value}
                                   param={condition.param}
                                   operation={condition.operation}
                                   handleAdd={() => this.addCondition(rule.index)}
                                   handleDelete={() => this.deleteCondition(rule.index, conditionIndex)}/>)
                  }
                  <div className={this.classes.text} hidden={index === channelRules.length - 1}>
                    OR
                  </div>
                </div>)
            }
            <Button type="secondary" style={{width: 'fit-content', marginTop: '15px'}}
                    onClick={() => this.props.addRule(selectedChannel)}>
              OR
            </Button>
          </div>
          <SaveButton style={{marginTop: '15px', width: 'fit-content'}}
                      onClick={() => {
                        this.setState({saveFail: false, saveSuccess: false});
                        this.setState({saveSuccess: true});
                        this.editChannel(channelEdit, categoryEdit, selectedChannel, departmentEdit);
                      }} success={this.state.saveSuccess} fail={this.state.saveFail}/>
        </div>
      </div>
    </div>;
  }
}