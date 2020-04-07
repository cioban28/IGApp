// Place this in App.js under all requires to log all requests to console

serverCommunication.wrapperServerRequest = serverCommunication.serverRequest;
serverCommunication.serverRequest = function () {
    console.log('Sending request ', arguments);
    return serverCommunication.wrapperServerRequest.apply(this, arguments);
}