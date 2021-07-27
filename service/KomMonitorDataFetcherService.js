'use strict';

 // axios os used to execute HTTP requests in a Promise-based manner
 const axios = require("axios");

 const encryptionHelper = require("./EncryptionHelperService");
 const keycloakHelper = require("./KeycloakHelperService");
 let KommonitorHarvesterApi = require('kommonitorHarvesterApi');

 const simplifyGeometryParameterName = process.env.GEOMETRY_SIMPLIFICATION_PARAMETER_NAME;
 const simplifyGeometryParameterValue = process.env.GEOMETRY_SIMPLIFICATION_PARAMETER_VALUE;
 const simplifyGeometriesParameterQueryString = simplifyGeometryParameterName + "=" + simplifyGeometryParameterValue;

/**
 * send request against KomMonitor DataManagement API to fetch spatial unit according to id
 *
 * baseUrlPath String starting URL path of running KomMonitor DataManagement API instance. It has to be appended with the path to fetch spatial unit
 * spatialUnitId String unique identifier of the spatial unit
 * targetDate String targetDate according to pattern YEAR-MONTH-DAY, whereas month and day may take values between 1-12 and 1-31 respectively
 *
 * returns spatial unit as GeoJSON string
 **/
exports.fetchSpatialUnitById = async function(baseUrlPath, spatialUnitId, authenticationType) {
  console.log("fetching spatial unit from KomMonitor data management API with basepath " + baseUrlPath + " for id " + spatialUnitId);

  var config = await keycloakHelper.getKeycloakAxiosConfig(authenticationType);

  // if no auth is used then we must use public endpoint
  baseUrlPath = checkForPublicOrProtectedEndpoint(authenticationType, baseUrlPath);

  //GET /spatial-units/{spatialUnitId}/allFeatures
  return await axios.get(baseUrlPath + "/spatial-units/" + spatialUnitId + "/allFeatures?" + simplifyGeometriesParameterQueryString, config)
    .then(response => {
      // response.data should be the respective GeoJSON as String
      response = encryptionHelper.decryptAPIResponseIfRequired(response);
      return response.data;
    })
    .catch(error => {
      console.log("Error when fetching spatial unit. Error was: " + error);
      throw error;
    });
}


/**
 * send request against KomMonitor DataManagement API to fetch georesource according to id
 *
 * baseUrlPath String starting URL path of running KomMonitor DataManagement API instance. It has to be appended with the path to fetch georesource
 * georesourceId String unique identifier of the georesource
 * targetDate String targetDate according to pattern YEAR-MONTH-DAY, whereas month and day may take values between 1-12 and 1-31 respectively
 *
 * returns georesource as GeoJSON string
 **/
exports.fetchGeoresourceById = async function(baseUrlPath, georesourceId, authenticationType) {
  console.log("fetching georesource from KomMonitor data management API with basepath " + baseUrlPath + " for id " + georesourceId);

  var config = await keycloakHelper.getKeycloakAxiosConfig(authenticationType);

  // if no auth is used then we must use public endpoint
  baseUrlPath = checkForPublicOrProtectedEndpoint(authenticationType, baseUrlPath);

  //GET /georesources/{georesouceId}/allFeatures
  return await axios.get(baseUrlPath + "/georesources/" + georesourceId + "/allFeatures?" + simplifyGeometriesParameterQueryString, config)
    .then(response => {
      // response.data should be the respective GeoJSON as String
      response = encryptionHelper.decryptAPIResponseIfRequired(response);
      return response.data;
    })
    .catch(error => {
      console.log("Error when fetching georesource. Error was: " + error);
      throw error;
      
    });
};


/**
 * send request against KomMonitor DataManagement API to fetch indicator according to id
 *
 * baseUrlPath String starting URL path of running KomMonitor DataManagement API instance. It has to be appended with the path to fetch indicator
 * indicatorId String unique identifier of the indicator
 * targetDate String targetDate according to pattern YEAR-MONTH-DAY, whereas month and day may take values between 1-12 and 1-31 respectively
 * targetSpatialUnitId String unique identifier of the target spatial unit
 *
 * returns indicator as GeoJSON string
 **/
exports.fetchIndicatorById = async function(baseUrlPath, indicatorId, targetSpatialUnitId, authenticationType) {
  console.log("fetching indicator from KomMonitor data management API with basepath " + baseUrlPath + " for id " + indicatorId + " and targetSpatialUnitId " + targetSpatialUnitId);

  var config = await keycloakHelper.getKeycloakAxiosConfig(authenticationType);

  // if no auth is used then we must use public endpoint
  baseUrlPath = checkForPublicOrProtectedEndpoint(authenticationType, baseUrlPath);

  //GET /indicators/{indicatorId}/{targetSpatialUnitId}/allFeatures
  return await axios.get(baseUrlPath + "/indicators/" + indicatorId + "/" + targetSpatialUnitId + "/allFeatures?" + simplifyGeometriesParameterQueryString, config)
    .then(response => {
      // response.data should be the respective GeoJSON as String
      response = encryptionHelper.decryptAPIResponseIfRequired(response);
      return response.data;
    })
    .catch(error => {
      console.log("Error when fetching indicator. Error was: " + error);
      throw error;
    });
}

function checkForPublicOrProtectedEndpoint(authenticationType, baseUrlPath) {
  if (authenticationType.type == KommonitorHarvesterApi.AuthenticationType.TypeEnum.NONE) {
    return baseUrlPath + "/public";
  }
  return baseUrlPath;
}
