const mongoose = require('mongoose');
const { Client, RemoteAuth, NoAuth } = require('whatsapp-web.js');
const { MongoStore } = require('wwebjs-mongo');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');

let server;
mongoose.connect(process.env.MONGODB_URL, config.mongoose.options).then(() => {
  logger.info('Connected to MongoDB');
  // server = app.listen(config.port, () => {
  //   logger.info(`Listening to port ${config.port}`);
  // });

  const store = new MongoStore({ mongoose });
  global.client = new Client({
    // authStrategy: new NoAuth(), // to minimize sudden egress cost spike when RemoteAuth giving zliberror on server
    authStrategy: new RemoteAuth({
      store,
      backupSyncIntervalMs: 300000,
    }),
    puppeteer: {
      // for dev make it false, for production make it true
      headless: true,
      defaultViewport: null,
      // args: ['--incognito', '--no-sandbox', '--single-process', '--no-zygote'],
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--incognito', '--single-process', '--no-zygote'],
    },
  });

  client.initialize();
});

const exitHandler = () => {
  if (server) {
    // eslint-disable-next-line no-undef
    if (client) client.destroy();
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    // eslint-disable-next-line no-undef
    if (client) client.destroy();
    // eslint-disable-next-line no-undef
    // else client.destroy();
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
    // eslint-disable-next-line no-undef
    if (client) client.destroy();
    // eslint-disable-next-line no-undef
    else client.destroy();
  }
});

process.on('SIGINT', () => {
  logger.info('(SIGINT) Shutting down...');
  if (server) {
    // eslint-disable-next-line no-undef
    if (client) client.destroy();
    // eslint-disable-next-line no-undef
    else client.destroy();
    process.exit(0);
  }
  // eslint-disable-next-line no-undef
  if (client) client.destroy();
  // eslint-disable-next-line no-undef
  else client.destroy();
  process.exit(0);
});
