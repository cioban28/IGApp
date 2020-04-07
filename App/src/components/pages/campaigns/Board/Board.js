import React from 'react';
import PropTypes from 'prop-types';
import Component from 'components/Component';

import Cards from './Cards/Cards';
import CustomDragLayer from './CustomDragLayer';

import style from 'styles/campaigns/board.css';

const getUpdatesForColumnIfNeeded = (columnList) => columnList.cards
  .reduce((res, card) => {
    card.campaigns.forEach((campaign) => {
      if (campaign.order === undefined) {
        res.push({
          id: campaign.id,
          order: card.order,
        })
      }
    })

    return res
  }, [])

const getUpdatesForShiftedItemsInColumn = (columnList, orderShift, fromIndex, toIndex = columnList.length) => columnList.cards
  .slice(fromIndex, toIndex)
  .reduce((res, card) => {
    return res.concat(card.campaigns.map((campaign) => ({
      id: campaign.id,
      order: card.order + orderShift,
    })))
  }, [])

class Board extends Component {
  style = style
  columns = { }
  containerRect = { }

  static childContextTypes = {
    onCampaignUpdate: PropTypes.func,
    container: PropTypes.any,
    containerRect: PropTypes.object,
    userAccount: PropTypes.object,
    auth: PropTypes.object,
    showCampaign: PropTypes.func,
    addNewCampaign: PropTypes.func
  };

  getChildContext() {
    return {
      onCampaignUpdate: this.props.onCampaignUpdate,
      container: this.board,
      containerRect: this.containerRect,
      userAccount: this.props.userAccount,
      showCampaign: this.props.showCampaign,
      addNewCampaign: this.props.addNewCampaign
    };
  }

  constructor(props) {
    super(props);

    this.state = {
      isScrolling: false,
      lists: props.lists,
    };
  }

  componentDidMount() {
    if (this.board) {
      this.containerRect = this.board.getBoundingClientRect()
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.lists !== this.props.lists) {
      this.setState({
        lists: nextProps.lists
      });
    }
  }

  moveCard = (lastX, lastY, nextX, nextY, meta) => {
    const newLists = this.state.lists.slice();
    const card = newLists[lastX].cards[lastY];
    const isCampaign = meta.type === 'campaign' && lastX !== nextX
    const hasCampaigns = card.campaigns && card.campaigns.length > 0

    if (isCampaign || hasCampaigns) {
      const updates = []
      const nextList = newLists[nextX]
      const prevList = newLists[lastX]

      // update all shifted items in 'lastX' and 'nextX' columns
      if (nextList !== prevList) {
        // for the initial case when campaigns have no order
        updates.push(...getUpdatesForColumnIfNeeded(prevList))
        updates.push(...getUpdatesForColumnIfNeeded(nextList))

        updates.push(...getUpdatesForShiftedItemsInColumn(prevList, -1, lastY + 1))
        updates.push(...getUpdatesForShiftedItemsInColumn(nextList, 1, nextY))
      } else {
        updates.push(...getUpdatesForColumnIfNeeded(nextList))

        if (nextY > lastY) {
          updates.push(...getUpdatesForShiftedItemsInColumn(nextList, -1, lastY + 1, nextY + 1))
        } else {
          updates.push(...getUpdatesForShiftedItemsInColumn(nextList, 1, nextY, lastY))
        }
      }

      // update moved campaigns
      if (isCampaign) {
        updates.push({
          id: meta.item.id,
          status: this.state.lists[nextX].name,
          order: nextY,
        })
      } else {
        updates.push(...card.campaigns.map(campaign => ({
          id: campaign.id,
          status: this.state.lists[nextX].name,
          order: nextY,
        })))
      }

      this.props.onCampaignsOrderChange(updates)

      return
    }

    if (lastX === nextX) {
      newLists[lastX].cards.splice(nextY, 0, newLists[lastX].cards.splice(lastY, 1)[0]);

      this.setState({ lists: newLists })
    } else {
      // move element to new place
      newLists[nextX].cards.splice(nextY, 0, newLists[lastX].cards[lastY]);
      // delete element from old place
      newLists[lastX].cards.splice(lastY, 1);

      this.setState({ lists: newLists })
    }
  };

  startScrolling = (direction, column) => {
    if (this.state.isScrolling) {
      clearInterval(this.scrollInterval);
    }

    switch (direction) {
      case 'toLeft':
        this.setState({ isScrolling: true }, this.scrollLeft());
        break;
      case 'toRight':
        this.setState({ isScrolling: true }, this.scrollRight());
        break;
      case 'toTop':
        this.setState({ isScrolling: true }, this.scrollTop(column));
        break;
      case 'toBottom':
        this.setState({ isScrolling: true }, this.scrollBottom(column));
        break;
      default:
        break;
    }
  };

  scroll = (scrollFn) => {
    this.setState({ isScrolling: true }, () => {
      this.scrollInterval = setInterval(scrollFn, 10);
    });
  }

  scrollRight = () => {
    if (this.board.scrollLeft + this.board.offsetWidth >= this.board.scrollWidth) {
      return
    }

    this.scroll(() => {
      this.board.scrollLeft += 10;
    })
  };

  scrollLeft = () => {
    if (this.board.scrollLeft === 0) {
      return
    }

    this.scroll(() => {
      this.board.scrollLeft -= 10;
    })
  };

  scrollTop = (columnIndex) => {
    const column = this.columns[columnIndex]

    if (column.scrollTop === 0) {
      return
    }

    this.scroll(() => {
      column.scrollTop -= 10;
    })
  };

  scrollBottom = (columnIndex) => {
    const column = this.columns[columnIndex]

    if (column.scrollTop + column.offsetHeight >= column.scrollHeight) {
      return
    }

    this.scroll(() => {
      column.scrollTop += 10;
    })
  };

  stopScrolling = () => {
    this.setState({ isScrolling: false }, clearInterval(this.scrollInterval));
  };

  openPopup = (x) => {
    this.props.addNewCampaign({status: this.state.lists[x].name});
  };

  renderColumn = (item, i) => {
    return (
			<div className={this.classes.desk} key={item.name}>
				<div className={this.classes.deskHead}>
					<div className={this.classes.deskName}><div className={this.classes.oSign} />{item.name}</div>
				</div>
				<Cards
					moveCard={this.moveCard}
					x={i}
					cards={item.cards}
					startScrolling={this.startScrolling}
					stopScrolling={this.stopScrolling}
					isScrolling={this.state.isScrolling}
          getRef={(ref) => this.columns[i] = ref}
				/>

				<button className={ this.classes.addButton } onClick={ () => { this.openPopup(i) }}>
					Add Campaign
				</button>
			</div>
    );
  };

  render() {
    const { lists } = this.state;
    return (
			<div className={this.classes.board} ref={ref => this.board = ref}>
				<CustomDragLayer snapToGrid={false} />
        {lists.map(this.renderColumn)}
			</div>
    );
  }
}

export default Board