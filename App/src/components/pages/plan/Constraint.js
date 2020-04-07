import React from 'react';
import StateSelection from 'components/pages/plan/StateSelection';
import PropTypes from 'prop-types';

class Constraint extends React.Component {
    state = {
        isOpen: false,
    };

    static TYPES = {
        none: {
            constraintData: { isConstraint: false },
            displayOptions: {
                text: 'Feel free to optimize',
                icon: 'plan:none',
            },
        },
        soft: {
            constraintData: { isConstraint: true, isSoft: true },
            displayOptions: { text: 'I like the direction', icon: 'plan:like' },
        },
        hard: {
            constraintData: { isConstraint: true, isSoft: false },
            displayOptions: { text: 'Lock budget', icon: 'plan:lock' },
        },
    };

    getConstraint() {
        const { isConstraint, isSoft } = this.props;

        if (!isConstraint) {
            return 'none';
        }

        return isSoft ? 'soft' : 'hard';
    }

    changeConstraint = changeTo => {
        const { constraintChange, channel, updateIndex } = this.props;
        const { isConstraint, isSoft } = Constraint.TYPES[
            changeTo
        ].constraintData;

        constraintChange(updateIndex, channel, isConstraint, isSoft);
    };

    handleToggle = isOpen => {
        this.setState({ isOpen });
    };

    getConstraintOptions = () => {
        const displayInfo = {};

        Object.keys(Constraint.TYPES).forEach(key => {
            displayInfo[key] = Constraint.TYPES[key].displayOptions;
        });

        return displayInfo;
    };

    render() {
        const { isEditMode } = this.props;
        const { isOpen } = this.state;

        return (
            <StateSelection
                boxOpen={isOpen}
                changeConstraint={this.changeConstraint}
                changeConstraintsBoxOpen={this.handleToggle}
                constraintOptions={this.getConstraintOptions()}
                currentConstraint={this.getConstraint()}
                isEditMode={isEditMode}
            />
        );
    }
}

Constraint.propTypes = {
    constraintChange: PropTypes.func,
    isConstraint: PropTypes.bool,
    isEditMode: PropTypes.bool,
    isSoft: PropTypes.bool,
};

export default Constraint;
