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
const config = require('./config/config');
const morgan = require('./config/morgan');
const { jwtStrategy } = require('./config/passport');
const { authLimiter } = require('./middlewares/rateLimiter');
const routes = require('./routes/v1');
const { errorConverter, errorHandler } = require('./middlewares/error');
const ApiError = require('./utils/ApiError');

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
app.use(cors());
app.options('*', cors());

// whatsapp web client
client.on('qr', async (qr) => {
  console.log('qr', qr);
  await fs.writeFileSync('./src/last.qr', qr);
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
