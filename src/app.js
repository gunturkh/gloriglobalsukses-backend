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
const cron = require('node-cron');
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');
const { QR } = require('./models');

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
  cron.schedule('0,15,30,45 * * * * *', function () {
    console.log(`running a task every 15 seconds => ${new Date()}`);
    const phone = 62881080001747;
    const message = 'Hello, this is a test message from the cron job';
    console.log(`cron job to phone: ${phone} & message: ${message}`);
    // eslint-disable-next-line no-undef
    client
      .sendMessage(`${phone}@c.us`, message)
      .then((response) => {
        if (response.id.fromMe) {
          console.log({ status: 'success', message: `Message successfully sent to ${phone}` });
        }
      })
      .catch((err) => console.log(err));
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
