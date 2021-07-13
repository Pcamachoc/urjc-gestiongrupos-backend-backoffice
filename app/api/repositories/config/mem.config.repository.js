// mem.config.repository.js

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS & PROPERTIES
// //////////////////////////////////////////////////////////////////////////////

let data;

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

function get() {
  return data;
}

function set(config) {
  data = config;
}

function getLoggerConfig() {
  return data.infrastructure.logger;
}

function getExpressConfig() {
  return data.infrastructure.express;
}

function getAuthConfig() {
  return data.infrastructure.authentication;
}

function getAuthUsers() {
  return data.infrastructure.authentication.users;
}

function getMongoConfig() {
  return data.infrastructure.mongo;
}

function getRedisConfig() {
  return data.infrastructure.redis;
}

function getHLFConfig() {
  return data.infrastructure.middlewarehlf;
}

function getBCryptSaltRounds() {
  return data.infrastructure.authentication.bcryptSaltRounds;
}

function getAppProperties() {
  return data.appProperties;
}

module.exports = {
  get,
  set,
  getLoggerConfig,
  getExpressConfig,
  getAuthConfig,
  getAuthUsers,
  getMongoConfig,
  getRedisConfig,
  getHLFConfig,
  getBCryptSaltRounds,
  getAppProperties,
};
