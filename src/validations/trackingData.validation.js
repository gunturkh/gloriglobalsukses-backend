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
    salesOrder: Joi.string(),
    label: Joi.string(),
    delay: Joi.boolean(),
    sendMessageTimestamp: Joi.number(),
    sendMessageStatus: Joi.boolean(),
    user: Joi.string().custom(objectId),
    read: Joi.boolean(),
    estimatedDate: Joi.string(),
    remainingDownPaymentAmount: Joi.number(),
    productionDays: Joi.number(),
    daysToSendReminder: Joi.number(),
    daysToSendReminderTimestamp: Joi.number(),
    setDaysReminderManually: Joi.boolean(),
    setStatusManually: Joi.boolean(),
    setSendMessageNow: Joi.boolean(),
    customerOrderDate: Joi.string(),
    orderArrivedToWarehouseDate: Joi.string(),
    images: Joi.array(),
    history: Joi.array(),
    shipoutDate: Joi.string(),
    cargoName: Joi.string(),
    cartonAmount: Joi.number(),
    itemDetail: Joi.string(),
    createdAt: Joi.string(),
    updatedAt: Joi.string(),
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
    salesOrder: Joi.string(),
    label: Joi.string(),
    delay: Joi.boolean(),
    sendMessageTimestamp: Joi.number(),
    sendMessageStatus: Joi.boolean(),
    user: Joi.string().custom(objectId),
    read: Joi.boolean(),
    estimatedDate: Joi.string(),
    remainingDownPaymentAmount: Joi.number(),
    productionDays: Joi.number(),
    daysToSendReminder: Joi.number(),
    daysToSendReminderTimestamp: Joi.number(),
    setDaysReminderManually: Joi.boolean(),
    setStatusManually: Joi.boolean(),
    setSendMessageNow: Joi.boolean(),
    customerOrderDate: Joi.string(),
    orderArrivedToWarehouseDate: Joi.string(),
    images: Joi.array(),
    history: Joi.array(),
    shipoutDate: Joi.string(),
    cargoName: Joi.string(),
    cartonAmount: Joi.number(),
    itemDetail: Joi.string(),
    createdAt: Joi.string(),
    updatedAt: Joi.string(),
    sortBy: Joi.string(),
    populate: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getTrackingData = {
  params: Joi.object().keys({
    trackingDataId: Joi.string().custom(objectId),
  }),
};

const getTrackingDataPDF = {
  params: Joi.object().keys({
    url: Joi.string(),
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
      salesOrder: Joi.string(),
      label: Joi.string(),
      delay: Joi.boolean(),
      sendMessageTimestamp: Joi.number(),
      sendMessageStatus: Joi.boolean(),
      user: Joi.string().custom(objectId),
      read: Joi.boolean(),
      estimatedDate: Joi.string(),
      remainingDownPaymentAmount: Joi.number(),
      productionDays: Joi.number(),
      daysToSendReminder: Joi.number(),
      daysToSendReminderTimestamp: Joi.number(),
      setDaysReminderManually: Joi.boolean(),
      setSendMessageNow: Joi.boolean(),
      setStatusManually: Joi.boolean(),
      customerOrderDate: Joi.string(),
      orderArrivedToWarehouseDate: Joi.string(),
      images: Joi.array(),
      history: Joi.array(),
      shipoutDate: Joi.string(),
      cargoName: Joi.string(),
      cartonAmount: Joi.number(),
      itemDetail: Joi.string(),
      createdAt: Joi.string(),
      updatedAt: Joi.string(),
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
  getTrackingDataPDF,
  updateTrackingData,
  deleteTrackingData,
};
