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

/**
 * The PeriodOfValidityType model module.
 * @module model/PeriodOfValidityType
 * @version 0.0.1
 */
export class PeriodOfValidityType {
  /**
   * Constructs a new <code>PeriodOfValidityType</code>.
   * period of validity information for spatial features
   * @alias module:model/PeriodOfValidityType
   * @class
   */
  constructor() {
  }

  /**
   * Constructs a <code>PeriodOfValidityType</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/PeriodOfValidityType} obj Optional instance to populate.
   * @return {module:model/PeriodOfValidityType} The populated <code>PeriodOfValidityType</code> instance.
   */
  static constructFromObject(data, obj) {
    if (data) {
      obj = obj || new PeriodOfValidityType();
      if (data.hasOwnProperty('validStartDate'))
        obj.validStartDate = ApiClient.convertToType(data['validStartDate'], 'Date');
      if (data.hasOwnProperty('validEndDate'))
        obj.validEndDate = ApiClient.convertToType(data['validEndDate'], 'Date');
    }
    return obj;
  }
}

/**
 * start date of harvested features
 * @member {Date} validStartDate
 */
PeriodOfValidityType.prototype.validStartDate = undefined;

/**
 * end date of harvested features
 * @member {Date} validEndDate
 */
PeriodOfValidityType.prototype.validEndDate = undefined;
