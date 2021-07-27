/*
 * KomMonitor Harvester API
 * KomMonitor Harvester API to harvest/transfer spatial data from one instance to another
 *
 * OpenAPI spec version: 0.0.1
 * Contact: christian.danowski-buhren@hs-bochum.de
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 *
 * Swagger Codegen version: 3.0.27
 *
 * Do not edit the class manually.
 *
 */
import {ApiClient} from '../ApiClient';
import {DataMappingType} from './DataMappingType';
import {KomMonitorInstanceType} from './KomMonitorInstanceType';

/**
 * The HarvesterInputType model module.
 * @module model/HarvesterInputType
 * @version 0.0.1
 */
export class HarvesterInputType {
  /**
   * Constructs a new <code>HarvesterInputType</code>.
   * required input parameters to execute a customizable indicator computation
   * @alias module:model/HarvesterInputType
   * @class
   */
  constructor() {
  }

  /**
   * Constructs a <code>HarvesterInputType</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/HarvesterInputType} obj Optional instance to populate.
   * @return {module:model/HarvesterInputType} The populated <code>HarvesterInputType</code> instance.
   */
  static constructFromObject(data, obj) {
    if (data) {
      obj = obj || new HarvesterInputType();
      if (data.hasOwnProperty('sourceInstance'))
        obj.sourceInstance = KomMonitorInstanceType.constructFromObject(data['sourceInstance']);
      if (data.hasOwnProperty('targetInstance'))
        obj.targetInstance = KomMonitorInstanceType.constructFromObject(data['targetInstance']);
      if (data.hasOwnProperty('dataMapping'))
        obj.dataMapping = DataMappingType.constructFromObject(data['dataMapping']);
    }
    return obj;
  }
}

/**
 * @member {module:model/KomMonitorInstanceType} sourceInstance
 */
HarvesterInputType.prototype.sourceInstance = undefined;

/**
 * @member {module:model/KomMonitorInstanceType} targetInstance
 */
HarvesterInputType.prototype.targetInstance = undefined;

/**
 * @member {module:model/DataMappingType} dataMapping
 */
HarvesterInputType.prototype.dataMapping = undefined;
