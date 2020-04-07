import React from 'react';
import PropTypes from 'prop-types';
import Component from 'components/Component';
import classnames from 'classnames';
import style from 'styles/analyze/stage-selector.css';

const stageType = PropTypes.shape({
  key: PropTypes.string,
  name: PropTypes.string,
  number: PropTypes.string,
});

export default class StageSelector extends Component {
  style = style;

  static propTypes = {
    selectStage: PropTypes.func,
    selectedKey: PropTypes.string,
    stages: PropTypes.arrayOf(stageType)
  };

  static defaultProps = {
    stages: []
  };

  render() {
    const {stages, selectedKey: selected, selectStage} = this.props;

    return (
      <div className={this.classes.outerDiv}>
        {stages.map((stage) => (
          <div
            key={stage.key}
            className={classnames(this.classes.innerDiv, stage.key === selected && this.classes.active)}
            onClick={() => selectStage && selectStage(stage.key)}
          >
            <div className={this.classes.stageName}>{stage.name}</div>
            <div className={this.classes.row}>
              <div className={this.classes.number}>{stage.number}</div>
            </div>
          </div>
        ))}
      </div>
    );
  }
}
