import config from 'components/utils/Configuration';
import q from 'q';
//SAFARI BUG FIX - no default fetch, need to use external library
import 'whatwg-fetch';
//SAFARI BUG FIX - no default promise, need to use external library
import Promise from 'promise-polyfill';
import {getProfile, getToken} from 'components/utils/AuthService';

if (!window.Promise) {
  window.Promise = Promise;
}

export default {

  serverRequest(httpFunc, route, body, region, planDate, withoutUID) {
    const deferred = q.defer();
    getProfile()
      .then((profile) => {
        let URL = window.location.protocol + '//' + window.location.hostname + (window.location.protocol === 'https:' ? '/api/' : ':' + config.port + '/') + route;
        if (profile && !withoutUID) {
          URL += '/' + profile.app_metadata.UID + '/';
        }
        if (region || planDate) {
          URL += '?';
        }
        if (region) {
          URL += 'region=' + region + '&';
        }
        if (planDate) {
          URL += 'planDate=' + planDate;
        }
        const options = {
          method: httpFunc,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getToken()
          },
          credentials: 'include'
        };
        if (body) {
          options.body = body;
        }
        fetch(encodeURI(URL), options)
          .then((response) => {
            if (response.status === 200 || response.ok) {
              deferred.resolve(response);
            }
            else {
              throw `Error ${response.status} - ${response.statusText}`;
            }
          })
          .catch((error) => {
            deferred.reject(error);
          });
      })
      .catch((error) => {
        deferred.reject(error);
      });

    return deferred.promise;
  }
};