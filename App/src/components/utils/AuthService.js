import auth0 from 'auth0-js';
import history from 'history';
import config from 'components/utils/Configuration';
import q from 'q';
import {getParameterByName} from 'utils';
import randomstring from 'randomstring';

const state = randomstring.generate();

const CONNECTION_TYPE = 'Username-Password-Authentication';
const options = {
  responseType: 'token',
  clientID: config.authClientId,
  domain: config.authDomain,
  redirectUri: window.location.origin,
  state: state
};
const webAuth = new auth0.WebAuth(options);

export function login(email, password, callback) {
  localStorage.setItem('state', state);
  webAuth.login({email: email, password: password}, callback);
}

export function passwordReset(email, callback) {
  webAuth.changePassword({email: email, connection: CONNECTION_TYPE}, callback);
}

export function signup(email, password, callback) {
  webAuth.signup({email: email, password: password, connection: CONNECTION_TYPE}, callback);
}

export function crossOriginVerification() {
  webAuth.crossOriginVerification();
}

export function handleAuthentication(nextState, replace, callback) {
  const error = getParameterByName('error_description');
  if (error) {
    alert(error);
    history.push('/');
  }

  const hash = window.location.hash;
  if (hash) {
    webAuth.parseHash({hash: hash, state: localStorage.getItem('state')}, function (err, authResult) {
      if (authResult && authResult.accessToken && authResult.idToken) {
        setSession(authResult);
        history.push('/');
      }
      else {
        if (err) {
          console.log(err);
        }
        // navigate to the home route
        history.push('/');
      }
    });
  }
  else {
    callback();
  }
}

function setSession(authResult) {
  // Set the time that the access token will expire at
  let expiresAt = JSON.stringify((authResult.expiresIn * 1000) + new Date().getTime());
  localStorage.setItem('access_token', authResult.accessToken);
  localStorage.setItem('id_token', authResult.idToken);
  localStorage.setItem('expires_at', expiresAt);
  getProfile({reset: true})
    .then((profile) => {
      localStorage.setItem('profile', JSON.stringify(profile));
    })
    .catch((err) => {
      console.log('error while loading profile', err);
    });

  // navigate to the home route
  history.push('/');
}

export function getToken() {
  // Retrieves the user token from local storage
  return localStorage.getItem('id_token');
}

export function isAuthenticated() {
  // Check whether the current time is past the
  // access token's expiry time
  let expiresAt = JSON.parse(localStorage.getItem('expires_at'));
  return new Date().getTime() < expiresAt;
}

export function logout() {
  // Clear access token and ID token from local storage
  localStorage.removeItem('access_token');
  localStorage.removeItem('id_token');
  localStorage.removeItem('expires_at');
  localStorage.removeItem('profile');
  // navigate to the home route
  history.push('/');
}

function getAccessToken() {
  const accessToken = localStorage.getItem('access_token');
  if (!accessToken) {
    throw new Error('No Access Token found');
  }
  return accessToken;
}

export function getProfile(opts = {}) {
  const deferred = q.defer();
  const userProfile = opts.reset ? null : getProfileSync();
  if (userProfile && Object.keys(userProfile).length > 0) {
    deferred.resolve(userProfile);
  }
  else {
    const accessToken = getAccessToken();
    webAuth.client.userInfo(accessToken, (err, profile) => {
      if (err) {
        deferred.reject(err);
      }
      else if (profile) {
        deferred.resolve(profile);
      }
    });
  }
  return deferred.promise;
}

export function getProfileSync() {
  const profile = localStorage.getItem('profile');
  return profile ? JSON.parse(profile) : {};
}