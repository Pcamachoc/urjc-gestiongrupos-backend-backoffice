// mongoose.bootstrap.js

const log = require('../infrastructure/logger/applicationLogger.gateway');
const configService = require('../services/config.service');
const mongooseInfra = require('../infrastructure/mongoose.infra');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS
// //////////////////////////////////////////////////////////////////////////////

// Module name
const MODULE_NAME = '[Mongoose Bootstrap]';

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC METHODS
// //////////////////////////////////////////////////////////////////////////////

async function init() {
  log.info(`${MODULE_NAME} ${init.name} (IN) --> no params`);

  const mongoOptions = configService.getMongoConfig();
  log.info(`${MODULE_NAME} ${init.name} (MID) --> mongoOptions: ${JSON.stringify(mongoOptions)}`);

  await mongooseInfra.init(mongoOptions);

  log.info(`${MODULE_NAME} ${init.name} (OUT) --> Finished OK`);
}

module.exports = {
  init,
};
