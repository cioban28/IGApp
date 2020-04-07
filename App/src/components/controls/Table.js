import React, {createContext} from 'react';
import Button from 'components/controls/Button';
import classnames from 'classnames';
import Component from 'components/Component';
import PropTypes from 'prop-types';
import ReactTable, {ReactTableDefaults} from 'react-table';
import {withFixedColumnsStickyPosition} from 'react-table-hoc-fixed-columns';

import reactTableStyle from 'react-table/react-table.css';
import style from 'styles/controls/table.css';

const ReactTableFixedColumns = withFixedColumnsStickyPosition(ReactTable);

const tableStyles = style.locals;
// https://reactjs.org/docs/context.html
// this particular context is used in TheadWithFooterRowComponent to determine whether this row is header or footer
const IsFooterRowContext = createContext(false);

const TheadComponent = ({children, className, headerClassName, ...props}) => (
  <ReactTableDefaults.TheadComponent {...props} className={classnames(className, headerClassName)}>
    {children}
  </ReactTableDefaults.TheadComponent>
);

const TheadWithFooterRowComponent = ({
  children,
  className,
  headerClassName,
  headRowClassName,
  footRowClassName,
  ...props
}) => (
  <ReactTableDefaults.TheadComponent {...props} className={classnames(className, headerClassName)}>
    <div className={classnames(tableStyles.headRow, headRowClassName)}>
      <IsFooterRowContext.Provider value={false}>
        {children}
      </IsFooterRowContext.Provider>
    </div>
    <div className={classnames(tableStyles.footRow, footRowClassName)}>
      <IsFooterRowContext.Provider value={true}>
        {children}
      </IsFooterRowContext.Provider>
    </div>
  </ReactTableDefaults.TheadComponent>
);

const ThComponent = ({children, cellClassName, ...props}) => (
  <ReactTableDefaults.ThComponent {...props}>
    <div className={classnames(tableStyles.cellContent, cellClassName)}>{children}</div>
  </ReactTableDefaults.ThComponent>
);

const ThWithFooterCheckComponent = ({children, cellClassName, footer, ...props}) => (
  <ReactTableDefaults.ThComponent {...props}>
    <IsFooterRowContext.Consumer>
      {(isFooter) => isFooter
      ? (
        <div className={classnames(tableStyles.cellContent, cellClassName)}>{footer}</div>
      )
      : (
        <div className={classnames(tableStyles.cellContent, cellClassName)}>{children}</div>
      )}
    </IsFooterRowContext.Consumer>
  </ReactTableDefaults.ThComponent>
);

const TdComponent = ({children, cellClassName, ...props}) => (
  <ReactTableDefaults.TdComponent {...props}>
    <div className={classnames(tableStyles.cellContent, cellClassName)}>{children}</div>
  </ReactTableDefaults.TdComponent>
);

const CustomPaginationComponent = ({data, onClick, pageSize}) => {
  if (data.length <= pageSize) {
    return null;
  }

  return (
    <Button
      type="primary"
      onClick={onClick}
      className={tableStyles.paginationButton}
    >
      Show more
    </Button>
  );
};

export default class Table extends Component {
  style = style;
  styles = [style, reactTableStyle];

  constructor(props) {
    super(props);

    const {
      data,
      showPagination,
      defaultPageSize,
    } = props;

    const pageSize = showPagination && data.length > defaultPageSize
      ? defaultPageSize
      : data.length;

    this.state = {
      pageSize: this.props.pageSize ? this.props.pageSize : pageSize
    };
  };

