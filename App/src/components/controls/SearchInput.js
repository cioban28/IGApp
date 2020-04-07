import React from 'react';
import PropTypes from 'prop-types';
import debounce from 'lodash/debounce';
import Component from 'components/Component';
import style from 'styles/controls/search-input.css';

const classes = style.locals;

class SearchInput extends Component {
  style = style;

  static propTypes = {
    defaultValue: PropTypes.string,
    onSearch: PropTypes.func.isRequired,
    debounce: PropTypes.number,
  };

  static defaultProps = {
    defaultValue: '',
    debounce: 300,
  }

  state = {
    search: this.props.defaultValue,
  };

  componentDidUpdate(_, {search: oldSearch}) {
    const {search} = this.state;

    if (search !== oldSearch) {
      this.handleSearch(search);
    }
  }

  handleSearch = debounce((value) => this.props.onSearch(value.toLowerCase()), this.props.debounce);
  handleSearchQueryChange = ({target: {value: search}}) => this.setState({search});
  handleSearchQueryClear = () => this.setState({search: ''});

  render() {
    const { search } = this.state;

    return (
      <label className={classes.search}>
        <div className={classes.searchIcon}/>
        <input
          className={classes.searchInput}
          value={search}
          onChange={this.handleSearchQueryChange}
        />
        <div className={classes.searchClear} onClick={this.handleSearchQueryClear}/>
      </label>
    )
  }
}

export default SearchInput
