const qs = require('querystring');
const axios = require("axios");
const fs = require("fs");

// init methode, die die keycloak config ausliest!

var keycloakTargetURL = undefined;
var keycloakUser = undefined;
var keycloakUserPassword = undefined;
var keycloakClientID = undefined;
var keycloakClientSecret = undefined;
var keycloakRealm = undefined;

var initKeycloak = function (url, realm,
  clientID, user, password) {
  keycloakTargetURL = url;
  keycloakRealm = realm;
  keycloakClientID = clientID;
  keycloakUser = user;
  keycloakUserPassword = password;
};

const requestKeycloakToken = async function (url, realm,
  clientID, user, password) {

  initKeycloak(url, realm,
    clientID, user, password);

  var parameters = {
    "username": keycloakUser,
    "password": keycloakUserPassword,
    "client_id": keycloakClientID,
    "grant_type": "password"
  };

  var keycloakBearerTokenURL = keycloakTargetURL + "realms/" + keycloakRealm + "/protocol/openid-connect/token";

  const config = {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  return await axios.post(keycloakBearerTokenURL, qs.stringify(parameters), config)
    .then((response) => {
      /*
        {
            "access_token": "tokenString",
            "expires_in": 60,
            "refresh_expires_in": 1800,
            "refresh_token": "tokenString",
            "token_type": "bearer",
            "not-before-policy": 0,
            "session_state": "5d9d8418-be24-4641-a47c-3309bb243d8d",
            "scope": "email profile"
        }
      */
      return response.data["access_token"];
    })
    .catch((error) => {
      // called asynchronously if an error occurs
      // or server returns response with an error status.
      //$scope.error = response.statusText;
      console.error("Error while requesting auth bearer token from keycloak. Error is: \n" + error);
      throw error;
    })
};

const getKeycloakAxiosConfig = async function (url, realm,
  clientID, user, password) {

  var config = {
    headers: {}
  };

  // get bearer token and make auth header
  var bearerToken = await requestKeycloakToken(url, realm,
    clientID, user, password);

  config.headers = {
    'Authorization': 'Bearer ' + bearerToken
  }

  return config;
};

exports.requestKeycloakToken = requestKeycloakToken;
exports.getKeycloakAxiosConfig = getKeycloakAxiosConfig;