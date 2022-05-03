const mongoose = require('mongoose');
const app = require('./app');
const config = require('./config/config');
const logger = require('./config/logger');

let server;
mongoose.connect(config.mongoose.url, config.mongoose.options).then(() => {
  logger.info('Connected to MongoDB');
  server = app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
  });
});

const exitHandler = () => {
  if (server) {
    // eslint-disable-next-line no-undef
    // if (client) client.destroy();
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
  // eslint-disable-next-line no-undef
  if (client) client.destroy();
  // eslint-disable-next-line no-undef
  else client.destroy();
  process.exit(0);
});
