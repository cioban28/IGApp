import React from 'react';

// import Styles from 'components/mixins/Styles';

export default class Component extends React.Component {
  styles = [];

  get classes() {
    return this.style ? this.style.locals : null;
  }

  componentWillMount() {
    this.styles.forEach(style => style.use());
    this.style && this.style.use();
  }

  componentWillUnmount() {
    this.styles.forEach(style => style.unuse());
    this.style && this.style.unuse();
  }
}
