import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { extractNumberFromBudget } from 'components/utils/budget';
import Constraint from 'components/pages/plan/Constraint';

import styles from 'styles/plan/table-cell-2.css';

styles.use();
const classes = styles.locals;

class TableCell extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state = {
            value: '',
            isEditMode: false,
        };

        this.cellRef = React.createRef();
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        const { value, isEditMode } = prevState;
        const { isEditMode: controlledIsEditMode } = nextProps;

        if (nextProps.value !== value && !isEditMode && !controlledIsEditMode) {
            return {
                value: nextProps.value,
            };
        }

        if (controlledIsEditMode) {
            return {
                isEditMode: false,
            };
        }

        return null;
    }

    componentDidUpdate(prevProps, prevState) {
        const { value } = this.props;
        const { isEditMode } = this.state;

        // If we add new channel
        // Table doesn't unmout cells
        // It just changes content
        // So to update cell state we need to
        // observe props value change
        // Todo: make it better
        if (prevProps.value !== value) {
            this.setState({
                value,
            })
        }

        if (!prevState.isEditMode && isEditMode) {
            document.addEventListener('click', this.handleOutsideClick);
        }

        if (prevState.isEditMode && !isEditMode) {
            document.removeEventListener('click', this.handleOutsideClick);
        }
    }

    handleOpenEditMode = event => {
        event.preventDefault();

        this.setState({
            isEditMode: true,
        });
    };

    handleDeclineEdit = () => {
        const { value } = this.props;

        this.setState({
            value,
            isEditMode: false,
        });
    };

    handleOutsideClick = event => {
        const { isEditMode } = this.state;
        const { target } = event;

        if (
            isEditMode &&
            this.cellRef.current &&
            !this.cellRef.current.contains(target)
        ) {
            this.setState({
                isEditMode: false,
            });
        }
    };

    onChange = event => {
        const { onChange } = this.props;
        const { value } = event.target;
        const formattedValue = extractNumberFromBudget(value);

        this.setState(
            {
                value: formattedValue,
            },
            () => onChange(value),
        );
    };

    onBlur = () => {
        const { value: valueFromProp } = this.props;
        const { value } = this.state;

        if (value !== valueFromProp) {
            this.handleSubmitChanges(value);
        }
    };

    onSubmit = event => {
        const { value } = this.state;
        event.preventDefault();

        this.handleSubmitChanges(value);
    };

    handleSubmitChanges = value => {
        const { channel, onEdit, updateIndex, region } = this.props;

        this.setState(
            {
                isEditMode: false,
            },
            () => onEdit(updateIndex, channel, value, region),
        );
    };

    approveSuggestion = () => {
        const { secondaryValue } = this.props;

        this.handleSubmitChanges(secondaryValue);
    };

    showSuggestion() {
        const {
            isEditMode: isEditModeFromProp,
            secondaryValue,
            value,
        } = this.props;

        return Boolean(
            secondaryValue && secondaryValue !== value && isEditModeFromProp,
        );
    }

    renderConstraint() {
        const {
            channel,
            constraintChange,
            isConstraint,
            isConstraintsEnabled,
            isSoft,
            updateIndex,
        } = this.props;
        const { isEditMode } = this.state;

        if (!isConstraintsEnabled) {
            return null;
        }

        return (
            <Constraint
                channel={channel}
                constraintChange={constraintChange}
                isConstraint={isConstraint}
                isEditMode={isEditMode}
                isSoft={isSoft}
                updateIndex={updateIndex}
            />
        );
    }

    renderActionButtons() {
        const { isEditMode: controlledIsEditMode } = this.props;
        const { isEditMode } = this.state;

        if (isEditMode && !controlledIsEditMode) {
            return (
                <React.Fragment>
                    <button className={classes.button} type="submit">
                        <i
                            className={classes.icon}
                            data-icon="plan:approveEdit"
                        />
                    </button>
                    <button
                        className={classes.button}
                        type="button"
                        onClick={this.handleDeclineEdit}
                    >
                        <i
                            className={classes.icon}
                            data-icon="plan:declineEdit"
                        />
                    </button>
                </React.Fragment>
            );
        }

        if (this.showSuggestion()) {
            return (
                <button
                    className={classes.button}
                    onClick={this.approveSuggestion}
                    type="button"
                >
                    <i
                        className={classes.icon}
                        data-icon="plan:acceptSuggestion"
                    />
                </button>
            );
        }

        if (!this.isEditMode()) {
            return (
                <button
                    className={classNames(classes.button, classes.buttonEdit)}
                    onClick={this.handleOpenEditMode}
                    type="button"
                >
                    <i className={classes.icon} data-icon="plan:edit" />
                </button>
            );
        }
    }

    renderInput() {
        const { format, isEditMode } = this.props;
        const { value } = this.state;
        const formattedValue = format(value);
        const onBlur = isEditMode ? this.onBlur : undefined;

        if (this.isEditMode()) {
            return (
                <input
                    className={classNames(classes.input, classes.inputEditable)}
                    type="text"
                    value={formattedValue}
                    onChange={this.onChange}
                    onBlur={onBlur}
                />
            );
        }

        return <div className={classes.input}>{formattedValue}</div>;
    }

    isEditMode() {
        const { isEditMode: controlledIsEditMode } = this.props;
        const { isEditMode } = this.state;

        return isEditMode || controlledIsEditMode;
    }

    render() {
        const { format, secondaryValue } = this.props;
        const formattedSecondaryValue = format(secondaryValue);

        return (
            <form
                className={classes.root}
                onSubmit={this.onSubmit}
                ref={this.cellRef}
            >
                <div className={classes.inputWrapper}>
                    {this.renderInput()}
                    <div
                        className={classNames(classes.secondaryValue, {
                            [classes.secondaryValueShow]: this.showSuggestion(),
                        })}
                    >
                        {formattedSecondaryValue}
                    </div>
                </div>
                <div className={classes.actions}>
                    {this.renderConstraint()}
                    {this.renderActionButtons()}
                </div>
            </form>
        );
    }
}

TableCell.defaultProps = {
    onChange: () => {},
    format: () => {},
    onEdit: () => {},
    secondaryValue: 1000,
};

TableCell.propTypes = {
    channel: PropTypes.string,
    format: PropTypes.func,
    onChange: PropTypes.func,
    onEdit: PropTypes.func,
    region: PropTypes.string,
    updateIndex: PropTypes.number,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

export default TableCell;
