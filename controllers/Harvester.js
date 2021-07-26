'use strict';

var utils = require('../utils/writer.js');
var Harvester = require('../service/HarvesterService');

module.exports.executeHarvesting = function executeHarvesting (req, res, next, body) {
  Harvester.executeHarvesting(body)
    .then(function (response) {
      utils.writeJson(res, response);
    })
    .catch(function (response) {
      utils.writeJson(res, response);
    });
};
