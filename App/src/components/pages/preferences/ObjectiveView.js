import React from 'react';
import Component from 'components/Component';
import style from 'styles/preferences/objective-view.css';
import {formatIndicatorDisplay, getNickname, isRefreshed} from 'components/utils/indicators';
import {getColor} from 'components/utils/colors';
import {getNumberOfDaysBetweenDates} from 'components/utils/date';
import flow from 'lodash/flow';
import {DragSource, DropTarget} from 'react-dnd';
import {findDOMNode} from 'react-dom';
import {extractCustomMilestones, extractMilestones} from 'components/utils/objective';
import {get, sum} from 'lodash';

const cardSource = {
  beginDrag(props) {
    const {priority} = props;

    return {
      priority
    };
  }
};
const cardTarget = {
  hover(props, monitor, component) {
    const {onDrag, priority} = props;
    const dragIndex = monitor.getItem().priority;
    const hoverIndex = priority;

    // Don't replace items with themselves
    if (dragIndex === hoverIndex) {
      return null;
    }

    // Determine rectangle on screen
    const hoverBoundingRect = findDOMNode(
      component
    ).getBoundingClientRect();

    // Get vertical middle
    const hoverMiddleY =
      (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // Determine mouse position
    const clientOffset = monitor.getClientOffset();

    // Get pixels to the top
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // Only perform the move when the mouse has crossed half of the items height
    // When dragging downwards, only move when the cursor is below 50%
    // When dragging upwards, only move when the cursor is above 50%

    // Dragging downwards
    if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      return null;
    }

    // Dragging upwards
    if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      return null;
    }

    onDrag(hoverIndex, dragIndex);
    monitor.getItem().priority = hoverIndex;
  }
};

class ObjectiveView extends Component {
  style = style;

  getDaysLeft() {
    return `${getNumberOfDaysBetweenDates(this.props.dueDate)} days left`;
  }

  render() {
    const {isDragging, connectDragSource, connectDropTarget, actualIndicators, historyIndicators, indicator, isQuarterly, objectives, isDirectionUp} = this.props;
    const shouldRender = connectDragSource && connectDropTarget;
    const styles = isDragging ? {opacity: 0} : undefined;

    if (!shouldRender) {
      return null;
    }
    const firstObjective = objectives.find(objective => get(objective, [indicator], []));
    const isRefreshedValue = isRefreshed(indicator);
    let milestones;
    if (isRefreshedValue) {
      milestones = isQuarterly ? extractMilestones(historyIndicators, indicator) : extractCustomMilestones([historyIndicators, indicator], indicator, firstObjective);
    }
    else {
      milestones = [];
    }
    const indicatorValue = actualIndicators + sum(milestones);
    const pipeFillValue = isDirectionUp ? this.props.value / this.props.target : this.props.target / this.props.value;

    return connectDragSource(
      connectDropTarget(
        <div style={styles} className={this.classes.container}>
          <div className={this.classes.row}>
            <div className={this.classes.start}>
              <div className={this.classes.index}>
                {'#' + (this.props.priority + 1)}
              </div>
              <div className={this.classes.nickname}>
                {getNickname(this.props.indicator)}
              </div>
            </div>
            <div className={this.classes.end}>
              <div className={this.classes.textValue}>
                {(formatIndicatorDisplay(
                  this.props.indicator,
                  indicatorValue
                ) || 0) + ' / '}
              </div>
              <div className={this.classes.target}>
                {formatIndicatorDisplay(
                  this.props.indicator,
                  this.props.target
                )}
              </div>
              <div
                className={this.classes.textButton}
                style={{marginLeft: '20px'}}
                onClick={this.props.editObjective}
              >
                Edit
              </div>
              <div
                className={this.classes.textButton}
                onClick={this.props.deleteObjective}
              >
                Delete
              </div>
            </div>
          </div>
          <div className={this.classes.row}>
            <div className={this.classes.pipe}>
              <div
                className={this.classes.pipeFill}
                style={{
                  width:
                    Math.min(
                      1,
                      pipeFillValue
                    ) *
                    360 +
                    'px',
                  backgroundImage: `linear-gradient(to right, #e6e8f0, ${getColor(
                    this.props.index
                  )})`
                }}
              />
            </div>
            <div className={this.classes.timeLeft}>
              {this.getDaysLeft()}
            </div>
          </div>
        </div>
      )
    );
  }
}

export default flow(
  DragSource('DraggableObjectiveView', cardSource, (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
  })),
  DropTarget('DraggableObjectiveView', cardTarget, connect => ({
    connectDropTarget: connect.dropTarget()
  }))
)(ObjectiveView);
