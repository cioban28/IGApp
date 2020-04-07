import React from 'react';
import PropTypes from 'prop-types';
import Component from 'components/Component';
import Box, {
  Row as BoxRow,
  Level as BoxLevel,
  LeveledRow as BoxLeveledRow
} from 'components/pages/plan/Box';
import PlanPopup, {
  TextContent as PopupTextContent
} from 'components/pages/plan/Popup';
import style from 'styles/plan/current-tab.css';
import planStyles from 'styles/plan/plan.css';
import icons from 'styles/icons/plan.css';

export function formatPrice(price) {
  price = String(Number.parseInt(price));

  let priceArr = price.split('').reverse();
  let resultArr = [];

  while (priceArr.length) {
    resultArr = resultArr.concat(priceArr.slice(0, 3), ',');
    priceArr = priceArr.slice(3);
  }

  return '$' + resultArr.reverse().slice(1).join('');
}

const popupWidth = 350;

export default class ChannelCube extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
    month: PropTypes.number.isRequired, // month index in processed plan json (not real month number)
    monthBudget: PropTypes.number,
  };

  styles = [planStyles, icons];
  style = style;

  popupStyles = {
    default: {
      width: `${popupWidth}px`,
      left: '100%',
      top: '-10px',
      marginLeft: '10px'
    },
    shifted: {
      width: `${popupWidth}px`,
      left: '50%',
      top: '-10px',
      transform: 'translateX(-50%)'
    }
  };

  state = {
    infoItem: { },
    expectationItem: { },
    popupStyle: this.popupStyles.default
  };

  setPopupStyle(target) {
    const rect = target.getBoundingClientRect();
    let popupStyle = this.popupStyles.default;

    if (window.innerWidth - rect.right < popupWidth + 10) {
      popupStyle = this.popupStyles.shifted;
    }

    this.setState({ popupStyle });
  }

  handleLeafOptionClick = (e, index, title, data) => {
    this.setPopupStyle(e.target);

    if (index === 0) {
      this.setState({
        infoItem: {
          title,
          info: data.info
        }
      }, () => this.infoPopup.open());
    } else if (index === 1) {
      this.setState({
        expectationItem: {
          title,
          info: data.expectation
        }
      }, () => this.expectationPopup.open());
    }
  };

  handleBoxInfoClick = (e) => {
    this.setPopupStyle(e.target);
    this.mainPopup.open();
  };

  renderDeepLevel(name, data) {
    const { month } = this.props;
    const price = data.approvedValues[month];

    if (price === 0) {
      return null;
    }

    let content = null;

    if (data.children) {
      content = Object.keys(data.children).map((childName) => {
        return this.renderDeepLevel(childName, data.children[childName]);
      });
    }

    return (
      <BoxLevel
        key={name}
        icon={data.icon}
        channel={data.channel}
        title={name}
        price={formatPrice(price)}
        disabled={data.disabled}
        onInfoClick={(...args) => this.handleLeafOptionClick(...args, name, data)}
      >
        {content}
      </BoxLevel>
    )
  }

  renderFirstLevel(name, data) {
    const { month } = this.props;
    const price = data.approvedValues[month];

    if (price === 0) {
      return null;
    }

    if (data.children) {
      return (
        <BoxLeveledRow key={name}>
          {this.renderDeepLevel(name, data)}
        </BoxLeveledRow>
      );
    } else {
      return (
        <BoxRow
          key={name}
          icon={data.icon}
          channel={data.channel}
          title={name}
          price={formatPrice(price)}
          onInfoClick={(...args) => this.handleLeafOptionClick(...args, name, data)}
        />
      );
    }
  }

  render() {
    const { title, data, month, monthBudget } = this.props;
    const { infoItem, expectationItem, popupStyle } = this.state;
    const price = data.approvedValues[month];

    if (price === 0) {
      return null;
    }

    const progress = Math.round(100 * price / monthBudget);

    return (
      <Box
        className={this.classes.box}
        title={title}
        channel={data.channel}
        price={formatPrice(price)}
        progress={progress}
        onInfoClick={this.handleBoxInfoClick}
      >
        {
          data.children ?
          Object.keys(data.children).map((childName) => {
          return this.renderFirstLevel(childName, data.children[childName]);
        })
        : null
        }

        <PlanPopup
          ref={ref => this.mainPopup = ref}
          style={popupStyle}
          title={`${title} : Why should you use it?`}
        >
          <PopupTextContent>
            <p>{data.info || 'COMING SOON...'}</p>
          </PopupTextContent>
        </PlanPopup>
        <PlanPopup
          ref={ref => this.infoPopup = ref}
          style={popupStyle}
          title={`${infoItem.title} : What is it?`}
        >
          <PopupTextContent>
            <p>{infoItem.info || 'COMING SOON...'}</p>
          </PopupTextContent>
        </PlanPopup>
        <PlanPopup
          ref={ref => this.expectationPopup = ref}
          style={popupStyle}
          title={`${expectationItem.title} : Expectation`}
        >
          <PopupTextContent>
            <p>{expectationItem.info || 'COMING SOON...'}</p>
          </PopupTextContent>
        </PlanPopup>
      </Box>
    )
  }
}
