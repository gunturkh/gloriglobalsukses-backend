const httpStatus = require('http-status');
const moment = require('moment');
const { TrackingData } = require('../models');
const ApiError = require('../utils/ApiError');
const rupiah = require('../utils/currencyFormatter');

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

const messageFormatter = (trackingData) => {
  const {
    name,
    address,
    phone,
    item,
    resi,
    status,
    salesOrder,
    delay,
    createdAt,
    estimatedDate,
    newEstimatedDate,
    remainingDownPaymentAmount,
  } = trackingData;
  let message = '';
  switch (status) {
    case 'SUDAH DIPESAN DAN BARANG READY':
      message = `Customer *${name}* yth, kami menginformasikan bahwa barang no *${salesOrder}* dengan item *${item}* sudah dipesan & sedang dalam proses pengemasan pada tanggal ${moment(
        createdAt
      ).format(
        'DD MMMM YYYY'
      )} dan dalam proses *produksi 7 hari*. Kemungkinan akan mengalami keterlambatan pengiriman dikarenakan adanya proses produksi tersebut. Mohon ditunggu informasi selanjutnya. Terima kasih.`;
      break;

    case 'SUDAH DIPESAN DAN BARANG PRODUKSI':
      message = `Customer *${name}* yth, kami menginformasikan bahwa barang no *${salesOrder}* dengan item *${item}* sudah dipesan & sedang dalam proses pengemasan pada tanggal ${moment(
        createdAt
      ).format(
        'DD MMMM YYYY'
      )}, sudah dalam proses pengiriman ke Gudang China. Mohon maaf atas keterlambatan informasi yang diberikan, ditunggu informasi selanjutnya. Terima kasih.`;
      break;

    case 'SUDAH DIKIRIM VENDOR KE GUDANG CHINA':
      message = `Customer *${name}* yth, kami menginformasikan bahwa barang no *${salesOrder}* dengan item *${item}* sudah dikirim dengan nomor *resi china lokal ${resi}* dan akan tiba di Gudang China dalam waktu 4-5 hari. Mohon ditunggu informasi selanjutnya. Terima kasih.`;
      break;

    case 'SUDAH TIBA DIGUDANG CHINA':
      message = `Customer *${name}* yth, kami menginformasikan bahwa barang no *${salesOrder}* dengan item *${item}* sudah tiba di Gudang China dengan *${resi}*. Mohon ditunggu informasi selanjutnya. Terima kasih.`;
      break;

    case 'BARANG LOADING BATAM - JAKARTA':
      message = `Customer *${name}* yth, kami menginformasikan bahwa barang no *${salesOrder}* dengan item *${item}* dengan resi *${resi}* sudah di loading dan akan tiba di gudang Jakarta dengan estimasi *${moment(
        estimatedDate
      ).format('DD MMMM YYYY')}*. Mohon ditunggu informasi selanjutnya. Terima kasih.`;
      break;

    case 'BARANG KOMPLIT ITEM & BELUM CLEAR DP':
      message = `Customer *${name}* yth, kami menginformasikan bahwa barang no *${salesOrder}* dengan item *${item}* atas *${resi}* tiba di Gudang Jakarta pada tanggal  *${moment(
        estimatedDate
      ).format(
        'DD MMMM YYYY'
      )}* dan akan segera diproses pengiriman ke alamat anda. Mohon untuk segera melakukan pelunasan *sisa DP 30%* sebesar *IDR ${rupiah(
        remainingDownPaymentAmount
      )}*. Mohon ditunggu informasi selanjutnya. Terima kasih.`;
      break;

    case 'BARANG KOMPLIT ITEM & SUDAH CLEAR DP':
      message = `Customer *${name}* yth, kami menginformasikan bahwa barang no *${salesOrder}* dengan item *${item}* tiba di Gudang Jakarta pada tanggal  *${moment(
        estimatedDate
      ).format(
        'DD MMMM YYYY'
      )}* dan sudah dikirimkan dengan nomor resi *${resi}* .Jangan lupa Untuk membuat video unboxing jika barang telah sampai untuk menghindari kesalahan dalam pengiriman. Ditunggu orderan selanjutnya, Terima kasih.`;
      break;

    case 'DELAY - RANDOM CHECK CHINA':
      message = `Customer *${name}* yth, kami menginformasikan bahwa barang no *${salesOrder}* dengan item *${item}* akan mengalami kemunduran estimasi tiba di Indonesia dikarenakan adanya *Random Check* di Custom China maka dari itu untuk estimasi selanjutnya akan kami informasikan kembali. Kami segenap perusahaan memohon maaf sebesar besarnya atas kemunduran estimasi tersebut. Mohon ditunggu. Terima kasih.`;
      break;

    case 'DELAY - STATUS BARANG OVERLOAD':
      message = `Customer *${name}* yth, kami menginformasikan bahwa barang no *${salesOrder}* dengan item *${item}* Estimasi awal *${estimatedDate}* mengalami kemunduran Estimasi dikarenakan adanya *Overload Container* dipelabuhan Transit Indonesia. Maka estimasi selanjutnya *${newEstimatedDate}*, Kami segenap perusahaan memohon maaf sebesar besarnya atas kemunduran estimasi tersebut. Mohon ditunggu informasi selanjutnyya. Terima kasih.`;
      break;

    default:
      break;
  }
  return message;
};

module.exports = {
  createTrackingData,
  queryTrackingDatas,
  getTrackingDataById,
  getTrackingDataByPhone,
  updateTrackingDataById,
  deleteTrackingDataById,
  messageFormatter,
};
