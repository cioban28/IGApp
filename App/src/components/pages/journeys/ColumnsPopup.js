import React, { Component } from 'react';
import Popup, { TextContent } from 'components/pages/plan/Popup';
import PropTypes from 'prop-types';

import styles from 'styles/users/users.css';
import CustomCheckbox from 'components/controls/CustomCheckbox';

const classes = styles.locals;

class ColumnsPopup extends Component {
    constructor(props) {
        super(props);

        const { columns } = props;

        this.state = {
            selectedColumns: [...columns],
        };
    }

    openPopup = () => {
        this.popup.open();
    };

    onSave = () => {
        const { onSave } = this.props;
        const { selectedColumns } = this.state;

        onSave(selectedColumns);
        this.popup.close();
    };

    onCancel = () => {
        const { columns } = this.props;

        this.setState({
            selectedColumns: [...columns],
        },  this.popup.close);
    };

    handleToggleColumn = index => {
        const { selectedColumns } = this.state;
        const newSelectedColumns = [...selectedColumns];

        newSelectedColumns[index] = {
            ...newSelectedColumns[index],
            hide: !newSelectedColumns[index].hide,
        };

        this.setState({
            selectedColumns: newSelectedColumns,
        });
    };

    getColumnsOptions = () => {
        const { columns } = this.props;
        const { selectedColumns } = this.state;

        return columns.map((column, index) => {
            const { label, value } = column;

            return (
                <CustomCheckbox
                    key={value}
                    checked={!selectedColumns[index].hide}
                    onChange={() => this.handleToggleColumn(index)}
                    className={classes.checkboxContainer}
                    checkboxClassName={classes.checkbox}
                    checkMarkClassName={classes.checkboxMark}
                    childrenClassName={classes.checkboxLabel}
                >
                    {label}
                </CustomCheckbox>
            );
        });
    };

    render() {
        return (
            <React.Fragment>
                <button
                    type="button"
                    className={classes.tableManageColumnsButton}
                    onClick={this.openPopup}
                >
                </button>
                <Popup
                    ref={el => (this.popup = el)}
                    title="Manage columns and metrics"
                    className={classes.tablePopup}
                    onClose={this.onCancel}
                    primaryButton={{
                        text: 'Save',
                        onClick: this.onSave,
                    }}
                    secondaryButton={{
                        text: 'Cancel',
                        onClick: this.onCancel,
                    }}
                >
                    <TextContent>
                        <div className={classes.popupContentContainer}>
                            <div className={classes.popupContentColumn}>
                                <div
                                    className={classes.popupContentColumnTitle}
                                >
                                    Columns
                                </div>
                                {this.getColumnsOptions()}
                            </div>
                        </div>
                    </TextContent>
                </Popup>
            </React.Fragment>
        );
    }
}

ColumnsPopup.defaultProps = {
    onSave: () => {},
    columns: [],
};

ColumnsPopup.propTypes = {
    onSave: PropTypes.func,
    columns: PropTypes.arrayOf(
        PropTypes.shape({
            value: PropTypes.node,
            label: PropTypes.node,
            hide: PropTypes.bool,
        }),
    ),
};

export default ColumnsPopup;
