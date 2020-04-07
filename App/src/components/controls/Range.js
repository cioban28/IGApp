import React from 'react';
import Component from 'components/Component';
import InputRange from 'react-input-range';
import style from 'react-input-range/lib/css/index.css';
import Textfield from 'components/controls/Textfield';
import { formatNumber } from 'components/utils/budget';
import rangeStyle from 'styles/controls/range.css';

const DEFAULT_CLASS_NAMES = {
  activeTrack: 'input-range__track input-range__track--active',
  disabledInputRange: 'input-range input-range--disabled',
  inputRange: 'input-range',
  labelContainer: 'input-range__label-container',
  maxLabel: 'input-range__label input-range__label--max',
  minLabel: 'input-range__label input-range__label--min',
  slider: 'input-range__slider',
  sliderContainer: 'input-range__slider-container',
  track: 'input-range__track input-range__track--background',
  valueLabel: 'input-range__label input-range__label--value'
};

export default class Range extends Component {

  style = style;
  styles = [rangeStyle];

  static defaultProps = {
    style: {
      width: '250px'
    },
    outerStyle: {
      marginLeft: '20px',
      width: '520px',
      display: 'flex',
      alignItems: 'center'
    }
  };

  handleChangeSlider = ({min, max}) => {
    if (max === this.props.maxValue) {
      max = -1;
    }
    this.props.onChange({min, max});
  };

  handleChangeText = (prop, event) => {
    const { value } = this.props;
    value[prop] = parseInt(event.target.value.toString().replace(/\D+/g, '')) || 0;
    this.props.onChange(value);
  };

  render() {
    const { outerStyle, outerClassName, value: {min, max}, maxValue, disabled, onChange, ...otherProps } = this.props;

    return <div style={ outerStyle } className={ outerClassName }>
      <Textfield
        value={ "$" + formatNumber(min) }
        onChange={ (e) => this.handleChangeText('min', e) }
        disabled={ disabled }
        style={{
          width: '150px',
          marginRight: '15px'
        }}
      />
      <InputRange
        classNames={{
          ...DEFAULT_CLASS_NAMES,
          activeTrack: 'input-range__track ' + rangeStyle.locals.activeTrack.toString(),
          slider: 'input-range__slider ' + rangeStyle.locals.slider.toString()
        }}
        slider={ rangeStyle.locals.slider }
        value={{
          min: min,
          max: max === -1 ? maxValue : max
        }}
        maxValue={ maxValue }
        disabled={ disabled }
        formatLabel={ () => { return null; } }
        onChange={ this.handleChangeSlider }
        { ...otherProps }
      />
      <Textfield
        value={ "$" + (max === -1 ? '∞' : formatNumber(max)) }
        onChange={ (e) => this.handleChangeText('max', e) }
        disabled={ disabled }
        style={{
          width: '150px',
          marginLeft: '15px'
        }}
      />
    </div>
  }
}