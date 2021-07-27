'use strict';

 // axios os used to execute HTTP requests in a Promise-based manner
 const axios = require("axios");
const { SpatialUnitSummaryType } = require("../datamodel/model/SpatialUnitSummaryType");
const { SummaryTypeErrorsOccurred } = require("../datamodel/model/SummaryTypeErrorsOccurred");
const { IndicatorSpatialUnitMappingResultType } = require('../datamodel/model/IndicatorSpatialUnitMappingResultType');

 const keycloakHelper = require("./KeycloakHelperService");
 require('../datamodel/model/PeriodOfValidityType');

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
  console.log("fetching spatial unit from KomMonitor data management API for id " + spatialUnitId);

  var config = await keycloakHelper.getKeycloakAxiosConfig(authenticationType);
  config.headers["Content-Type"] = "application/json";
  config.maxContentLength = Infinity;
  config.maxBodyLength = Infinity;

  let body = {
    "geoJsonString": geojsonString,
    "periodOfValidity": {
      "endDate": periodOfValidityType.validEndDate,
      "startDate": periodOfValidityType.validStartDate
    }
  };

  //PUT /spatial-units/{spatialUnitId}
  return await axios.put(baseUrlPath + "/spatial-units/" + spatialUnitId, body, config)
    .then(response => {
        var summaryType = new SpatialUnitSummaryType();
        summaryType.harvestProcessResult = SpatialUnitSummaryType.HarvestProcessResultEnum.COMPLETED_WITHOUT_ERRORS;
        summaryType.numberOfHarvestedFeatures = JSON.parse(geojsonString).features.length;
        summaryType.targetDatasetId = spatialUnitId;
        summaryType.targetDatasetName = undefined;

        return summaryType;      
    })
    .catch(error => {
      var summaryType = new SpatialUnitSummaryType();
        summaryType.harvestProcessResult = SpatialUnitSummaryType.HarvestProcessResultEnum.ERRORS_OCCURRED;
        summaryType.numberOfHarvestedFeatures = 0;
        summaryType.targetDatasetId = spatialUnitId;
        summaryType.targetDatasetName = undefined;
        summaryType.errorsOccurred = new SummaryTypeErrorsOccurred();
        summaryType.errorsOccurred = new Array();

        let errorType = new SummaryTypeErrorsOccurred();
        errorType.code = error.code;
        errorType.message = error.message;

        summaryType.errorsOccurred.push(
          errorType
        );

        return summaryType; 
    });
}


/**
 * send request against KomMonitor DataManagement API to update indicator according to id
 *
 * baseUrlPath String starting URL path of running KomMonitor DataManagement API instance. It has to be appended with the path to fetch indicator
 * indicatorId String unique identifier of the indicator
 * targetSpatialUnitId String unique identifier of the target spatial unit
 *
 **/
exports.integrateIndicatorById = async function(baseUrlPath, indicatorId, targetSpatialUnitId, indicatorValues, authenticationType) {
  console.log("fetching indicator from KomMonitor data management API for id " + indicatorId + " and targetSpatialUnitId " + targetSpatialUnitId);

  var config = await keycloakHelper.getKeycloakAxiosConfig(authenticationType);
  config.headers["Content-Type"] = "application/json";
  config.maxContentLength = Infinity;
  config.maxBodyLength = Infinity;

  let body = {
    "allowedRoles": [
      
    ],
    "applicableSpatialUnit": targetSpatialUnitId,
    "defaultClassificationMapping": {
      "colorBrewerSchemeName": "blues",
      "items": [
        {
          "defaultColorAsHex": "string",
          "defaultCustomRating": "string"
        }
      ]
    },
    "indicatorValues": indicatorValues
  };

  //PUT /indicators/{indicatorId}/
  return await axios.put(baseUrlPath + "/indicators/" + indicatorId, body, config)
    .then(response => {

      let mappingResultType = new IndicatorSpatialUnitMappingResultType();
      mappingResultType.targetSpatialUnitDatasetId = targetSpatialUnitId;
      mappingResultType.numberOfHarvestedFeatures =  indicatorValues.length;

      return mappingResultType; 
    })
    .catch(error => {
      console.log("Error when fetching indicator. Error was: " + error);
      
      let mappingResultType = new IndicatorSpatialUnitMappingResultType();
      mappingResultType.targetSpatialUnitDatasetId = targetSpatialUnitId;
      mappingResultType.numberOfHarvestedFeatures =  0;
      mappingResultType.errorOccurred = new SummaryTypeErrorsOccurred();
      mappingResultType.errorOccurred.code = error.code;
      mappingResultType.errorOccurred.message = error.message;

      return mappingResultType;
    });
}