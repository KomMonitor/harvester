'use strict';

let HarvesterHelper = require('./HarvesterServiceHelper');

/**
 * Perform harvesting process according to submitted config.
 * Perform harvesting process according to submitted config.
 *
 * body HarvesterInputType details necessary to execute harvesting process
 * returns HarvesterOutputType
 **/
exports.executeHarvesting = function(body) {
  return new Promise(async function(resolve, reject) {

    try {
      let harvesterOutput = await HarvesterHelper.executeHarvestRequest(body);

      resolve(harvesterOutput); 
    } catch (error) {
      console.error(error);
      reject(error);
    }    
  });
}

