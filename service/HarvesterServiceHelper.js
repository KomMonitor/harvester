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
    try {
      geojson = await KomMonitorDataFetcher.fetchSpatialUnitById(sourceInstance.url, spatialUnitMappingDef.sourceDatasetId, sourceInstance.authentication);
    } catch (error) {
      console.error("Error while fetching data from KomMonitor instance with URL " + sourceInstance.url + ". Error is: \n" + error);

      let errorOccurred = UtilHelper.makeErrorObject("Error while fetching data from KomMonitor instance with URL " + sourceInstance.url, error);
      summary.errorsOccurred.push(errorOccurred);
    }

    if (geojson) {

      geojson = applyOptionalPrefixes(geojson, spatialUnitMappingDef);

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

function applyOptionalPrefixes(geojson, spatialUnitMappingDef){

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
  let indicatorSummary = [];
  
  // new KommonitorHarvesterApi.IndicatorSummaryType();
  for (const indicatorMappingDef of indicatorMappingDefs) {
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

    for (const indicatorSpatialUnitMappingDef of indicatorMappingDef.indicatorSpatialUnitMappingDefs) {
      
      let mappingSummary = new KommonitorHarvesterApi.IndicatorSpatialUnitMappingResultType();
      mappingSummary.sourceSpatialUnitDatasetId = indicatorSpatialUnitMappingDef.sourceSpatialUnitDatasetId;
      mappingSummary.targetSpatialUnitDatasetId = indicatorSpatialUnitMappingDef.targetSpatialUnitDatasetId;
      mappingSummary.numberOfHarvestedFeatures = 0;
      mappingSummary.errorOccurred = undefined;
      
      summary.harvestedSpatialUnits.push(mappingSummary);
    
    }
    
    indicatorSummary.push(summary);
  }

  return indicatorSummary;
}
