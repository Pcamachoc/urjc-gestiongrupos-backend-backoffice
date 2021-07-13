// config.service.js

const log = require('../infrastructure/logger/applicationLogger.gateway');
const fsConfigRepository = require('../repositories/config/filesystem.config.repository');
const cloudConfigRepository = require('../repositories/config/cloud.config.repository');
const memConfigRepository = require('../repositories/config/mem.config.repository.js');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS & PROPERTIES
// //////////////////////////////////////////////////////////////////////////////

const MODULE_NAME = '[Config Service]';

const SOURCE_YAML_FILE = 'YAML_FILE';
const SOURCE_GIT = 'GIT';

const DEFAULT_RETRY_TIME = 20000;

const ERROR_SOURCE_NOT_VALID = 'Config Source Not Valid';

// //////////////////////////////////////////////////////////////////////////////
// PRIVATE FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

async function loadConfig(options) {
  return new Promise(function executor(resolve, reject) {
    log.info(`${MODULE_NAME}:${loadConfig.name} (IN) -> params: ${JSON.stringify(options)}`);
    if (SOURCE_YAML_FILE === options.source) {
      fsConfigRepository.get(options.filename)
        .then((config) => {
          log.info(`${MODULE_NAME}:${loadConfig.name} (OUT) -> config: ${JSON.stringify(config)}`);
          resolve(config);
        })
        .catch((error) => {
          log.error(`${MODULE_NAME}:${loadConfig.name} (ERROR) -> error: ${error.message}`);
          reject(new Error(ERROR_SOURCE_NOT_VALID));
        });
    } else if (SOURCE_GIT === options.source) {
      cloudConfigRepository.get(options.springcfgendpoint, options.filename)
        .then((config) => {
          log.info(`${MODULE_NAME}:${loadConfig.name} (OUT) -> config: ${JSON.stringify(config)}`);
          resolve(config);
        })
        .catch((error) => {
          log.error(`${MODULE_NAME}:${loadConfig.name} (ERROR) -> error: ${error.message}`);
          log.info(`${MODULE_NAME}:${loadConfig.name} (MID) -> trying again....`);
          setTimeout(executor.bind(null, resolve, reject), DEFAULT_RETRY_TIME);
        });
    } else {
      reject(new Error(ERROR_SOURCE_NOT_VALID));
    }
  });
}

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

async function init(options) {
  log.debug(`${MODULE_NAME}:${init.name} (IN) -> options: ${JSON.stringify(options)}`);

  // Loading config from source
  const config = await loadConfig(options);
  // Saving config in memory repository
  memConfigRepository.set(config);
  log.debug(`${MODULE_NAME}:${init.name} (OUT) -> config saved in memory config repository`);
}

function get() {
  return memConfigRepository.get();
}

function getLoggerConfig() {
  return memConfigRepository.getLoggerConfig();
}

function getExpressConfig() {
  return memConfigRepository.getExpressConfig();
}

function getAuthConfig() {
  return memConfigRepository.getAuthConfig();
}

function getMongoConfig() {
  return memConfigRepository.getMongoConfig();
}

function getRedisConfig() {
  return memConfigRepository.getRedisConfig();
}

function getHLFConfig() {
  return memConfigRepository.getHLFConfig();
}

function getAppProperties() {
  return memConfigRepository.getAppProperties();
}

module.exports = {
  SOURCE_YAML_FILE,
  SOURCE_GIT,
  ERROR_SOURCE_NOT_VALID,
  init,
  get,
  getLoggerConfig,
  getExpressConfig,
  getAuthConfig,
  getMongoConfig,
  getRedisConfig,
  getHLFConfig,
  getAppProperties,
};
