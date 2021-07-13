// jwt.bootstrap.js

const log = require('../infrastructure/logger/applicationLogger.gateway');
const configService = require('../services/config.service');
const authService = require('../services/auth.service');
const jwtInfra = require('../infrastructure/jwt.infra');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS & PROPERTIES
// //////////////////////////////////////////////////////////////////////////////

const MODULE_NAME = 'JWT Bootstrap';

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC FUNCTIONS
// //////////////////////////////////////////////////////////////////////////////

function init() {
  log.info(`${MODULE_NAME} ${init.name} (IN) --> no params`);

  const authOptions = configService.getAuthConfig();
  log.info(`${MODULE_NAME} ${init.name} (MID) --> authOptions: ${JSON.stringify(authOptions)}`);

  jwtInfra.init(authOptions);

  log.info(`${MODULE_NAME} ${init.name} (OUT) --> Returning authService`);
  return authService;
}

module.exports = {
  init,
};
