import React from 'react';
import PropTypes from 'prop-types';
import Component from 'components/Component';
import Page from 'components/Page';
import Title from 'components/onboarding/Title';
import style from 'styles/campaigns/choose-existing-template.css';
import Button from 'components/controls/Button';

export default class PopupFrame extends Component {

  style = style;

  static propTypes = {
    title: PropTypes.string,
    children: PropTypes.node.isRequired,
    secondaryClick: PropTypes.func.isRequired,
    primaryClick: PropTypes.func.isRequired,
    secondaryButtonText: PropTypes.string,
    primaryButtonText: PropTypes.string
  };

  static defaultProps = {
    title: '',
    secondaryButtonText: 'Cancel',
    primaryButtonText: 'Done'
  };

  render() {
    return <div>
      <Page popup={true} width={'875px'} contentClassName={this.classes.pageContent}>
        <div className={this.classes.content}>
          <Title title={this.props.title}/>
        </div>
        <div className={this.classes.inner}>
          {this.props.children}
        </div>
        <div className={this.classes.bottom}>
          <Button type="secondary" style={{marginRight: '14px', marginTop: '7px'}} onClick={this.props.secondaryClick}>
            {this.props.secondaryButtonText}
          </Button>
          <Button type="primary" style={{marginRight: '14px', marginTop: '7px'}} onClick={this.props.primaryClick}>
            {this.props.primaryButtonText}
          </Button>
        </div>
      </Page>
    </div>;
  }
}