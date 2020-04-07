import Component from 'components/Component';
import style from 'styles/controls/objective-icon.css';
import React from 'react';
import PropTypes from 'prop-types';
import Tooltip from 'components/controls/Tooltip';

export default class ObjectiveIcon extends Component {
    style = style;

    static propTypes = {
        target: PropTypes.number.isRequired,
        value: PropTypes.number.isRequired,
        project: PropTypes.number.isRequired,
    };

    render() {
        let iconData = {
            className: this.classes.notAlignedIcon,
            tip: 'You’re off-track to reach your goal',
        };

        if (this.props.target <= this.props.value) {
            iconData.className = this.classes.reachedIcon;
            iconData.tip = 'Goal had been reached';
        } else if (this.props.project >= this.props.target) {
            iconData.className = this.classes.alignedIcon;
            iconData.tip = 'You’re on-track to reach your goal';
        }

        return (
            <Tooltip
                className={iconData.className}
                tip={iconData.tip}
                id="objective-tooltip"
            />
        );
    }
}
