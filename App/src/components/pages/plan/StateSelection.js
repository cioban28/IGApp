import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Component from 'components/Component';
import ReactionIcon from 'components/pages/plan/ReactionIcon';

import style from 'styles/plan/state-selection.css';
import cellStyle from 'styles/plan/table-cell.css';

export default class StateSelection extends Component {
    style = style;
    styles = [cellStyle];

    static propTypes = {
        boxOpen: PropTypes.bool,
        changeConstraint: PropTypes.func.isRequired,
        changeConstraintsBoxOpen: PropTypes.func,
        constraintOptions: PropTypes.object.isRequired,
        currentConstraint: PropTypes.string.isRequired,
        isEditMode: PropTypes.bool,
        stateSelectionBoxRef: PropTypes.func,
    };

    constructor(props) {
        super(props);
        // https://reactjs.org/docs/refs-and-the-dom.html
        // just creating ref for DOM elements
        this.wrapperRef = React.createRef();
        this.iconRef = React.createRef();
    }

    componentDidMount() {
        document.addEventListener('mousedown', this.onOutsideClick, true);
    }

    componentWillUnmount() {
        document.removeEventListener('mousedown', this.onOutsideClick, true);
    }

    onOutsideClick = ({ target }) => {
        if (this.props.boxOpen && !this.isInsideWrapper(target)) {
            this.closeBox();
        }
    };

    changeReaction = key => () => {
        this.props.changeConstraint(key);
        this.closeBox();
    };

    isInsideWrapper = target =>
        this.wrapperRef.current && this.wrapperRef.current.contains(target);

    closeBox = () => {
        this.props.changeConstraintsBoxOpen(false);
    };

    toggleBox = () => {
        const { boxOpen, changeConstraintsBoxOpen } = this.props;

        changeConstraintsBoxOpen(!boxOpen);
    };

    renderStateSelectionBox = () => {
        if (!this.props.constraintOptions) {
            return null;
        }

        return (
            <div
                ref={this.wrapperRef}
                className={this.classes.stateSelectionBox}
            >
                {Object.keys(this.props.constraintOptions).map(key => (
                    <ReactionIcon
                        key={key}
                        onClick={this.changeReaction(key)}
                        {...this.props.constraintOptions[key]}
                    />
                ))}
            </div>
        );
    };

    render() {
        const { boxOpen, constraintOptions, currentConstraint, isEditMode } = this.props;

        return (
            <React.Fragment>
                {boxOpen && this.renderStateSelectionBox()}
                <button
                    className={classNames(this.classes.buttonIcon, {
                        [this.classes.buttonIconNone]: currentConstraint === 'none' && !isEditMode,
                    })}
                    onClick={this.toggleBox}
                    type="button"
                    ref={this.iconRef}
                >
                    <i
                        className={this.classes.icon}
                        data-icon={constraintOptions[currentConstraint].icon}
                    />
                </button>
            </React.Fragment>
        );
    }
}
