import serverCommunication from 'data/serverCommunication';
import q from 'q';

export function isPopupMode() {
  return localStorage.getItem('popup') == "true";
}

export function temporaryEnablePopupMode() {
  return localStorage.setItem('popup', true);
}

export function disablePopupMode() {
  var deferred = q.defer();
  serverCommunication.serverRequest('PUT', 'useraccount', JSON.stringify({onboarding: false}))
    .then((response) => {
      response.json()
        .then(function (data) {
          if (data){
            localStorage.setItem('popup', false);
            deferred.resolve(false);
          }
        })
    })
    .catch(function (err) {
      deferred.reject(err);
    });
  return deferred.promise;
}

export function checkIfPopup () {
  var deferred = q.defer();
  serverCommunication.serverRequest('GET', 'useraccount')
    .then((response) => {
      response.json()
        .then(function (data) {
          if (data){
            localStorage.setItem('popup', data.onboarding);
            deferred.resolve(data.onboarding);
          }
          else {
            localStorage.setItem('popup', true);
            deferred.resolve(null);
          }
        })
        .catch(function (err) {
          deferred.reject(err);
        });
    })
    .catch(function (err) {
      deferred.reject(err);
    });
  return deferred.promise;
}