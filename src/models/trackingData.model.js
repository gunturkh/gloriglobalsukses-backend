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
      // required: true,
    },
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
