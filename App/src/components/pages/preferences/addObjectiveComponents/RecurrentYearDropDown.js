import React from 'react';
import Component from 'components/Component';
import Select from 'components/controls/Select';
import {getCustomYearsList} from 'components/utils/objective';

export default class RecurrentYearDropDown extends Component {
  render() {
    const {selectYear, isCustom, isRecurrent, customYear} = this.props;
    const customYearsList = getCustomYearsList();
    return (
      <div style={{display: 'inline-flex', alignItems: 'center'}}>
        Numeric objective{isCustom ? 's' : ''}
        {
          isCustom && isRecurrent &&
          <Select
            selected={customYear}
            select={{
              placeholder: 'Year',
              options: customYearsList
            }}
            onChange={(e) => {
              selectYear(e);
            }}
            style={{width: '100px', marginLeft: 20, zIndex: 50}}
          />
        }
      </div>

    );
  }
}