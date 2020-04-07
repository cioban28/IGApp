import React from 'react';
import Component from 'components/Component';
import Select from 'components/controls/Select';

export default class TypeSelect extends Component {
  render() {
    const {selectedType, typeOptions, selectType, isCustom} = this.props;
    return (
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
        <Select
          selected={isCustom ? 'custom' : selectedType}
          select={{
            options: typeOptions
          }}
          onChange={(e) => {
            selectType(e);
          }}
          placeholder='%/num'
          style={{marginLeft: '10px', width: '88px', zIndex: 20}}
        />
      </div>
    );
  }
}