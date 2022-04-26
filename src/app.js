/* eslint-disable no-console */
/* eslint-disable no-undef */
const express = require('express');
const fs = require('fs');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const { Client, LocalAuth } = require('whatsapp-web.js');
const moment = require('moment');
const cron = require('node-cron');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const { QR, TrackingData } = require('./models');
// const { messageFormatter } = require('./services/trackingData.service');

process.title = 'whatsapp-node-api';
global.client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    defaultViewport: null,
    args: ['--incognito', '--no-sandbox', '--single-process', '--no-zygote'],
  },
});
global.authed = false;
const app = express();

if (config.env !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(
  cors({
    origin: ['https://gloriglobal-tracker.netlify.app', 'http://localhost:3000'],
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);
app.options('*', cors());

// ...

// cron jobs
// const task = cron.schedule('1 * * * *', function () {
//   const phone = 62881080001747;
//   const message = 'Hello, this is a test message from the cron job';
//   logger.info(`cron job to phone: ${phone} & message: ${message}`);
//   // eslint-disable-next-line no-undef
//   // client.sendMessage(`${phone}@c.us`, message).then((response) => {
//   //   if (response.id.fromMe) {
//   //     logger.info({ status: 'success', message: `Message successfully sent to ${phone}` });
//   //   }
//   // });
// });

// task.start();

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
    remainingDownPaymentAmount,
    productionDays,
  } = trackingData;
  switch (status) {
    case 'SUDAH DIPESAN DAN BARANG READY':
      return `Customer *${name}* yth, kami menginformasikan bahwa barang no *${salesOrder}* dengan item *${item}* sudah dipesan dan dikemas pada tanggal ${moment(
        createdAt
      ).format(
        'DD MMMM YYYY'
      )}, sudah dalam proses pengiriman ke Gudang China. Mohon maaf atas keterlambatan informasi yang diberikan, ditunggu informasi selanjutnya. Terima kasih.`;

    case 'SUDAH DIPESAN DAN BARANG PRODUKSI':
      return `Customer *${name}* yth, kami menginformasikan bahwa barang no *${salesOrder}* dengan item *${item}* sudah dipesan dan dikemas pada tanggal ${moment(
        createdAt
      ).format(
        'DD MMMM YYYY'
      )} dan dalam proses *produksi ${productionDays} hari*. Kemungkinan akan mengalami keterlambatan pengiriman dikarenakan adanya proses produksi tersebut. Mohon ditunggu informasi selanjutnya. Terima kasih.`;

    case 'SUDAH DIKIRIM VENDOR KE GUDANG CHINA':
      return `Customer *${name}* yth, kami menginformasikan bahwa barang no *${salesOrder}* dengan item *${item}* sudah dikirim dengan nomor *resi china lokal ${resi}* dan akan tiba di Gudang China dalam waktu 4-5 hari. Mohon ditunggu informasi selanjutnya. Terima kasih.`;

    case 'SUDAH TIBA DIGUDANG CHINA':
      return `Customer *${name}* yth, kami menginformasikan bahwa barang no *${salesOrder}* dengan item *${item}* sudah tiba di Gudang China dengan *${resi}*. Mohon ditunggu informasi selanjutnya. Terima kasih.`;

    case 'BARANG LOADING KE BATAM':
      return `Customer *${name}* yth, kami menginformasikan bahwa barang no *${salesOrder}* dengan item *${item}* atas *${resi}* sudah di loading dan akan tiba di gudang Jakarta dengan estimasi *${moment(
        estimatedDate
      ).format('DD MMMM YYYY')}*. Mohon ditunggu informasi selanjutnya. Terima kasih.`;

    case 'BARANG KOMPLIT ITEM & BELUM CLEAR DP':
      return `Customer *${name}* yth, kami menginformasikan bahwa barang no *${salesOrder}* dengan item *${item}* atas *${resi}* tiba di Gudang Jakarta pada tanggal  *${moment(
        estimatedDate
      ).format(
        'DD MMMM YYYY'
      )}* dan akan segera diproses pengiriman ke alamat anda. Mohon untuk segera melakukan pelunasan *sisa DP 30%* sebesar *IDR ${remainingDownPaymentAmount}*. Mohon ditunggu informasi selanjutnya. Terima kasih.`;

    case 'BARANG KOMPLIT ITEM & SUDAH CLEAR DP':
      return `Customer *${name}* yth, kami menginformasikan bahwa barang no *${salesOrder}* dengan item *${item}* tiba di Gudang Jakarta pada tanggal  *${moment(
        estimatedDate
      ).format(
        'DD MMMM YYYY'
      )}* dan sudah dikirimkan dengan nomor resi *${resi}* .Jangan lupa Untuk membuat video unboxing jika barang telah sampai untuk menghindari kesalahan dalam pengiriman. Ditunggu orderan selanjutnya, Terima kasih.`;

    case 'DELAY - RANDOM CHECK CHINA':
      return `Customer *${name}* yth, kami menginformasikan bahwa barang no *${salesOrder}* dengan item *${item}* akan mengalami kemunduran estimasi tiba di Indonesia dikarenakan adanya *Random Check* di Custom China maka dari itu untuk estimasi selanjutnya akan kami informasikan kembali. Kami segenap perusahaan memohon maaf sebesar besarnya atas kemunduran estimasi tersebut. Mohon ditunggu. Terima kasih.`;

    default:
      break;
  }
};

// whatsapp web client
client.on('qr', async (qr) => {
  console.log('qr', qr);
  // await fs.writeFileSync('./src/last.qr', qr);
  const foundQr = await QR.findOne({ name: 'qr' });
  if (!foundQr) {
    QR.create({ qr, name: 'qr' });
  }
  Object.assign(foundQr, { qr, name: 'qr' });
  await foundQr.save();
  return foundQr;
});

client.on('authenticated', () => {
  console.log('AUTH!');
  authed = true;

  try {
    fs.unlinkSync('./src/last.qr');
  } catch (err) {}
});

client.on('auth_failure', () => {
  console.log('AUTH Failed !');
  process.exit();
});

client.on('ready', () => {
  console.log('Client is ready!');
  // Schedule tasks to be run on the server.
  cron.schedule('10,20,30,40,50 * * * * * *', async () => {
    console.log(`running a task every 5 minute=> ${new Date()}`);
    // const phone = 62881080001747;
    // const message = 'Hello, this is a test message from the cron job';
    // console.log(`cron job to phone: ${phone} & message: ${message}`);
    const comparatorTimestamp = parseInt(moment().format('x'), 10);
    const foundTrackingData = await TrackingData.find({
      sendMessageTimestamp: { $lte: comparatorTimestamp },
      sendMessageStatus: false,
    });
    console.log('foundTrackingData', foundTrackingData);
    if (foundTrackingData.length > 0) {
      await foundTrackingData.forEach(async (trackingData) => {
        const { phone } = trackingData;
        // const message = `Customer *${name}* yth, kami menginformasikan bahwa barang no *${salesOrder}* dengan item *${item}* sudah dikirim dengan nomor *resi china lokal ${resi}*, dengan alamat: *${address}*, adalah: *${status}* ${
        // eslint-disable-next-line no-undef
        const message = messageFormatter(trackingData);
        console.log('message', message);
        const trackingDataFoundById = await TrackingData.findById(trackingData.id);
        await client
          .sendMessage(`${phone}@c.us`, message)
          .then(async (response) => {
            console.log('response', response);
            if (response.id.fromMe) {
              console.log({ status: 'success', message: `Message successfully sent to ${phone} with message: ${message}` });
              if (trackingDataFoundById) {
                console.log('trackingDataFoundById', trackingDataFoundById);
                Object.assign(trackingDataFoundById, { ...trackingData, sendMessageStatus: true, read: false });
                await trackingDataFoundById.save();
              }
            }
          })
          .catch((err) => console.log(err));
      });
    }
  });
});

client.on('message', async (msg) => {
  // if (config.webhook.enabled) {
  //   if (msg.hasMedia) {
  //     const attachmentData = await msg.downloadMedia();
  //     // eslint-disable-next-line no-param-reassign
  //     msg.attachmentData = attachmentData;
  //   }
  //   axios.post(config.webhook.path, { msg });
  // }
});
client.on('disconnected', () => {
  console.log('disconnected');
  // if (client) client.destroy();
});

client.initialize();
// task.start();

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/v1/auth', authLimiter);
}

// v1 api routes
app.use('/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

module.exports = app;
