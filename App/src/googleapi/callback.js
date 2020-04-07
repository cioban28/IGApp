function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}
$(document).ready(function () {

  let code = getParameterByName('code');
  if (!code) {
    code = getParameterByName('oauth_verifier');
  }
  localStorage.setItem('code', code);
  window.close();
});