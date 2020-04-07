import React from 'react';
import Component from 'components/Component';
import Select from 'components/controls/Select';
import style from 'styles/settings/channels/channels-tab.css';
import Textfield from 'components/controls/Textfield';
import PropTypes from 'prop-types';
import {EXTERNAL_LEAD_SOURCE, EXTERNAL_LEAD_SOURCE_DATA1, EXTERNAL_LEAD_SOURCE_DATA2} from 'components/utils/users';

const paramsOptions = [
  {value: 'source', label: 'source'},
  {value: 'medium', label: 'medium'},
  {value: 'referrer', label: 'referrer'},
  {value: 'external_lead_source', label: EXTERNAL_LEAD_SOURCE},
  {value: 'external_lead_source_data1', label: EXTERNAL_LEAD_SOURCE_DATA1},
  {value: 'external_lead_source_data2', label: EXTERNAL_LEAD_SOURCE_DATA2}
];

const operationOptions = [
  {value: 'equals', label: 'equals'},
  {value: 'contains', label: 'contains'}
];

const MARGIN_RIGHT = '15px';
const ruleSelectStyle = {width: '131px', marginRight: MARGIN_RIGHT};

// Allow empty value
const getEnumValues = (valuesArray) => ['', ...valuesArray.map(item => item.value)];

export default class MappingRule extends Component {

  style = style;

  static propTypes = {
    param: PropTypes.oneOf(getEnumValues(paramsOptions)),
    operation: PropTypes.oneOf(getEnumValues(operationOptions)),
    value: PropTypes.string,
    updateParam: PropTypes.func,
    updateOperation: PropTypes.func,
    updateValue: PropTypes.func,
    handleDelete: PropTypes.func,
    handleAdd: PropTypes.func
  };

  render() {
    const {param, operation, value, updateParam, updateOperation, updateValue, handleDelete, handleAdd} = this.props;
    return <div className={this.classes.flexRow}>
      <Select select={{options: paramsOptions}} style={ruleSelectStyle}
              selected={param}
              onChange={updateParam}/>
      <Select select={{options: operationOptions}} style={ruleSelectStyle}
              selected={operation}
              onChange={updateOperation}/>
      <Textfield value={value}
                 style={{marginRight: MARGIN_RIGHT}}
                 onChange={updateValue}/>
      <div className={this.classes.rowIcons}>
        <div className={this.classes.minusIcon}
             onClick={handleDelete}/>
        <div className={this.classes.plusIcon} onClick={handleAdd}/>
      </div>
    </div>;
  }
}