const Joi = require('joi');
const { objectId } = require('./custom.validation');

const createTrackingData = {
  body: Joi.object().keys({
    name: Joi.string(),
    phone: Joi.number(),
    address: Joi.string(),
    item: Joi.string(),
    resi: Joi.string(),
    status: Joi.string(),
  }),
};

const getTrackingDatas = {
  query: Joi.object().keys({
    name: Joi.string(),
    phone: Joi.number(),
    address: Joi.string(),
    item: Joi.string(),
    resi: Joi.string(),
    status: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getTrackingData = {
  params: Joi.object().keys({
    trackingDataId: Joi.string().custom(objectId),
  }),
};

const updateTrackingData = {
  params: Joi.object().keys({
    trackingDataId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      id: Joi.string(),
      name: Joi.string(),
      phone: Joi.number(),
      address: Joi.string(),
      item: Joi.string(),
      resi: Joi.string(),
      status: Joi.string(),
    })
    .min(1),
};

const deleteTrackingData = {
  params: Joi.object().keys({
    trackingDataId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createTrackingData,
  getTrackingDatas,
  getTrackingData,
  updateTrackingData,
  deleteTrackingData,
};
