// swaggerExpress.bootstrap.js

const log = require('../infrastructure/logger/applicationLogger.gateway');
const configService = require('../services/config.service');
const swaggerExpressInfra = require('../infrastructure/swaggerExpress.infra');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS
// //////////////////////////////////////////////////////////////////////////////

const MODULE_NAME = '[SwaggerExpress Bootstrap]';

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

async function init(appRoot, envPort) {
  log.info(`${MODULE_NAME} ${init.name} (IN) --> appRoot: ${appRoot}`);

  const expressOptions = configService.getExpressConfig();
  expressOptions.appRoot = appRoot;

  // Change port from environment properties
  if (envPort) {
    expressOptions.port = envPort;
  }

  await swaggerExpressInfra.start(expressOptions);

  log.info(`${MODULE_NAME} ${init.name} (OUT) --> OK`);
}

module.exports = {
  init,
};
