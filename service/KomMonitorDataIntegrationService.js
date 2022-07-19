'use strict';

 // axios os used to execute HTTP requests in a Promise-based manner
 const axios = require("axios");

 let KommonitorHarvesterApi = require("kommonitorHarvesterApi");

 const keycloakHelper = require("kommonitor-keycloak-helper");

 let UtilHelper = require('../utils/UtilHelper');

 const configureConfigObject = async function(authenticationType){
  let config = {
    headers: {}
  };

  if(authenticationType.type == KommonitorHarvesterApi.AuthenticationType.TypeEnum.KEYCLOAK){
    /*
      "authentication": {
        "type": "KEYCLOAK",
        "username": "string",
        "password": "string",
        "keycloakUrl": "string",
        "keycloakRealm": "string",
        "keycloakClientId": "string"
      }
    */
      keycloakHelper.initKeycloakHelper(authenticationType.keycloakUrl, authenticationType.keycloakRealm, authenticationType.keycloakClientId, undefined, authenticationType.username, authenticationType.password, process.env.KOMMONITOR_ADMIN_ROLENAME);

    config = await keycloakHelper.requestAccessToken();
  }
  return config;
 };

/**
 * send request against KomMonitor DataManagement API to update spatial unit according to id
 *
 * baseUrlPath String starting URL path of running KomMonitor DataManagement API instance. It has to be appended with the path to fetch spatial unit
 * spatialUnitId String unique identifier of the spatial unit
 * targetDate String targetDate according to pattern YEAR-MONTH-DAY, whereas month and day may take values between 1-12 and 1-31 respectively
 *
 * 
 **/
exports.integrateSpatialUnitById = async function(baseUrlPath, spatialUnitId, geojsonString, periodOfValidityType, authenticationType) {
  console.log("integrating spatial unit into KomMonitor data management API with basepath " + baseUrlPath + " for id " + spatialUnitId);

  let config = configureConfigObject(authenticationType);
  config.headers["Content-Type"] = "application/json";
  config.maxContentLength = Infinity;
  config.maxBodyLength = Infinity;

  let body = {
    "geoJsonString": geojsonString,
    "periodOfValidity": {
      "endDate": periodOfValidityType.validEndDate,
      "startDate": periodOfValidityType.validStartDate
    },
    "isPartialUpdate": true // mark import as partial 
  };

  //PUT /spatial-units/{spatialUnitId}
  return await axios.put(baseUrlPath + "/spatial-units/" + spatialUnitId, body, config)
    .then(response => {
        return true;     
    })
    .catch(error => {
      throw error;
    });
}


/**
 * send request against KomMonitor DataManagement API to update indicator according to id
 *
 * baseUrlPath String starting URL path of running KomMonitor DataManagement API instance. It has to be appended with the path to fetch indicator
 * indicatorId String unique identifier of the indicator
 * targetIndicatorMetadata Object indicator metadata
 *
 **/
exports.integrateIndicatorById = async function(baseUrlPath, indicatorId, targetIndicatorMetadata, targetSpatialUnitMetadata, indicatorValues, authenticationType) {
  console.log("integrating indicator into KomMonitor data management API with basepath " + baseUrlPath + " for id " + indicatorId + " and targetSpatialUnitId " + targetSpatialUnitMetadata.spatialUnitId);

  let config = configureConfigObject(authenticationType);
  config.headers["Content-Type"] = "application/json";
  config.maxContentLength = Infinity;
  config.maxBodyLength = Infinity;

  let body = {
    "allowedRoles": targetIndicatorMetadata.allowedRoles,
    "applicableSpatialUnit": targetSpatialUnitMetadata.spatialUnitLevel,
    "defaultClassificationMapping": targetIndicatorMetadata.defaultClassificationMapping,
    "indicatorValues": indicatorValues
  };

  //PUT /indicators/{indicatorId}/
  return await axios.put(baseUrlPath + "/indicators/" + indicatorId, body, config)
    .then(response => {

      return true;
    })
    .catch(error => {
      console.log("Error when fetching indicator. Error was: " + error);
      
      throw error;
    });
}