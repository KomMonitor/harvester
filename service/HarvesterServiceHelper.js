'use strict';

let KomMonitorDataFetcher = require('./KomMonitorDataFetcherService');
let KomMonitorDataIntegrator = require('./KomMonitorDataIntegrationService');

let KommonitorHarvesterApi = require('kommonitorHarvesterApi');

let UtilHelper = require('../utils/UtilHelper');

/**
 * Perform harvesting process according to submitted config.
 * Perform harvesting process according to submitted config.
 *
 * body HarvesterInputType details necessary to execute harvesting process
 * returns HarvesterOutputType
 **/
exports.executeHarvestRequest = async function (body) {

  let harvesterInput = KommonitorHarvesterApi.HarvesterInputType.constructFromObject(body);

  // :KomMonitorInstanceType
  let sourceInstance = harvesterInput.sourceInstance;
  let targetInstance = harvesterInput.targetInstance;
  // :DataMappingType
  let dataMapping = harvesterInput.dataMapping;

  /*
    process spatial unit harvesting
  */
  // :SpatialUnitDataMappingType
  let spatialUnitSummaryArray = await executeSpatialUnitHarvesting(sourceInstance, targetInstance, dataMapping.spatialUnitMappingDefs);


  /*
    process indicator harvesting
  */  
 // :IndicatorDataMappingType
 let indicatorSummaryArray = await executeIndicatorHarvesting(sourceInstance, targetInstance, dataMapping.indicatorMappingDefs);
  

  let harvesterOutput = new KommonitorHarvesterApi.HarvesterOutputType();
  harvesterOutput.indicatorSummary = indicatorSummaryArray;
  harvesterOutput.spatialUnitSummary = spatialUnitSummaryArray;


  return harvesterOutput;
};

/**
 * performs spatial unit harvesting
 * @param {*} sourceInstance 
 * @param {*} targetInstance 
 * @param {*} spatialUnitMappingDefs 
 */
async function executeSpatialUnitHarvesting(sourceInstance, targetInstance, spatialUnitMappingDefs) {
  let spatialUnitSummaryArray = []; 

  for (const spatialUnitMappingDef of spatialUnitMappingDefs) {
    let summary = initSpatialUnitHarvestSummary(spatialUnitMappingDef);

    /*
      now perform actual harvesting and update summary properties
    */

      await fetchAndIntegrateSpatialUnitFeatures(sourceInstance, spatialUnitMappingDef, summary, targetInstance);     

    if (summary.errorsOccurred.length > 0){
      summary.harvestProcessResult = KommonitorHarvesterApi.SummaryType.HarvestProcessResultEnum.ERRORS_OCCURRED; 
    }
    
    spatialUnitSummaryArray.push(summary);
  }

  return spatialUnitSummaryArray;
}

async function fetchAndIntegrateSpatialUnitFeatures(sourceInstance, spatialUnitMappingDef, summary, targetInstance) {
  try {
    let geojson = undefined;
    let targetSpatialUnitMetadata;
    let sourceSpatialUnitMetadata;

    try {
      geojson = await KomMonitorDataFetcher.fetchSpatialUnitById(sourceInstance.url, spatialUnitMappingDef.sourceDatasetId, sourceInstance.authentication);
      targetSpatialUnitMetadata = await KomMonitorDataFetcher.fetchSpatialUnitMetadataById(targetInstance.url, spatialUnitMappingDef.targetDatasetId, targetInstance.authentication);
      sourceSpatialUnitMetadata = await KomMonitorDataFetcher.fetchSpatialUnitMetadataById(sourceInstance.url, spatialUnitMappingDef.sourceDatasetId, sourceInstance.authentication);
    
      summary.sourceDatasetName = sourceSpatialUnitMetadata.spatialUnitLevel;
      summary.targetDatasetName = targetSpatialUnitMetadata.spatialUnitLevel;
    } catch (error) {
      console.error("Error while fetching data from KomMonitor instance with URL " + sourceInstance.url + ". Error is: \n" + error);

      let errorOccurred = UtilHelper.makeErrorObject("Error while fetching data from KomMonitor instance with URL " + sourceInstance.url, error);
      summary.errorsOccurred.push(errorOccurred);
    }

    if (geojson) {

      geojson = applyOptionalPrefixes_spatialUnits(geojson, spatialUnitMappingDef);

      await KomMonitorDataIntegrator.integrateSpatialUnitById(targetInstance.url, spatialUnitMappingDef.targetDatasetId, JSON.stringify(geojson), spatialUnitMappingDef.targetPeriodOfValidity, targetInstance.authentication);
      
      // if everything worked fine then add harvested feature info to summary
      summary.numberOfHarvestedFeatures += geojson.features.length;
    }

  } catch (error) {
    console.error("Error while integrating data to KomMonitor instance with URL " + targetInstance.url + ". Error is: \n" + error);

    let errorOccurred = UtilHelper.makeErrorObject("Error while integrating data to KomMonitor instance with URL " + targetInstance.url, error);
    summary.errorsOccurred.push(errorOccurred);
  }
}

