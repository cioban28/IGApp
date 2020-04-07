import React from 'react';
import Component from 'components/Component';
import SignInForm from 'components/pages/signIn/SignInForm';
import {login} from 'components/utils/AuthService';
import history from 'history';

export default class Login extends Component {

  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: '',
      error: undefined
    };
  }

  inputValueChanged = (key, value) => {
    const state = {...state};
    state[key] = value;
    this.setState(state);
  };

  render() {

    return <div>
      <SignInForm title='Welcome back!'
                  buttonAction={() => {
                    this.setState({error: undefined});

                    login(this.state.email, this.state.password, (error) => {
                      if (error) {
                        this.setState({error: error.description});
                      }
                    });
                  }}
                  buttonText='Sign in'
                  buttonDisabled={false}
                  inputValueChanged={this.inputValueChanged}
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
                  bottomComponent={
                    <div onClick={() => history.push('/forgotPassword')}>Forgot your password? Send yourself a new
                      one.</div>
                  }
                  error={this.state.error}
      />
    </div>;
  }
}