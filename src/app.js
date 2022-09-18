/* eslint-disable no-console */
/* eslint-disable no-undef */
const express = require('express');
// const fs = require('fs');
const helmet = require('helmet');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const compression = require('compression');
const cors = require('cors');
const passport = require('passport');
const httpStatus = require('http-status');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const moment = require('moment');
const cron = require('node-cron');
const http = require('http');
const socketIo = require('socket.io');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const { QR, TrackingData } = require('./models');
const messageFormatter = require('./utils/messageFormatter');
// const { messageFormatter } = require('./services/trackingData.service');

process.title = 'whatsapp-node-api';
global.client = new Client({
  // authStrategy: new LocalAuth(),
  puppeteer: {
    // for dev make it false, for production make it true
    headless: true,
    defaultViewport: null,
    args: ['--incognito', '--no-sandbox', '--single-process', '--no-zygote'],
    executablePath: '/usr/bin/chromium-browser',
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

// parse urlencoded request body
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, parameterLimit: 50000, limit: '50mb' }));

// parse json request body
app.use(express.json());

// sanitize request data
app.use(xss());
app.use(mongoSanitize());

// gzip compression
app.use(compression());

// enable cors
app.use(
  cors({
    origin: ['https://gloriglobal-tracker.netlify.app', 'http://localhost:3000', 'http://apps.peazy.dev'],
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

// whatsapp web client

client.on('auth_failure', () => {
  console.log('AUTH Failed !');
  process.exit();
});

const checkTrackingDataTask = cron.schedule('*/60 * * * *', async () => {
  console.log(`checking tracking data read status every 15 minutes => ${new Date()}`);
  const comparatorTimestamp = parseInt(moment().format('x'), 10);
  const foundTrackingDataForUpdateReadStatus = await TrackingData.find({
    daysToSendReminderTimestamp: { $lte: comparatorTimestamp },
    read: true,
  });

  console.log('foundTrackingDataForUpdateReadStatus', foundTrackingDataForUpdateReadStatus);
  if (foundTrackingDataForUpdateReadStatus.length > 0) {
    await foundTrackingDataForUpdateReadStatus.forEach(async (trackingData) => {
      const trackingDataFoundById = await TrackingData.findById(trackingData.id);
      if (trackingDataFoundById) {
        Object.assign(trackingDataFoundById, { ...trackingData, read: false });
        await trackingDataFoundById.save();
      }
    });
  }
});

checkTrackingDataTask.start();

client.on('change_state', (state) => {
  console.log('CHANGE STATE', state);
});

client.on('message_ack', (msg, ack) => {
  /*
      == ACK VALUES ==
      ACK_ERROR: -1
      ACK_PENDING: 0
      ACK_SERVER: 1
      ACK_DEVICE: 2
      ACK_READ: 3
      ACK_PLAYED: 4
  */

  if (ack === 3) {
    // The message was read
    console.log('Message read!');
  }
});

client.initialize();
// task.start();

// jwt authentication
app.use(passport.initialize());
passport.use('jwt', jwtStrategy);

// limit repeated failed requests to auth endpoints
if (config.env === 'production') {
  app.use('/gloriglobalsukses-backend/v1/auth', authLimiter);
}

// v1 api routes
app.use('/gloriglobalsukses-backend/v1', routes);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'Not found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

const server = http.createServer(app);

let generatedQR = '';
let interval;

const io = socketIo(server, {
  path: '/gloriglobalsukses-backend/socket.io',
  transports: ['polling'],
  cors: {
    origin: ['https://gloriglobal-tracker.netlify.app', 'http://localhost:3000', 'http://apps.peazy.dev'],
  },
});

const cronTask = cron.schedule('10,20,30,40,50 * * * * * *', async () => {
  const comparatorTimestamp = parseInt(moment().format('x'), 10);
  // socket.broadcast.emit('ClientInfo', client.info);
  // console.log('authed', authed);
  // console.log('ClientInfo', authed ? client.info : {});
  // if (authed) {
  //   io.emit('ClientInfo', client.info);
  //   console.log('ClientInfo', client.info);
  // } else {
  //   io.emit('ClientInfo', {});
  //   console.log('ClientInfo', {});
  // }
  // console.log('comparatorTimestamp', comparatorTimestamp);
  const foundTrackingDataForSendingAutomaticMessage = await TrackingData.find({
    sendMessageTimestamp: { $lte: comparatorTimestamp },
    sendMessageStatus: false,
    setSendMessageNow: false,
  });
  console.log('foundTrackingDataForSendingAutomaticMessage found', foundTrackingDataForSendingAutomaticMessage.length);
  if (foundTrackingDataForSendingAutomaticMessage.length > 0) {
    await foundTrackingDataForSendingAutomaticMessage.forEach(async (trackingData) => {
      const { phone, additionalPhoneNumbers, images } = trackingData;
      // eslint-disable-next-line no-undef
      const { message, daysToSendReminder } = messageFormatter(trackingData);
      // console.log({ message, daysToSendReminder });
      const trackingDataFoundById = await TrackingData.findById(trackingData.id);

      if (additionalPhoneNumbers.length > 0) {
      console.log('additionalPhoneNumbers', additionalPhoneNumbers)
        for (const phoneNumber of additionalPhoneNumbers) {
          console.log('phoneNumber', phoneNumber);
          await client
            .sendMessage(`${phoneNumber.phone}@c.us`, message)
            .then(async (response) => {
              if (images && images.length > 0) {
                images.forEach(async (image) => {
                  const media = await MessageMedia.fromUrl(image);
                  // eslint-disable-next-line no-undef
                  client.sendMessage(`${phoneNumber.phone}@c.us`, media).then(() => console.log('image sent'));
                });
              }
              if (response.id.fromMe) {
                console.log({
                  status: 'success',
                  message: `Message successfully sent to ${phoneNumber.phone} with message: ${message}`,
                });
                if (trackingDataFoundById) {
                  console.log('trackingDataFoundById', trackingDataFoundById);
                  Object.assign(trackingDataFoundById, { ...trackingData, sendMessageStatus: true});
                  await trackingDataFoundById.save();
                }
              }
            })
            .catch((err) => console.log(err));
        }
      }
      await client
        .sendMessage(`${phone}@c.us`, message)
        .then(async (response) => {
          if (images && images.length > 0) {
            images.forEach(async (image) => {
              const media = await MessageMedia.fromUrl(image);
              // eslint-disable-next-line no-undef
              client.sendMessage(`${phone}@c.us`, media).then(() => console.log('image sent'));
            });
          }
          if (response.id.fromMe) {
            console.log({
              status: 'success',
              message: `Message successfully sent to ${phone} with message: ${message}`,
            });
            if (trackingDataFoundById) {
              console.log('trackingDataFoundById', trackingDataFoundById);
              Object.assign(trackingDataFoundById, { ...trackingData, sendMessageStatus: true});
              await trackingDataFoundById.save();
            }
          }
        })
        .catch((err) => console.log(err));
    });
  }
});

io.on('connection', (socket) => {
  console.log('New client connected');

  const getQRAndEmit = (socket) => {
    // Emitting a new message. Will be consumed by the client
    // socket.broadcast.emit('FromAPI', { data: generatedQR, message: 'qr code' });
    if (authed) {
      io.emit('FromAPI', { authed, data: generatedQR, message: 'authenticated', clientInfo: client.info });
      // console.log('getQRAndEmit', { authed, data: generatedQR, message: 'authenticated', clientInfo: client.info });
    } else if (!authed) {
      io.emit('FromAPI', { authed, data: generatedQR, message: 'qr code', clientInfo: null });
      // console.log('getQRAndEmit', { authed, data: generatedQR, message: 'authenticated', clientInfo: null });
    }
  };

  if (interval) {
    clearInterval(interval);
  }
  interval = setInterval(() => getQRAndEmit(socket), 3000);

  socket.on('logout', async (arg) => {
    console.log('logout', arg); // world
    await io.emit('ClientInfo', {});
  });

  client.on('authenticated', async () => {
    console.log('AUTH!');
    authed = true;
    await io.emit('FromAPI', { data: '', message: 'authenticated' });
  });

  client.on('disconnected', async (reason) => {
    console.log('Client was logged out', reason);
    await io.emit('ClientInfo', {});
  });

  client.on('ready', () => {
    console.log('Client is ready!');
    // Schedule tasks to be run on the server.
    cronTask.start();
  });

  client.on('qr', async (qr) => {
    console.log('qr from WA', qr);
    generatedQR = qr;
    // await socket.broadcast.emit('FromAPI', { data: qr, message: 'qr code' });
    // await socket.broadcast.emit('ClientInfo', {});
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected');
    clearInterval(interval);
  });
  client.on('disconnected', async (reason) => {
    console.log('Client was logged out inside socket', reason);
    cronTask.stop();
    checkTrackingDataTask.stop();
    authed = false;
    try {
      if (client) await client.destroy();
      else await client.destroy();
      await client.initialize();
    } catch(e) {
      console.log('error when destroy WA Client', e);
    }
    await client.destroy();
    await client.initialize();
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server up and running on port ${process.env.PORT || 4000}`);
});

module.exports = app;
