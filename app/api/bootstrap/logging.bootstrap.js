// logging.bootstrap.js

const log = require('../infrastructure/logger/applicationLogger.gateway');
const configService = require('../services/config.service');

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

function defaultInit() {
  log.defaultInit();
}

function init() {
  const loggerOptions = configService.getLoggerConfig();
  log.init(loggerOptions);
}

module.exports = {
  defaultInit,
  init,
};
