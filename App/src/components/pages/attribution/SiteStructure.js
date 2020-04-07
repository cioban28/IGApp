import React from 'react';
import Component from 'components/Component';
import style from 'styles/onboarding/onboarding.css';
import Label from 'components/ControlsLabel';
import Textfield from 'components/controls/Textfield';
import SaveButton from 'components/pages/profile/SaveButton';

export default class Setup extends Component {

  style = style;

  constructor(props) {
    super(props);
    this.state = {
    };
  };

  handleChange(type, event) {
    let update = this.props.siteStructure || {};
    update[type] = event.target.value;
    this.props.updateState({'siteStructure': update});
  }

  render() {
    let {siteStructure} = this.props;
    siteStructure = siteStructure || {};
    const {homepage, pricing, blog, caseStudies, contact, aboutUs, presentations, eBooks, whitepapers, videos, landingPages} = siteStructure;
    const labelStyle = {width: '110px', marginTop: '12px', textTransform: 'capitalize'};

    return <div>
      <div className={ this.classes.cell }>
        <Label style={labelStyle}>Homepage</Label>
        <Textfield
          value={homepage}
          onChange={ this.handleChange.bind(this, 'homepage') }
          style={{ width: '300px'}}
        />
      </div>
      <div className={ this.classes.cell }>
        <Label style={labelStyle}>Pricing</Label>
        <Textfield
          value={pricing}
          onChange={ this.handleChange.bind(this, 'pricing') }
          style={{ width: '300px'}}
        />
      </div>
      <div className={ this.classes.cell }>
        <Label style={labelStyle}>Blog</Label>
        <Textfield
          value={blog}
          onChange={ this.handleChange.bind(this, 'blog') }
          style={{ width: '300px'}}
        />
      </div>
      <div className={ this.classes.cell }>
        <Label style={labelStyle}>Case-studies</Label>
        <Textfield
          value={caseStudies}
          onChange={ this.handleChange.bind(this, 'caseStudies') }
          style={{ width: '300px'}}
        />
      </div>
      <div className={ this.classes.cell }>
        <Label style={labelStyle}>Contact us</Label>
        <Textfield
          value={contact}
          onChange={ this.handleChange.bind(this, 'contact') }
          style={{ width: '300px'}}
        />
      </div>
      <div className={ this.classes.cell }>
        <Label style={labelStyle}>About us</Label>
        <Textfield
          value={aboutUs}
          onChange={ this.handleChange.bind(this, 'aboutUs') }
          style={{ width: '300px'}}
        />
      </div>
      <div className={ this.classes.cell }>
        <Label style={labelStyle}>Presentations</Label>
        <Textfield
          value={presentations}
          onChange={ this.handleChange.bind(this, 'presentations') }
          style={{ width: '300px'}}
        />
      </div>
      <div className={ this.classes.cell }>
        <Label style={labelStyle}>E-books</Label>
        <Textfield
          value={eBooks}
          onChange={ this.handleChange.bind(this, 'eBooks') }
          style={{ width: '300px'}}
        />
      </div>
      <div className={ this.classes.cell }>
        <Label style={labelStyle}>Whitepapers</Label>
        <Textfield
          value={whitepapers}
          onChange={ this.handleChange.bind(this, 'whitepapers') }
          style={{ width: '300px'}}
        />
      </div>
      <div className={ this.classes.cell }>
        <Label style={labelStyle}>Videos</Label>
        <Textfield
          value={videos}
          onChange={ this.handleChange.bind(this, 'videos') }
          style={{ width: '300px'}}
        />
      </div>
      <div className={ this.classes.cell }>
        <Label style={labelStyle}>Landing Pages</Label>
        <Textfield
          value={landingPages}
          onChange={ this.handleChange.bind(this, 'landingPages') }
          style={{ width: '300px'}}
        />
      </div>
      <div style={{ marginLeft: '272px', marginTop: '12px' }}>
        <SaveButton onClick={() => {
          this.setState({saveFail: false, saveSuccess: false});
          this.props.updateUserMonthPlan({'siteStructure': siteStructure}, this.props.region, this.props.planDate);
          this.setState({saveSuccess: true});
        }} success={ this.state.saveSuccess } fail={ this.state.saveFail }/>
      </div>
    </div>
  }
}