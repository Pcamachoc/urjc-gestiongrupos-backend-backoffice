// config.bootstrap.js

const log = require('../infrastructure/logger/applicationLogger.gateway');
const configService = require('../services/config.service');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS
// //////////////////////////////////////////////////////////////////////////////

const MODULE_NAME = '[Config Bootstrap]';

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

async function init(options) {
  log.info(`${MODULE_NAME}:${init.name} (IN) --> options: ${JSON.stringify(options)}`);

  await configService.init(options);

  log.info(`${MODULE_NAME}:${init.name} (OUT) --> Finished OK`);
}

module.exports = {
  init,
};
