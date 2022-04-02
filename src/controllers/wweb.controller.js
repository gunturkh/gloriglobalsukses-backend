const catchAsync = require('../utils/catchAsync');
const { wwebService } = require('../services');

const getQR = catchAsync(async (req, res) => {
  const qr = await wwebService.getQR();
  res.send(qr);
});

module.exports = {
  getQR,
};
