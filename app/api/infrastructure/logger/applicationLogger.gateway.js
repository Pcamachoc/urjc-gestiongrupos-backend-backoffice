// applicationLogger.gateway.js

// const logger = require('./consoleLogger.infra');
const logger = require('./logcolorLogger.infra');

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

function defaultInit() {
  logger.defaultInit();
}

function init(options) {
  logger.init(options);
}

function debug(message) {
  logger.debug(message);
}

function info(message) {
  logger.info(message);
}

function error(message) {
  logger.error(message);
}

module.exports = {
  defaultInit,
  init,
  debug,
  info,
  error,
};
