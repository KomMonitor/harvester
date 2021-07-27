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
 * The SpatialDataMappingType model module.
 * @module model/SpatialDataMappingType
 * @version 0.0.1
 */
export class SpatialDataMappingType {
  /**
   * Constructs a new <code>SpatialDataMappingType</code>.
   * mapping details to transfer certain spatial dataset features from one KomMonitor instance to another
   * @alias module:model/SpatialDataMappingType
   * @class
   */
  constructor() {
  }

  /**
   * Constructs a <code>SpatialDataMappingType</code> from a plain JavaScript object, optionally creating a new instance.
   * Copies all relevant properties from <code>data</code> to <code>obj</code> if supplied or a new instance if not.
   * @param {Object} data The plain JavaScript object bearing properties of interest.
   * @param {module:model/SpatialDataMappingType} obj Optional instance to populate.
   * @return {module:model/SpatialDataMappingType} The populated <code>SpatialDataMappingType</code> instance.
   */
  static constructFromObject(data, obj) {
    if (data) {
      obj = obj || new SpatialDataMappingType();
      if (data.hasOwnProperty('sourceDatasetId'))
        obj.sourceDatasetId = ApiClient.convertToType(data['sourceDatasetId'], 'String');
      if (data.hasOwnProperty('targetDatasetId'))
        obj.targetDatasetId = ApiClient.convertToType(data['targetDatasetId'], 'String');
      if (data.hasOwnProperty('sourceFeatureIdPrefix'))
        obj.sourceFeatureIdPrefix = ApiClient.convertToType(data['sourceFeatureIdPrefix'], 'String');
      if (data.hasOwnProperty('targetFeatureIdPrefix'))
        obj.targetFeatureIdPrefix = ApiClient.convertToType(data['targetFeatureIdPrefix'], 'String');
      if (data.hasOwnProperty('sourceFeatureIdSuffix'))
        obj.sourceFeatureIdSuffix = ApiClient.convertToType(data['sourceFeatureIdSuffix'], 'String');
      if (data.hasOwnProperty('targetFeatureIdSuffix'))
        obj.targetFeatureIdSuffix = ApiClient.convertToType(data['targetFeatureIdSuffix'], 'String');
    }
    return obj;
  }
}

/**
 * source dataset id from source KomMonitor instance
 * @member {String} sourceDatasetId
 */
SpatialDataMappingType.prototype.sourceDatasetId = undefined;

/**
 * target dataset id from target KomMonitor instance
 * @member {String} targetDatasetId
 */
SpatialDataMappingType.prototype.targetDatasetId = undefined;

/**
 * optional suffix for source dataset feature IDs
 * @member {String} sourceFeatureIdPrefix
 */
SpatialDataMappingType.prototype.sourceFeatureIdPrefix = undefined;

/**
 * optional suffix for target dataset feature IDs
 * @member {String} targetFeatureIdPrefix
 */
SpatialDataMappingType.prototype.targetFeatureIdPrefix = undefined;

/**
 * optional suffix for source dataset feature IDs
 * @member {String} sourceFeatureIdSuffix
 */
SpatialDataMappingType.prototype.sourceFeatureIdSuffix = undefined;

/**
 * optional prefix for target dataset feature IDs
 * @member {String} targetFeatureIdSuffix
 */
SpatialDataMappingType.prototype.targetFeatureIdSuffix = undefined;
