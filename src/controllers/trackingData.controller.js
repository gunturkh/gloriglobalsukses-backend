const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { trackingDataService } = require('../services');

const createTrackingData = catchAsync(async (req, res) => {
  const trackingData = await trackingDataService.createTrackingData(req.body);
  res.status(httpStatus.CREATED).send(trackingData);
});

const getTrackingDatas = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await trackingDataService.queryTrackingDatas(filter, options);
  const { page, limit, totalResults } = result;
  res.set('Access-Control-Expose-Headers', 'Content-Range');
  res.set('Content-Range', `trackings ${page}-${limit}/${totalResults}`);
  res.send(result);
});

const getTrackingData = catchAsync(async (req, res) => {
  const trackingData = await trackingDataService.getTrackingDataById(req.params.trackingDataId);
  if (!trackingData) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(trackingData);
});

const updateTrackingData = catchAsync(async (req, res) => {
  const trackingData = await trackingDataService.updateTrackingDataById(req.params.trackingDataId, req.body);
  res.send(trackingData);
});

const deleteTrackingData = catchAsync(async (req, res) => {
  await trackingDataService.deleteTrackingDataById(req.params.trackingDataId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createTrackingData,
  getTrackingDatas,
  getTrackingData,
  updateTrackingData,
  deleteTrackingData,
};