  static propTypes = {
    // wrapper classname
    className: PropTypes.string,
    // table classname
    tableClassName: PropTypes.string,
    headerClassName: PropTypes.string,
    footerClassName: PropTypes.string,
    rowGroupClassName: PropTypes.string,
    headRowClassName: PropTypes.string,
    rowClassName: PropTypes.string,
    footRowClassName: PropTypes.string,
    // use together with one of headRowClassName, rowClassName or footRowClassName to override specific cell
    cellClassName: PropTypes.string,

    columns: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      header: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
      // (value, rowData) => PropTypes.node,
      cell: PropTypes.oneOfType([PropTypes.func, PropTypes.node, PropTypes.string]),
      footer: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
      // adds right border to the column ('divider')
      divider: PropTypes.bool,
      fixed: PropTypes.oneOf(['left', 'right']),
      sortable: PropTypes.bool,
      minWidth: PropTypes.number,
      className: PropTypes.string,
      headerClassName: PropTypes.string,
      footerClassName: PropTypes.string,
    })),
    data: PropTypes.arrayOf(PropTypes.object),
    defaultMinWidth: PropTypes.number, // default min width of column
    showFootRowOnHeader: PropTypes.bool,
    striped: PropTypes.bool,
    onRowClick: PropTypes.func, // (item, index, event) => PropTypes.any
    // fixed height mode,
    // sticky columns are not working in this mode due to layout issues
    fixedMode: PropTypes.bool,
  };

  static defaultProps = {
    defaultMinWidth: 120,
    data: [],
    defaultPageSize: DEFAULT_PAGE_SIZE,
    showMoreStep: 15,
    showPagination: false,
  };

  componentDidUpdate(prevProps, prevState) {
    if (typeof this.props.pageSize === "undefined" &&
      this.props.data.length !== this.state.pageSize) {
        this.setState({
          pageSize: this.props.showPagination
            ? this.props.defaultPageSize
            : this.props.data.length
        });
    }
  };

  makeColumns() {
    const {columns, defaultMinWidth} = this.props;


    return columns.map(({
      id,
      header,
      cell,
      footer,
      // https://github.com/react-tools/react-table#accessors
      // the default behavior for the accessor is to return the whole data item
      accessor = (item) => item,
      divider,
      // by default columns aren't sortable, but you can change it passing `sortable: true`
      sortable = false,
      minWidth = defaultMinWidth,
      className,
      headerClassName,
      footerClassName,
      ...other
    }) => {
      return {
        id,
        // if the `cell` property is given a string value it overrides accessor,
        // so for example cell: 'domain' equals cell: (item) => item.domain
        // cell: 'domain.name' equals cell: (item) => item.domain.name
        accessor: typeof cell === 'string' ? cell : accessor,
        sortable,
        minWidth,
        Cell: typeof cell === 'function' ? (row) => cell(row.value, row) : cell,
        Header: header,
        Footer: footer,
        getHeaderProps: () => ({ footer }),
        className: classnames(className, divider && tableStyles.divider),
        headerClassName: classnames(headerClassName, divider && tableStyles.divider),
        footerClassName: classnames(footerClassName, divider && tableStyles.divider),
        ...other
      }
    });
  };

  handleShowMoreClick = () => {
    const {showMoreStep, data, handleShowMoreClick}  = this.props;

    if (!!handleShowMoreClick) {
      handleShowMoreClick(showMoreStep, data);
    }
    else {
      this.setState(prevState => {
        const isLastPage = (data.length - prevState.pageSize) < showMoreStep;
        return {
          pageSize: isLastPage ? data.length : prevState.pageSize + showMoreStep
        };
      });
    }
  };

  render() {
    const {
      cellClassName,
      className,
      columns,
      data,
      minRows,
      defaultMinWidth,
      rowGroupClassName,
      footRowClassName,
      headerClassName,
      footerClassName,
      headRowClassName,
      noPadding,
      onRowClick,
      rowClassName,
      showFootRowOnHeader,
      tableClassName,
      fixedMode,
      striped,
      ...other
    } = this.props;
    const {pageSize: controlledPageSize} = this.state;
    const TableComponent = fixedMode ? ReactTable : ReactTableFixedColumns;

    return (
      <div className={classnames(
        tableStyles.wrap,
        noPadding && tableStyles.noPadding,
        fixedMode && tableStyles.fixedMode,
        className
      )}>
        <TableComponent
          minRows={minRows}
          ThComponent={showFootRowOnHeader ? ThWithFooterCheckComponent : ThComponent}
          TdComponent={TdComponent}
          TheadComponent={showFootRowOnHeader ? TheadWithFooterRowComponent : TheadComponent}
          PaginationComponent={CustomPaginationComponent}
          NoDataComponent={() => null} // turn it off for now
          pageSize={controlledPageSize}
          resizable={true}
          className={classnames(tableStyles.table)}
          data={data}
          columns={this.makeColumns()}
          getResizerProps={() => ({
            className: tableStyles.resizer,
          })}
          getTableProps={() => ({
            className: tableClassName
          })}
          getTheadGroupTrProps={() => ({className: classnames(tableStyles.headRow, headRowClassName)})}
          getTheadGroupThProps={() => ({
            className: tableStyles.cell,
            cellClassName,
          })}
          getTheadProps={() => (showFootRowOnHeader ? {
            headerClassName,
            headRowClassName,
            footRowClassName,
          } : {
            headerClassName,
          })}
          getTheadTrProps={() => ({
            className: classnames(tableStyles.headRow, headRowClassName),
          })}
          getTheadThProps={() => ({
            className: tableStyles.cell,
            cellClassName,
          })}
          getTrProps={(state, rowInfo = {}, column) => ({
            className: classnames(
              tableStyles.tableRow,
              rowClassName,
              onRowClick && tableStyles.clickable,
              striped && rowInfo.index % 2 === 0 && tableStyles.striped
            ),
            onClick: (e, handleOriginal) => {
              if (onRowClick) {
                onRowClick(rowInfo.original, rowInfo.index, e)
              }

              if (handleOriginal) {
                handleOriginal();
              }
            },
          })}
          getTrGroupProps={() => ({className: classnames(tableStyles.tableRowGroup, rowGroupClassName)})}
          getTdProps={() => ({
            className: tableStyles.cell,
            cellClassName,
          })}
          getTfootProps={() => ({className: classnames(tableStyles.foot, footerClassName)})}
          getTfootTrProps={() => ({className: classnames(tableStyles.footRow, footRowClassName)})}
          getTfootTdProps={() => ({
            className: tableStyles.cell,
            cellClassName,
          })}
          getTbodyProps={() => ({
            className: classnames(tableStyles.body),
          })}
          getPaginationProps={() => ({
            onClick: this.handleShowMoreClick
          })}
          {...other}
        />
      </div>
    )
  }
};

export const SmallTable = ({ headRowClassName, headerClassName, rowClassName, cellClassName, ...props }) => (
  <Table
    headerClassName={classnames(tableStyles.smallHeader, headerClassName)}
    headRowClassName={classnames(tableStyles.smallHeadRow, headRowClassName)}
    rowClassName={classnames(tableStyles.smallRow, rowClassName)}
    cellClassName={classnames(tableStyles.smallCell, cellClassName)}
    defaultMinWidth={60}
    {...props}
  />
);

export const DEFAULT_PAGE_SIZE = 20;