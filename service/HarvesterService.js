'use strict';


/**
 * Perform harvesting process according to submitted config.
 * Perform harvesting process according to submitted config.
 *
 * body HarvesterInputType details necessary to execute harvesting process
 * returns HarvesterOutputType
 **/
exports.executeHarvesting = function(body) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "indicatorSummary" : [ "", "" ],
  "spatialUnitSummary" : [ "", "" ]
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

