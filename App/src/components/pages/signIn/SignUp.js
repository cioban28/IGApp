import React from 'react';
import Component from 'components/Component';
import SignInForm from 'components/pages/signIn/SignInForm';
import {signup} from 'components/utils/AuthService';
import history from 'history';

export default class SignUp extends Component {

  constructor(props) {
    super(props);

    this.state = {
      email: this.props.location.query.email || '',
      password: '',
      acceptedTerms: false,
      error: undefined
    };
  }

  checkboxChanged = (index) => {
    if (index === 0) {
      this.setState({
        acceptedTerms: !this.state.acceptedTerms
      });
    }
  };

  inputValueChanged = (key, value) => {
    const state = {...state};
    state[key] = value;
    this.setState(state);
  };

  render() {
    return <SignInForm title='Create an account with InfiniGrow'
                       subTitle="Join the leading B2B SaaS marketing organizations already using InfiniGrow to hit their KPIs."
                       buttonAction={() => {
                         this.setState({
                           error: undefined
                         });

                         signup(this.state.email, this.state.password, (error) => {
                           if (error) {
                             if (error.name === 'PasswordStrengthError') {
                               this.setState({
                                 error: 'Incorrect Password Format, password should be: \n' +
                                   error.policy
                               });
                             }
                             else {
                               this.setState({error: error.description});
                             }
                           }
                           else {
                             alert('User created successfully!');
                           }
                         });
                       }}
                       inputs={[
                         {
                           label: 'Work email',
                           key: 'email',
                           placeHolder: 'Email',
                           type: 'email',
                           value: this.state.email
                         },
                         {
                           label: 'Password',
                           key: 'password',
                           placeHolder: 'Password',
                           type: 'password',
                           value: this.state.password
                         }
                       ]}
                       inputValueChanged={this.inputValueChanged}
                       buttonText='Create Account'
                       checkboxes={
                         [
                           <div>Accept our <a href="http://infinigrow.com/terms/">Terms and
                             Privacy Policy</a>
                           </div>,
                           <div>Request a demo</div>
                         ]}
                       checkboxChanged={this.checkboxChanged}
                       buttonDisabled={!this.state.acceptedTerms}
                       bottomComponent={<div onClick={() => history.push('/login')}>
                         Already using InfiniGrow? Log in here →</div>}
                       error={this.state.error}
    />;
  }
}