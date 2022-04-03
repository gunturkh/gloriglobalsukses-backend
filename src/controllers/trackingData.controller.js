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
  const filter = pick(req.query, ['name', 'phone', 'address', 'item', 'resi', 'status']);
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
    throw new ApiError(httpStatus.NOT_FOUND, 'Tracking not found');
  }
  res.send(trackingData);
});

const updateTrackingData = catchAsync(async (req, res) => {
  console.log('trackingDataId', req.params.trackingDataId);
  const trackingData = await trackingDataService.updateTrackingDataById(req.params.trackingDataId, req.body);
  const { name, address, phone, item, resi, status } = trackingData;
  // const { message, times } = req.body;
  console.log('tracking data success', trackingData);
  const message = `Halo *${name}*, status pengiriman barang anda, *${item}*, resi: *${resi}*, dengan alamat: *${address}*, adalah: *${status}*`;
  console.log('message', message);
  if (phone === undefined || message === undefined) {
    res.send({ status: 'error', message: 'please enter valid phone and message' });
  } else {
    // eslint-disable-next-line no-undef
    client.sendMessage(`${phone}@c.us`, message).then((response) => {
      if (response.id.fromMe) {
        res.send({ status: 'success', message: `Message successfully sent to ${phone}`, data: trackingData });
      }
    });
  }

  // res.send(trackingData);
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
