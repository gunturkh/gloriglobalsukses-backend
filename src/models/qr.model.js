const mongoose = require('mongoose');
const { toJSON } = require('./plugins');

const qrSchema = mongoose.Schema(
  {
    qr: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
qrSchema.plugin(toJSON);

/**
 * @typedef Token
 */
const QR = mongoose.model('QR', qrSchema);

module.exports = QR;