function applyOptionalPrefixes_spatialUnits(geojson, spatialUnitMappingDef){

  let sourceFeatureIdPrefix = spatialUnitMappingDef.sourceFeatureIdPrefix;
  let sourceFeatureNamePrefix = spatialUnitMappingDef.sourceFeatureNamePrefix;
  let targetFeatureIdPrefix = spatialUnitMappingDef.targetFeatureIdPrefix;
  let targetFeatureNamePrefix = spatialUnitMappingDef.targetFeatureNamePrefix;

  for (const feature of geojson.features) {
      //delete periodOfValidity properties for each feature
      delete feature.properties.validStartDate;
      delete feature.properties.validEndDate;

      if(sourceFeatureIdPrefix && String(feature.properties[process.env.FEATURE_ID_PROPERTY_NAME]).startsWith(sourceFeatureIdPrefix)){
        feature.properties[process.env.FEATURE_ID_PROPERTY_NAME] = String(feature.properties[process.env.FEATURE_ID_PROPERTY_NAME]).replace(sourceFeatureIdPrefix,"");
      }
      if(sourceFeatureNamePrefix && String(feature.properties[process.env.FEATURE_NAME_PROPERTY_NAME]).startsWith(sourceFeatureNamePrefix)){
        feature.properties[process.env.FEATURE_NAME_PROPERTY_NAME] = String(feature.properties[process.env.FEATURE_NAME_PROPERTY_NAME]).replace(sourceFeatureNamePrefix,"");
      }
      if(targetFeatureIdPrefix){
        feature.properties[process.env.FEATURE_ID_PROPERTY_NAME] = targetFeatureIdPrefix + feature.properties[process.env.FEATURE_ID_PROPERTY_NAME];
      }
      if(targetFeatureNamePrefix){
        feature.properties[process.env.FEATURE_NAME_PROPERTY_NAME] = targetFeatureNamePrefix + feature.properties[process.env.FEATURE_NAME_PROPERTY_NAME];
      }
      
  }

  return geojson;
}

function initSpatialUnitHarvestSummary(spatialUnitMappingDef) {
  let summary = new KommonitorHarvesterApi.SpatialUnitSummaryType();
  summary.sourceDatasetName = "NA";
  summary.sourceDatasetId = spatialUnitMappingDef.sourceDatasetId;
  summary.targetDatasetName = "NA";
  summary.targetDatasetId = spatialUnitMappingDef.targetDatasetId;
  summary.harvestProcessResult = KommonitorHarvesterApi.SummaryType.HarvestProcessResultEnum.COMPLETED_WITHOUT_ERRORS;
  summary.errorsOccurred = [];
  summary.numberOfHarvestedFeatures = 0;
  return summary;
}

/**
 * performs indicator harvesting
 * @param {*} sourceInstance 
 * @param {*} targetInstance 
 * @param {*} indicatorMappingDefs 
 */
