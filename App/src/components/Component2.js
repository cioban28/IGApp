import React from 'react';
// import Styles from 'components/mixins/Styles';

export default class Component2 extends React.Component {
  styles = [];

  get classes() {
    return this.style ? this.style.locals : null;
  }

  componentWillMount() {
    this.style && this.style.use();
    this.styles.forEach(style => style.use());
  }

  componentWillUnmount() {
    this.style && this.style.unuse();
    this.styles.forEach(style => style.unuse());
  }
}