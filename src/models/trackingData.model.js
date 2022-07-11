const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');

const trackingDataSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    item: {
      type: String,
      required: true,
    },
    resi: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    salesOrder: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      // required: true,
    },
    delay: {
      type: Boolean,
      default: false,
      // required: true,
    },
    sendMessageTimestamp: {
      type: Number,
    },
    sendMessageStatus: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.SchemaTypes.ObjectId,
      ref: 'User',
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    estimatedDate: {
      type: Date,
    },
    newEstimatedDate: {
      type: Date,
    },
    remainingDownPaymentAmount: {
      type: Number,
    },
    customerOrderDate: {
      type: Date,
    },
    orderArrivedToWarehouseDate: {
      type: Date,
    },
    shipoutDate: {
      type: Date,
    },
    cargoName: {
      type: String,
    },
    cartonAmount: {
      type: Number,
    },
    itemDetail: {
      type: String,
    },
    productionDays: {
      type: Number,
    },
    daysToSendReminder: {
      type: Number,
    },
    daysToSendReminderTimestamp: {
      type: Number,
    },
    setDaysReminderManually: {
      type: Boolean,
    },
    setStatusManually: {
      type: Boolean,
    },
    setSendMessageNow: {
      type: Boolean,
    },
    images: {
      type: Array,
    },
    history: {
      type: Array,
    },
    containerNumber : {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
trackingDataSchema.plugin(toJSON);
trackingDataSchema.plugin(paginate);

/**
 * @typedef User
 */
const TrackingData = mongoose.model('TrackingData', trackingDataSchema);

module.exports = TrackingData;