async function executeIndicatorHarvesting(sourceInstance, targetInstance, indicatorMappingDefs){
  let indicatorSummaryArray = [];
  
  // new KommonitorHarvesterApi.IndicatorSummaryType();
  for (const indicatorMappingDef of indicatorMappingDefs) {
    let indicatorSummary = initIndicatorHarvestSummary(indicatorMappingDef);

    for (const indicatorSpatialUnitMappingDef of indicatorMappingDef.indicatorSpatialUnitMappingDefs) {
      
      let spatialUnitMappingSummary = initIndicatorSpatialUnitMappingResult(indicatorSpatialUnitMappingDef);

      await fetchAndIntegrateIndicatorFeatures(sourceInstance, indicatorMappingDef, indicatorSpatialUnitMappingDef, indicatorSummary, spatialUnitMappingSummary, targetInstance); 

      indicatorSummary.harvestedSpatialUnits.push(spatialUnitMappingSummary);
    
    }    

    if (indicatorSummary.errorsOccurred.length > 0){
      indicatorSummary.harvestProcessResult = KommonitorHarvesterApi.SummaryType.HarvestProcessResultEnum.ERRORS_OCCURRED; 
    }
    
    indicatorSummaryArray.push(indicatorSummary);
  }

  return indicatorSummaryArray;
}
function initIndicatorSpatialUnitMappingResult(indicatorSpatialUnitMappingDef) {
  let mappingSummary = new KommonitorHarvesterApi.IndicatorSpatialUnitMappingResultType();
  mappingSummary.sourceSpatialUnitDatasetId = indicatorSpatialUnitMappingDef.sourceSpatialUnitDatasetId;
  mappingSummary.targetSpatialUnitDatasetId = indicatorSpatialUnitMappingDef.targetSpatialUnitDatasetId;
  mappingSummary.numberOfHarvestedFeatures = 0;
  mappingSummary.errorOccurred = undefined;
  return mappingSummary;
}

function initIndicatorHarvestSummary(indicatorMappingDef) {
  let summary = new KommonitorHarvesterApi.SpatialUnitSummaryType();
  summary.sourceDatasetName = "NA";
  summary.sourceDatasetId = indicatorMappingDef.sourceDatasetId;
  summary.targetDatasetName = "NA";
  summary.targetDatasetId = indicatorMappingDef.targetDatasetId;
  summary.harvestProcessResult = KommonitorHarvesterApi.SummaryType.HarvestProcessResultEnum.COMPLETED_WITHOUT_ERRORS;
  summary.errorsOccurred = [];
  summary.numberOfHarvestedTimestamps = 0;
  summary.harvestedTimestamps = [];
  summary.harvestedSpatialUnits = [];
  return summary;
}

async function fetchAndIntegrateIndicatorFeatures(sourceInstance, indicatorMappingDef, indicatorSpatialUnitMappingDef, indicatorSummary, spatialUnitMappingSummary, targetInstance){
  try {
    let indicatorPropertiesArray = undefined;
    let sourceIndicatorMetadata = undefined;
    let targetIndicatorMetadata = undefined;
    let sourceSpatialUnitMetadata = undefined;
    let targetSpatialUnitMetadata = undefined;
    try {
      indicatorPropertiesArray = await KomMonitorDataFetcher.fetchIndicatorById(sourceInstance.url, indicatorMappingDef.sourceDatasetId, indicatorSpatialUnitMappingDef.sourceSpatialUnitDatasetId, sourceInstance.authentication);
      sourceIndicatorMetadata = await KomMonitorDataFetcher.fetchIndicatorMetadataById(sourceInstance.url, indicatorMappingDef.sourceDatasetId, sourceInstance.authentication);
      targetIndicatorMetadata = await KomMonitorDataFetcher.fetchIndicatorMetadataById(targetInstance.url, indicatorMappingDef.targetDatasetId, targetInstance.authentication);      
      // sourceSpatialUnitMetadata = await KomMonitorDataFetcher.fetchSpatialUnitMetadataById(sourceInstance.url, indicatorSpatialUnitMappingDef.sourceSpatialUnitDatasetId, sourceInstance.authentication);
      targetSpatialUnitMetadata = await KomMonitorDataFetcher.fetchSpatialUnitMetadataById(targetInstance.url, indicatorSpatialUnitMappingDef.targetSpatialUnitDatasetId, targetInstance.authentication);
    
      indicatorSummary.sourceDatasetName = sourceIndicatorMetadata.indicatorName;
      indicatorSummary.targetDatasetName = targetIndicatorMetadata.indicatorName;
    } catch (error) {
      console.error("Error while fetching data from KomMonitor instance with URL " + sourceInstance.url + ". Error is: \n" + error);

      let errorOccurred = UtilHelper.makeErrorObject("Error while fetching data from KomMonitor instance with URL " + sourceInstance.url, error);
      indicatorSummary.errorsOccurred.push(errorOccurred);
      spatialUnitMappingSummary.errorOccurred = errorOccurred;
    }

    if (indicatorPropertiesArray) {

      let indicatorValues = makeIndicatorValuesAndApplyOptionalPrefixes_indicators(indicatorPropertiesArray, indicatorMappingDef);

      await KomMonitorDataIntegrator.integrateIndicatorById(targetInstance.url, indicatorMappingDef.targetDatasetId, targetIndicatorMetadata, targetSpatialUnitMetadata, indicatorValues, targetInstance.authentication);
      
      // if everything worked fine then add harvested feature info to summary
      spatialUnitMappingSummary.numberOfHarvestedFeatures += indicatorValues.length;

      manageHarvestedTimestamps(indicatorSummary, spatialUnitMappingSummary, indicatorValues);
    }

  } catch (error) {
    console.error("Error while integrating data to KomMonitor instance with URL " + targetInstance.url + ". Error is: \n" + error);

    let errorOccurred = UtilHelper.makeErrorObject("Error while integrating data to KomMonitor instance with URL " + targetInstance.url, error);
    indicatorSummary.errorsOccurred.push(errorOccurred);
    spatialUnitMappingSummary.errorOccurred = errorOccurred;
  }
}

