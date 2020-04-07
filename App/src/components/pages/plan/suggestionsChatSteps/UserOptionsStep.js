import Component from 'components/Component';
import React from 'react';
import PropTypes from 'prop-types';
import style from 'styles/plan/plan-optimization-popup.css';
import isNil from 'lodash/isNil';
import Button from 'components/controls/Button';

export default class UserOptionsStep extends Component {

  style = style;

  static propTypes = {
    options: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      trigger: PropTypes.string.isRequired
    })).isRequired
  };

  constructor(props) {
    super(props);
    this.state = {chosenKey: null};
  }

  render() {
    const chosenKey = this.state.chosenKey;
    const createOptionDiv = (isChosen, {label, trigger}, key) => {
      return <Button type='chat-button'
                     style={{marginBottom: '7px'}}
                     contClassName={this.classes.chatButtonCont}
                     disabled={isChosen}
                     key={key}
                     onClick={() => {
                       this.setState({chosenKey: key});
                       this.props.triggerNextStep({trigger: trigger});
                     }}>
        {label}
      </Button>;
    };

    const options = this.props.options.map((option, key) => {
      return createOptionDiv(false, option, key);
    });

    return <div className={this.classes.optionsWrapper}>
      {!isNil(chosenKey)
        ? createOptionDiv(true, this.props.options[chosenKey], chosenKey)
        : options}
    </div>;
  }
}