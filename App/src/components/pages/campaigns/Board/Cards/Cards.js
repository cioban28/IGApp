import React from 'react';
import PropTypes from 'prop-types';
import { DropTarget } from 'react-dnd';
import { findDOMNode } from 'react-dom';
import Component from 'components/Component';
import classnames from 'classnames'

import { DraggableChannelCard } from './DraggableCard';

import style from 'styles/campaigns/cards.css';
import cardStyle from 'styles/campaigns/card.css';

const CARD_HEIGHT = 100;  // height of a single card(excluding marginBottom/paddingBottom)
const CARD_MARGIN = 15;  // height of a marginBottom+paddingBottom
const OFFSET_HEIGHT = 260; // height offset from the top of the page

function getPlaceholderIndex(y, columnTop, columnScrollTop) {
  // shift placeholder if y position more than card height / 2
  const yPos = y - columnTop + columnScrollTop;
  let placeholderIndex;

  if (yPos < CARD_HEIGHT / 2) {
    placeholderIndex = -1; // place at the start
  } else {
    placeholderIndex = Math.floor((yPos - CARD_HEIGHT) / (CARD_HEIGHT + CARD_MARGIN));
  }
  return placeholderIndex;
}

const specs = {
  drop(props, monitor, component) {
    // document.getElementById(monitor.getItem().id).style.display = 'block';
    const { placeholderIndex } = component.state;
    const item = monitor.getItem();
    const lastX = item.x;
    const lastY = item.y;
    const nextX = props.x;
    let nextY = placeholderIndex;

    if (lastY > nextY) { // move top
      nextY += 1;
    } else if (lastX !== nextX) { // insert into another list
      nextY += 1;
    }

    if (lastX === nextX && (lastY === nextY || item.type === 'campaign')) { // if position equal
      return;
    }

    props.moveCard(lastX, lastY, nextX, nextY, { type: item.type, item: item.item });
    props.stopScrolling();
  },
  hover(props, monitor, component) {
    const item = monitor.getItem();

    if (item.type === 'campaign' && item.x === props.x) {
      return;
    }

    const { element, elementRect, context } = component
    const { container, containerRect } = context;
    const clientOffset = monitor.getClientOffset()

    // defines where placeholder is rendered
    const placeholderIndex = getPlaceholderIndex(clientOffset.y, elementRect.top, element.scrollTop);
    const SCROLL_H_THRESHOLD = 50;
    const SCROLL_V_THRESHOLD = 150;
    //
    // console.log('HOVER', clientOffset, containerRect, item.x, props.x, props.y)
    // horizontal scroll
    if (!props.isScrolling) {
      if (containerRect.right - clientOffset.x < SCROLL_H_THRESHOLD) {
        props.startScrolling('toRight');
      } else if (clientOffset.x - containerRect.left < SCROLL_H_THRESHOLD) {
        props.startScrolling('toLeft');
      } else if (clientOffset.y - containerRect.top < SCROLL_V_THRESHOLD) {
				props.startScrolling('toTop', props.x);
      } else if (containerRect.bottom - clientOffset.y < SCROLL_V_THRESHOLD) {
				props.startScrolling('toBottom', props.x);
      }
    } else {
      if (
        containerRect.right - clientOffset.x > SCROLL_H_THRESHOLD &&
				clientOffset.x - containerRect.left > SCROLL_H_THRESHOLD &&
        clientOffset.y - containerRect.top > SCROLL_V_THRESHOLD &&
        containerRect.bottom - clientOffset.y > SCROLL_V_THRESHOLD
      ) {
        props.stopScrolling();
      }
    }

    // IMPORTANT!
    // HACK! Since there is an open bug in react-dnd, making it impossible
    // to get the current client offset through the collect function as the
    // user moves the mouse, we do this awful hack and set the state (!!)
    // on the component from here outside the component.
    // https://github.com/gaearon/react-dnd/issues/179
    component.setState({ placeholderIndex });
  }
};


class Cards extends Component {
  style = style;
  styles = [cardStyle];

  static propTypes = {
    connectDropTarget: PropTypes.func.isRequired,
    moveCard: PropTypes.func.isRequired,
    cards: PropTypes.array.isRequired,
    x: PropTypes.number.isRequired,
    isOver: PropTypes.bool,
    item: PropTypes.object,
    canDrop: PropTypes.bool,
    startScrolling: PropTypes.func,
    stopScrolling: PropTypes.func,
    isScrolling: PropTypes.bool,
    getRef: PropTypes.func,
  };

	static contextTypes = {
		container: PropTypes.any,
    containerRect: PropTypes.object,
	};

  constructor(props) {
    super(props);
    this.state = {
      placeholderIndex: undefined,
      isScrolling: false,
    };
  }

  componentDidMount() {
    if (this.element) {
      this.elementRect = this.element.getBoundingClientRect()
    }
  }

  setRef = (ref) => {
    this.element = ref
    this.props.getRef(ref)
  }

  render() {
    const { connectDropTarget, x, cards, isOver, canDrop, getRef } = this.props;
    const { placeholderIndex } = this.state;

    let isPlaceHold = false;
    let cardList = [];
    cards.forEach((item, i) => {
      if (isOver && canDrop) {
        isPlaceHold = false;
        if (i === 0 && placeholderIndex === -1) {
          cardList.push(
            <div key="placeholder" className={classnames(cardStyle.locals.cardContainer, this.classes.cardsPlaceholder)} />
          );
        } else if (placeholderIndex > i) {
          isPlaceHold = true;
        }
      }
      if (item !== undefined) {
        cardList.push(
          <DraggableChannelCard x={x} y={i}
            item={item}
            key={item.id}
            stopScrolling={this.props.stopScrolling}
          />
        );
      }
      if (isOver && canDrop && placeholderIndex === i) {
        cardList.push(
          <div key="placeholder" className={classnames(cardStyle.locals.cardContainer, this.classes.cardsPlaceholder)} />
        );
      }
    });

    // if placeholder index is greater than array.length, display placeholder as last
    if (isPlaceHold) {
      cardList.push(
        <div key="placeholder" className={classnames(cardStyle.locals.cardContainer, this.classes.cardsPlaceholder)} />
      );
    }

    // if there is no items in cards currently, display a placeholder anyway
    if (isOver && canDrop && cards.length === 0) {
      cardList.push(
        <div key="placeholder" className={classnames(cardStyle.locals.cardContainer, this.classes.cardsPlaceholder)} />
      );
    }

    return connectDropTarget(
      <div className={this.classes.cards} ref={this.setRef}>
        {cardList}
      </div>
    );
  }
}

export default DropTarget(['card', 'campaignCard'], specs, (connectDragSource, monitor) => ({
	connectDropTarget: connectDragSource.dropTarget(),
	isOver: monitor.isOver(),
	canDrop: monitor.canDrop(),
	item: monitor.getItem()
}))(Cards)