function manageHarvestedTimestamps(indicatorSummary, spatialUnitMappingSummary, indicatorValues){
  let exampleValues = indicatorValues[0];

  if(exampleValues){
    for (const valueMappingEntry of exampleValues.valueMapping) {
      if(! indicatorSummary.harvestedTimestamps.includes(new Date(valueMappingEntry.timestamp))){
        indicatorSummary.harvestedTimestamps.push(new Date(valueMappingEntry.timestamp));
      }
    }

    indicatorSummary.numberOfHarvestedTimestamps = indicatorSummary.harvestedTimestamps.length;
  }
}

function makeIndicatorValuesAndApplyOptionalPrefixes_indicators(indicatorPropertiesArray, indicatorMappingDef){

  /*

  "indicatorValues": [
    {
      "spatialReferenceKey": "string",
      "valueMapping": [
        {
          "indicatorValue": 0,
          "timestamp": "string"
        }
      ]
    }
  ]

  */

  let indicatorValues = [];

  let sourceFeatureIdPrefix = indicatorMappingDef.sourceFeatureIdPrefix;
  let sourceFeatureNamePrefix = indicatorMappingDef.sourceFeatureNamePrefix;
  let targetFeatureIdPrefix = indicatorMappingDef.targetFeatureIdPrefix;
  let targetFeatureNamePrefix = indicatorMappingDef.targetFeatureNamePrefix;

  for (const propertiesEntry of indicatorPropertiesArray) {
    //delete periodOfValidity properties for each feature
      delete propertiesEntry.validStartDate;
      delete propertiesEntry.validEndDate;

      if(sourceFeatureIdPrefix && String(propertiesEntry[process.env.FEATURE_ID_PROPERTY_NAME]).startsWith(sourceFeatureIdPrefix)){
        propertiesEntry[process.env.FEATURE_ID_PROPERTY_NAME] = String(propertiesEntry[process.env.FEATURE_ID_PROPERTY_NAME]).replace(sourceFeatureIdPrefix,"");
      }
      if(sourceFeatureNamePrefix && String(propertiesEntry[process.env.FEATURE_NAME_PROPERTY_NAME]).startsWith(sourceFeatureNamePrefix)){
        propertiesEntry[process.env.FEATURE_NAME_PROPERTY_NAME] = String(propertiesEntry[process.env.FEATURE_NAME_PROPERTY_NAME]).replace(sourceFeatureNamePrefix,"");
      }
      if(targetFeatureIdPrefix){
        propertiesEntry[process.env.FEATURE_ID_PROPERTY_NAME] = targetFeatureIdPrefix + propertiesEntry[process.env.FEATURE_ID_PROPERTY_NAME];
      }
      if(targetFeatureNamePrefix){
        propertiesEntry[process.env.FEATURE_NAME_PROPERTY_NAME] = targetFeatureNamePrefix + propertiesEntry[process.env.FEATURE_NAME_PROPERTY_NAME];
      }

      let indicatorValueEntry = {
        "spatialReferenceKey": propertiesEntry[process.env.FEATURE_ID_PROPERTY_NAME],
        "valueMapping": []
      };

      for (const key in propertiesEntry) {
        if (Object.hasOwnProperty.call(propertiesEntry, key)) {
          const element = propertiesEntry[key];
          
          if(String(key).startsWith(process.env.INDICATOR_DATE_PREFIX)){
            indicatorValueEntry.valueMapping.push({
              "indicatorValue": element,
              "timestamp": String(key).replace(process.env.INDICATOR_DATE_PREFIX, "")              
            });
          }
        }
      }
      indicatorValues.push(indicatorValueEntry);
  }

  return indicatorValues;
}

