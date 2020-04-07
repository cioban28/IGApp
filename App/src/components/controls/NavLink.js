import React from 'react';
import Component from 'components/Component';
import { Link } from 'react-router';

export default class NavLink extends Component {

  constructor(props){
    super(props)
  }

  render() {

    const {activeClassName, currentPath, pathToCheck, className, ...otherProps} = this.props;

    let classNameForLink = className;
    if(currentPath.startsWith(pathToCheck)) {
      classNameForLink += ' ' + activeClassName;
    }

    return <Link className={classNameForLink} {...otherProps} />;
  }
}