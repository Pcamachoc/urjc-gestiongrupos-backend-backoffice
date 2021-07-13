// mongoose.infra.js

const mongoose = require('mongoose');

const log = require('../infrastructure/logger/applicationLogger.gateway');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS
// //////////////////////////////////////////////////////////////////////////////

const MODULE_NAME = '[Mongoose Infra]';
const disconnectTimeOut = 20;

// //////////////////////////////////////////////////////////////////////////////
// PROPERTIES
// //////////////////////////////////////////////////////////////////////////////

let options;
let connected = false;

// //////////////////////////////////////////////////////////////////////////////
// PRIVATE FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

function buildDBURI() {
  return `${options.mongoURL}/${options.database}`;
}

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

function isConnected() {
  return connected;
}

async function connect() {
  try {
    log.debug(`${MODULE_NAME} ${connect.name} (IN) -> Entering...`);

    if (!connected) {
      const dbURI = buildDBURI();
      log.debug(`${MODULE_NAME} ${connect.name} (MID) -> Trying to connect to mongodb using dbURI: ${dbURI}`);

      await mongoose.connect(dbURI, { useNewUrlParser: true });

      log.debug(`${MODULE_NAME} ${connect.name} (OUT) --> Executed, returning true`);
      return true;
    }

    log.debug(`${MODULE_NAME} ${connect.name} (OUT) -> Existing connection to mongodb, returning true`);
    return (true);
  } catch (error) {
    log.error(`${MODULE_NAME} ${connect.name} (ERROR) -> Error: ${error.message}`);
    throw (error);
  }
}

async function disconnect() {
  try {
    log.debug(`${MODULE_NAME} ${disconnect.name} (IN) -> Entering in disconnect`);
    if (isConnected()) {
      mongoose.connection.close();

      setTimeout(() => {
        log.debug(`${MODULE_NAME} ${disconnect.name} (OUT) -> Executed, returning false`);
        return true;
      }, disconnectTimeOut);
    }
    log.debug(`${MODULE_NAME} ${disconnect.name} (OUT) --> Connection not was established, returning false`);
    return true;
  } catch (error) {
    log.error(`${MODULE_NAME} ${disconnect.name} (ERROR) -> Error: ${error.message}`);
    throw (error);
  }
}

async function init(mongoOptions) {
  options = mongoOptions;
  const result = await connect();
  return result;
}

function delayedConnection(time) {
  return new Promise((resolve) => {
    log.debug(`${MODULE_NAME} ${delayedConnection.name} (IN) -> time: ${time}`);
    setTimeout(() => {
      connect()
        .then(() => {
          resolve(true);
        });
    }, time);
  });
}

function tryToReconnectIfNeccesary() {
  log.debug(`${MODULE_NAME} ${tryToReconnectIfNeccesary.name} (IN) -> Entering...`);
  if (options.reconnectTime > 0) {
    log.debug(`${MODULE_NAME} ${tryToReconnectIfNeccesary.name} (OUT) -> Launching delayedConnection`);
    return delayedConnection(options.reconnectTime);
  }

  log.debug(`${MODULE_NAME} ${tryToReconnectIfNeccesary.name} (OUT) -> delayedConnection NOT launched`);

  return false;
}

// //////////////////////////////////////////////////////////////////////////////
// CONNECTION EVENTS
// //////////////////////////////////////////////////////////////////////////////

// When successfully connected
mongoose.connection.on('connected', () => {
  log.debug(`${MODULE_NAME} (Event on connected) -> Connection Open!`);
  connected = true;
});

// Event launched when the connection throws an error
mongoose.connection.on('error', (err) => {
  log.error(`${MODULE_NAME} (Event on error) -> Mongoose default connection error: ${err}`);
  connected = false;

  return tryToReconnectIfNeccesary();
});

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
  log.info(`${MODULE_NAME} (Event on disconnected) -> Mongoose default connection disconnected`);

  // Only try to reconnect if the connected is true. Doubt to when the connection is disconnected,
  // the event disconnected and error are launched. We only want to try the reconnect one time.
  if (connected) {
    connected = false;
    log.info(`${MODULE_NAME} (Event on disconnected) (MID) -> Going to tryToReconnectIfNeccesary`);
    return tryToReconnectIfNeccesary();
  }

  return false;
});

// If the Node process ends, close the Mongoose connection
process.on('SIGINT', () => {
  log.info(`${MODULE_NAME} (Event on process.SIGINT) -> Exiting from process`);
  disconnect()
    .then(() => {
      log.info(`${MODULE_NAME} (Event on process.SIGINT) --> Mongoose default connection disconnected through app termination`);
      process.exit(0);
    });
});

module.exports = {
  init,
  connect,
  disconnect,
  isConnected,
};
