import React from 'react';
import Component from 'components/Component';
import style from 'styles/plan/plan-loading.css';
import Page from 'components/Page';

export default class PlanLoading extends Component {

  style = style;

  static defaultProps = {
    totalTime: 12000,
    interval: 100,
    showPopup: false
  };

  constructor(props) {
    super(props);
    this.state = {
      passedMilliseconds: 0
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.showPopup === true && this.props.showPopup === false) {
      this.setState({passedMilliseconds: 0});
      const timer = setInterval(() => {
        this.setState({passedMilliseconds: this.state.passedMilliseconds + this.props.interval});
        if (this.state.passedMilliseconds >= this.props.totalTime) {
          clearInterval(timer);
          setTimeout(() => {
            this.props.close();
          }, 500);
        }
      }, this.props.interval);
    }
  }

  render() {
    const steps = [
      'Aggregating company data',
      'Setting Channels',
      'Setting budgets',
      'Setting timeline',
      'Optimizing budget'
    ];
    const subtitles = [
      'Checking company’s profile',
      'Checking product pricing',
      'Checking target audience preferences',
      'Checking revenue metrics',
      'Checking social media performance',
      'Checking lead funnel',
      'Checking pipeline',
      'Checking SEO data',
      'Checking web traffic data',
      'Checking financial metrics',
      'Checking direct competitors',
      'Checking broad competition',
      'Benchmarking online channels',
      'Benchmarking offline channels',
      'Checking objectives',
      'Checking channels’ constraints',
      'Adding insights from ' + Math.floor((Math.random() * 115) + 15) + ' experts',
      'Clustering',
      'Checking data warehouse',
      'Classifying data sets',
      'Analyze route num 1',
      'Checking forecasting for route num 1',
      'Analyze route num 2',
      'Checking forecasting for route num 2',
      'Analyze route num 3',
      'Checking forecasting for route num 3',
      'Analyze route num 4',
      'Checking forecasting for route num 4',
      'Analyze route num 5',
      'Checking forecasting for route num 5',
      'Analyze route num 6',
      'Checking forecasting for route num 6',
      'Finding optimal route',
      'Get',
      'Set',
      'Go'
    ];
    const stepRows = steps.map((step, index) =>
      <div className={this.classes.stepRow} key={index}>
        <div className={this.classes.stepText}>
          {step}
        </div>
        <div className={this.classes.stepCheck} hidden={this.state.passedMilliseconds <= this.props.totalTime / steps.length * (index+1)}/>
      </div>
    );
    return <div hidden={!this.props.showPopup}>
      <Page popup={ true } width={'850px'}>
        <img className={this.classes.ldSpinFast} src="/icons/logo-for-spin.png"/>
        <div className={this.classes.title}>
          One sec while the platform crunches some numbers…
        </div>
        <div className={this.classes.subtitleRow}>
          <div className={this.classes.smallGif}/>
          <div className={this.classes.subtitle}>
            {subtitles[Math.floor(this.state.passedMilliseconds / (this.props.totalTime / (subtitles.length-1)))]}
          </div>
        </div>
        <div className={this.classes.loadingBar}>
          <div className={this.classes.loadingBarFill} style={{width: this.state.passedMilliseconds / this.props.totalTime * 420 + 'px'}}/>
        </div>
        {stepRows}
      </Page>
    </div>
  }
}