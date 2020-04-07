import React from 'react';
import PropTypes from 'prop-types';
import Component from 'components/Component';
import {SmallTable} from 'components/controls/Table';
import style from 'styles/analyze/analyze.css';

export default class OverviewTable extends Component {
  style = style;

  static propTypes = {
    title: PropTypes.string.isRequired,
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    columns: PropTypes.arrayOf(PropTypes.object).isRequired
  }

  render() {
    const {title, data, columns} = this.props;

    return (
      <div className={this.classes.colAuto}>
        <div className={this.classes.item}>
          <div className={this.classes.itemTitle}>{title}</div>
          <SmallTable
            noPadding
            className={this.classes.overviewTable}
            style={{
              height: 360
            }}
            rowGroupClassName={this.classes.rowGroup}
            rowClassName={this.classes.row}
            headerClassName={this.classes.header}
            headRowClassName={this.classes.headerRow}
            cellClassName={this.classes.cell}
            data={data}
            columns={columns}
          />
        </div>
      </div>
    )
  }
}
