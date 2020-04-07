import React from 'react';
import Component from 'components/Component';
import onboardingStyle from 'styles/onboarding/onboarding.css';
import tagsStyle from 'styles/tags.css';
import style from 'styles/signin/signin.css';
import history from 'history';
import serverCommunication from 'data/serverCommunication';
import {isPopupMode, disablePopupMode, checkIfPopup} from 'modules/popup-mode';
import {isAuthenticated, login, getProfile} from 'components/utils/AuthService';
import {getParameterByName} from 'utils';

export default class SignIn extends Component {

  style = style;
  styles = [onboardingStyle, tagsStyle];

  //passLength = 8
  pattern = '(?=.*[1-9])(?=.*[a-z])(?=.*[A-Z]).{8,}';
  /*
   state = {
   login: true
   }*/
  constructor(props) {
    super(props);
    this.state = {login: true};
    this.handleChange = this.handleChange.bind(this);
    this.checkUserAuthorization = this.checkUserAuthorization.bind(this);
  }

  componentDidMount() {
    if (isAuthenticated()) {
      getProfile()
        .then((profile) => {
          if (profile && profile.app_metadata) {
            checkIfPopup()
              .then((popup) => {
                // No user Account
                if (popup === null) {
                  history.push({
                    pathname: '/settings/account',
                    query: {new: true, freePlan: !!profile.app_metadata.freePlan}
                  });
                }
                else if (profile.app_metadata && !profile.app_metadata.isAdmin) {
                  history.push('/campaigns/by-channel');
                }
                else {
                  if (popup) {
                    history.push('/settings/account');
                  }
                  else {
                    history.push('/dashboard/CMO');
                  }
                }
              })
              .catch((err) => {
                console.log(err);
                history.push('/login')
              });
          }
        })
        .catch((err) => {
          console.log(err);
          history.push('/login')
        });
    }
    else {
      history.push('/login')
    }
  }

  handleChange(parameter, event) {
    let update = {};
    update[parameter] = event.target.value;
    this.setState(update);
  }

  checkUserAuthorization(e) {
    e.preventDefault();
    let route = this.state.login ? 'login' : 'signup';
    var self = this;
    self.setState({isSignupError: false, isPromotionError: false});
    serverCommunication.serverRequest('POST', route, JSON.stringify({
      email: self.state.email,
      password: self.state.password,
      promotionCode: self.state.promotionCode
    }))
      .then((response) => {
        if (response.ok) {
          response.json()
            .then(function (data) {
              if (data) {
                checkIfPopup()
                  .then(function (data) {
                    if (route == 'login' && !data) {
                      history.push('/plan/annual');
                    }
                    else {
                      history.push('/settings');
                    }
                  });
              }
              else {
                if (route == 'login') {
                  self.setState({isLoginError: !data});
                  self.refs.loginEmailInput.focus();
                }
                else {
                  self.setState({isSignupError: !data});
                  self.refs.signupEmailInput.focus();
                }
              }
            })
            .catch(function (err) {
              console.log(err);
            });
        }
        else {
          if (response.status == 500) {
            self.setState({isPromotionError: true});
            self.refs.signupPromotionInput.focus();
          }
          else if (response.status == 409) {
            self.setState({isSignupError: true});
            self.refs.signupEmailInput.focus();
          }
        }
      })
      .catch(function (err) {
        console.log(err);
      });
  }

  render() {
    return <div>
      {/**   <Header user={ false } />
       <Page sidebar={ false } width="600px" centered>
       <Title title="InfiniGrow" />
       <div className={ this.classes.switchButtons }>
       <Button type={ this.state.login ? 'accent' : 'normal' } style={{
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            width: '80px'
          }} onClick={() => {
            this.setState({
              login: true
            });
          }}>Login</Button>
       <Button type={ this.state.login ? 'normal' : 'accent' } style={{
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            width: '80px'
          }} onClick={() => {
            this.setState({
              login: false
            });
          }}>Sign Up</Button>
       </div>
       <div className={ this.classes.item } hidden={ !this.state.login }>
       <form onSubmit={ this.checkUserAuthorization } >
       <h2>Login</h2>

       <div className={ onboardingStyle.locals.row }>
       <div className={ this.classes.colsCell }>
       <Label className={ this.classes.textLabel }>Email</Label>
       <Textfield type="email" required ref="loginEmailInput" defaultValue="" className={ this.classes.rightCol } onChange={ this.handleChange.bind(this, 'email')}/>
       </div>
       </div>

       <div className={ onboardingStyle.locals.row }>
       <div className={ this.classes.colsCell }>
       <Label className={ this.classes.textLabel } question={['']} description={['Password must contain a minimum of 1 lower case letter, 1 upper case letter, 1 numeric character, and at least 8 characters.']}>Password</Label>
       <Textfield type="password" required pattern={ this.pattern } defaultValue="" className={ this.classes.rightCol } onChange={ this.handleChange.bind(this, 'password')} />
       </div>
       </div>
       <div className={ onboardingStyle.locals.row }>
       <div className={ this.classes.colsCell }>
       <div className={ this.classes.leftCol }></div>
       <div className={ this.classes.enterCol }>
       <button className={ this.classes.primary2 } type="submit" >Login</button>
       <label hidden={ !this.state.isLoginError} style={{ color: 'red' }}>Wrong email or password</label>
       </div>
       </div>
       </div>
       </form>
       </div>
       <div className={ this.classes.item } hidden={ this.state.login }>
       <form onSubmit={ this.checkUserAuthorization } >
       <h2>Sign up</h2>

       <div className={ onboardingStyle.locals.row }>
       <div className={ this.classes.colsCell }>
       <Label className={ this.classes.textLabel }>Email</Label>
       <Textfield type="email" required ref="signupEmailInput" defaultValue="" className={ this.classes.rightCol } onChange={ this.handleChange.bind(this, 'email')} />
       </div>
       </div>
       <div className={ onboardingStyle.locals.row }>
       <div className={ this.classes.colsCell }>
       <Label className={ this.classes.textLabel } question={['']} description={['Password must contain a minimum of 1 lower case letter, 1 upper case letter, 1 numeric character, and at least 8 characters.']}>Password</Label>
       <Textfield type="password" required defaultValue="" pattern={ this.pattern } className={ this.classes.rightCol } onChange={ this.handleChange.bind(this, 'password')} />
       </div>
       </div>
       <div className={ onboardingStyle.locals.row }>
       <div className={ this.classes.colsCell }>
       <Label className={ this.classes.textLabel }>Access Code</Label>
       <Textfield ref="signupPromotionInput" type="text" required defaultValue="" className={ this.classes.rightCol } onChange={ this.handleChange.bind(this, 'promotionCode')} />
       </div>
       </div>

       <div className={ onboardingStyle.locals.row }>
       <div className={ this.classes.colsCell }>
       <div className={ this.classes.leftCol }></div>
       <div className={ this.classes.enterCol }>
       <button className={ this.classes.primary2 } type="submit" >Sign up</button>
       <label hidden={ !this.state.isSignupError} style={{ color: 'red' }}>Email already exists</label>
       <label hidden={ !this.state.isPromotionError} style={{ color: 'red' }}>Promotion code doesn't exists</label>
       </div>
       </div>
       </div>
       </form>
       </div>
       </Page>**/}
    </div>;
  }
}