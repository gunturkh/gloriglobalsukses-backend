const httpStatus = require('http-status');
const { TrackingData } = require('../models');
const ApiError = require('../utils/ApiError');

/**
 * Create a tracking data
 * @param {Object} trackingDataBody
 * @returns {Promise<TrackingData>}
 */
const createTrackingData = async (trackingDataBody) => {
  return TrackingData.create(trackingDataBody);
};

/**
 * Query for tracking data
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryTrackingDatas = async (filter, options) => {
  const trackingDatas = await TrackingData.paginate(filter, options);
  return trackingDatas;
};

/**
 * Get tracking data by id
 * @param {ObjectId} id
 * @returns {Promise<TrackingData>}
 */
const getTrackingDataById = async (id) => {
  return TrackingData.findById(id);
};

/**
 * Get tracking data by phone number
 * @param {string} phone
 * @returns {Promise<TrackingData>}
 */
const getTrackingDataByPhone = async (phone) => {
  return TrackingData.findOne({ phone });
};

/**
 * Update tracking data by id
 * @param {ObjectId} trackingDataId
 * @param {Object} updateBody
 * @returns {Promise<TrackingData>}
 */
const updateTrackingDataById = async (trackingDataId, updateBody) => {
  const trackingData = await getTrackingDataById(trackingDataId);
  if (!trackingData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tracking data not found');
  }
  Object.assign(trackingData, updateBody);
  await trackingData.save();
  return trackingData;
};

/**
 * Delete tracking data by id
 * @param {ObjectId} trackingDataId
 * @returns {Promise<TrackingData>}
 */
const deleteTrackingDataById = async (trackingDataId) => {
  const trackingData = await getTrackingDataById(trackingDataId);
  if (!trackingData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Tracking data not found');
  }
  await trackingData.remove();
  return trackingData;
};

module.exports = {
  createTrackingData,
  queryTrackingDatas,
  getTrackingDataById,
  getTrackingDataByPhone,
  updateTrackingDataById,
  deleteTrackingDataById,
};
