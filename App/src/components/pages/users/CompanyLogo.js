import React, {Component, Fragment} from 'react';
import PropTypes from 'prop-types';

export default class CompanyLogo extends Component {

  constructor(props) {
    super(props);
    this.state = {
      loaded: false
    }
  }

  static propTypes = {
    src: PropTypes.string,
    className: PropTypes.string
  }

  componentDidMount() {
    const {src} = this.props;
    src && this.loadImage(src);
  }

  componentWillUnmount() {
    if (this.image) {
      this.image.onload = () => {};
      this.image.onerror = () => {};
    }
  }

  componentDidUpdate(prevProps) {
    const {src} = this.props;
    if (prevProps.src !== src) {
      src && this.loadImage(src);
    }
  }

  loadImage = (src) => {
    const image = new Image();
    image.src = src;
    image.onload = () => {
      this.setState({ loaded: true });
    }
    image.onerror = () => {
      this.setState({ loaded: false });
    }
    this.image = image;
  }

  render() {
    const {src, className} = this.props;
    const {loaded} = this.state;

    return (
      <Fragment>
      {
        loaded ?
        <div
          className={className}
          style={{
            backgroundImage: `url(${src})`
          }}
        />
        :
        <div
          className={className}
          style={{
            backgroundImage: 'url(/assets/organization.svg)',
            backgroundSize: '40% 70%'
          }}
        />
      }
      </Fragment>
    );
  }
}
