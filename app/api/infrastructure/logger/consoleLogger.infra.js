// consoleLogger.infra.js

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC METHODS
// //////////////////////////////////////////////////////////////////////////////

function defaultInit() {
  // Nothing to do
}

function init() {
  // Nothing to do
}

function debug(message) {
  console.debug(message); // eslint-disable-line no-console
}

function info(message) {
  console.info(message); // eslint-disable-line no-console
}

function error(message) {
  console.error(message); // eslint-disable-line no-console
}

module.exports = {
  init,
  defaultInit,
  debug,
  info,
  error,
};
