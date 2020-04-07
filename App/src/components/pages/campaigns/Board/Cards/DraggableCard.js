import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { DragSource } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';

import ChannelCard from './ChannelCard';
import CampaignCard from './CampaignCard';

function getStyles(isDragging) {
  return {
    opacity: isDragging ? 0.5 : 1
  };
}

const cardSource = {
  beginDrag(props, monitor, component) {
    const { item, x, y } = props;
    const { id, title, status } = item;
    const { clientWidth, clientHeight } = findDOMNode(component);

    return { id, title, status, item, x, y, clientWidth, clientHeight, type: item.campaigns ? 'channel' : 'campaign' };
  },
  endDrag(props, monitor) {
    props.stopScrolling();
  },
  isDragging(props, monitor) {
    return props.item && props.item.id === monitor.getItem().id && props.item.status === monitor.getItem().status;
  }
};

const OPTIONS = {
  card: {
    arePropsEqual(props, otherProps) {
      return props.item.id === otherProps.item.id &&
        props.item.status === otherProps.item.status &&
        props.item.campaigns === otherProps.item.campaigns &&
        props.x === otherProps.x &&
        props.y === otherProps.y
    }
  },
  campaignCard: {
    arePropsEqual(props, otherProps) {
      return props.item === otherProps.item &&
        props.x === otherProps.x &&
        props.y === otherProps.y &&
        props.first === otherProps.first &&
        props.last === otherProps.last;
    }
  },
};

function collectDragSource(connectDragSource, monitor) {
  return {
    connectDragSource: connectDragSource.dragSource(),
    connectDragPreview: connectDragSource.dragPreview(),
    isDragging: monitor.isDragging()
  };
}

const cardComponents = {
	card: ChannelCard,
	campaignCard: CampaignCard,
};

function createDraggableCard(type) {
  const CardComponent = cardComponents[type];

	return DragSource(type, cardSource, collectDragSource, OPTIONS[type])(class extends Component {
		static propTypes = {
			item: PropTypes.object,
			connectDragSource: PropTypes.func.isRequired,
			connectDragPreview: PropTypes.func.isRequired,
			isDragging: PropTypes.bool.isRequired,
			x: PropTypes.number.isRequired,
			y: PropTypes.number,
			stopScrolling: PropTypes.func,
			first: PropTypes.bool,
			last: PropTypes.bool,
		};

		componentDidMount() {
			this.props.connectDragPreview(getEmptyImage(), {
				captureDraggingState: true
			});
		}

		render() {
			const {isDragging, connectDragSource, connectDragPreview, ...otherProps} = this.props;

			return connectDragSource(
        <div>
          <CardComponent style={getStyles(isDragging)} {...otherProps} />
        </div>
			);
		}
	})
}

export const DraggableChannelCard = createDraggableCard('card');
export const DraggableCampaignCard = createDraggableCard('campaignCard');