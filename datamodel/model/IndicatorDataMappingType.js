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
import {IndicatorSpatialUnitMappingType} from './IndicatorSpatialUnitMappingType';
import {SpatialDataMappingType} from './SpatialDataMappingType';

/**
 * The IndicatorDataMappingType model module.
 * @module model/IndicatorDataMappingType
 * @version 0.0.1
 */
export class IndicatorDataMappingType extends SpatialDataMappingType {
  /**
   * Constructs a new <code>IndicatorDataMappingType</code>.
   * @alias module:model/IndicatorDataMappingType
   * @class
   * @extends module:model/SpatialDataMappingType
   */
  constructor() {
    super();
  }

  /**
   * Constructs a <code>IndicatorDataMappingType</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/IndicatorDataMappingType} obj Optional instance to populate.
   * @return {module:model/IndicatorDataMappingType} The populated <code>IndicatorDataMappingType</code> instance.
   */
  static constructFromObject(data, obj) {
    if (data) {
      obj = obj || new IndicatorDataMappingType();
      SpatialDataMappingType.constructFromObject(data, obj);
      if (data.hasOwnProperty('indicatorSpatialUnitMappingDefs'))
        obj.indicatorSpatialUnitMappingDefs = ApiClient.convertToType(data['indicatorSpatialUnitMappingDefs'], [IndicatorSpatialUnitMappingType]);
    }
    return obj;
  }
}

/**
 * @member {Array.<module:model/IndicatorSpatialUnitMappingType>} indicatorSpatialUnitMappingDefs
 */
IndicatorDataMappingType.prototype.indicatorSpatialUnitMappingDefs = undefined;
