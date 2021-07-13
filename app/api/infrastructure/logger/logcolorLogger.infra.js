// logcolorLogger.Infra.js

const Log = require('log-color');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS & PROPERTIES
// //////////////////////////////////////////////////////////////////////////////

let logger;

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC METHODS
// //////////////////////////////////////////////////////////////////////////////

function defaultInit() {
  logger = new Log({ level: 'debug', color: true });
}

function init(options) {
  logger = new Log({ level: options.level, color: true });
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
  init,
  defaultInit,
  debug,
  info,
  error,
};
