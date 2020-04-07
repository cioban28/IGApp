import merge from 'lodash/merge';

const config = {
  default: {
    authClientId: 'En6sYxyCeCWBwHSORHGxVfBoNjWWp41c',
    authDomain: 'infinigrow-test.auth0.com',
    port: 8443,
    sendEvents: false
  },
  "app.infinigrow.com": {
    authClientId: 'ZPLaIfv_lyA2N5PghXNjWSjah6aE1y9e',
    authDomain: 'infinigrow.auth0.com',
    sendEvents: true
  },
  "www.infiqa.com": {
    sendEvents: true
  }
};

export default merge(config.default, config[window.location.hostname]);