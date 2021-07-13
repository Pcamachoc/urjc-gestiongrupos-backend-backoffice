// middlewarehlf.user.repository.js

const rp = require('request-promise');

const log = require('../../infrastructure/logger/applicationLogger.gateway');
const configRepository = require('../config/mem.config.repository');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS & PROPERTIES
// //////////////////////////////////////////////////////////////////////////////

const MODULE_NAME = '[MiddlewareHLF User Repository]';

const ERROR_USER_NOT_AUTHENTICATED = 'User not authenticated';

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC METHODS
// //////////////////////////////////////////////////////////////////////////////

async function authenticateUser(authCredentials) {
  log.info(`${MODULE_NAME}:${authenticateUser.name} (IN) -> authCredentials: ${JSON.stringify(authCredentials)}`);

  const middlewareHLFEndPoint = configRepository.getHLFConfig().url;
  log.info(`${MODULE_NAME}:${authenticateUser.name} (MID) -> middlewareHLFEndPoint: ${middlewareHLFEndPoint}`);

  const options = {
    method: 'POST',
    uri: `${middlewareHLFEndPoint}/api/authenticate`,
    headers: {
      passwd: authCredentials.passwd,
      username: authCredentials.username,
    },
    json: true,
  };

  let innerResult;
  try {
    innerResult = await rp(options);
    log.info(`${MODULE_NAME}:${authenticateUser.name} (MID) -> innerResult: ${JSON.stringify(innerResult)}`);
    const tokenResult = innerResult.token;

    log.info(`${MODULE_NAME}:${authenticateUser.name} (OUT) -> tokenResult: ${JSON.stringify(tokenResult)}`);
    return tokenResult;
  } catch (error) {
    log.error(`${MODULE_NAME}:${authenticateUser.name} (ERROR) -> error.message: ${error.message}`);
    throw new Error(ERROR_USER_NOT_AUTHENTICATED);
  }
}

module.exports = {
  authenticateUser,
  ERROR_USER_NOT_AUTHENTICATED,
};
