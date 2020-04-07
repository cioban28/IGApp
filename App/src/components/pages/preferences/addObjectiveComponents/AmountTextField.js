import React from 'react';
import Component from 'components/Component';
import Textfield from 'components/controls/Textfield';

export default class AmountTextField extends Component {
  render() {
    const {amount, setAmount} = this.props;
    return (
      <div style={{marginLeft: '10px'}}>
        <Textfield type="number" value={amount} onChange={(e) => {
          setAmount(e);
        }} style={{width: '102px'}}/>
      </div>
    );
  }
}