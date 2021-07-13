// genericDB.user.helper.js

const bcrypt = require('bcrypt');
const log = require('../../../infrastructure/logger/applicationLogger.gateway');
const jwtInfra = require('../../../infrastructure/jwt.infra');

// //////////////////////////////////////////////////////////////////////////////
// CONSTANTS
// //////////////////////////////////////////////////////////////////////////////

const MODULE_NAME = '[Generic DB User helper]';

const ERROR_USER_NOT_AUTHENTICATED = 'User not authenticated';

// //////////////////////////////////////////////////////////////////////////////
// PUBLIC METHODS
// //////////////////////////////////////////////////////////////////////////////

async function authenticateUser(authCredentials, getUserByFilterWithSecurityInfo, authConfig) {
  log.info(`${MODULE_NAME}:${authenticateUser.name} (IN) -> authCredentials: ${JSON.stringify(authCredentials)}, 
  getUserByFilterWithSecurityInfo: <<func>>, authConfig: ${JSON.stringify(authConfig)}`);

  // Find user. Function implementation relies on the repository implementation (mem, mongo...)
  const userFound = await getUserByFilterWithSecurityInfo({ username: authCredentials.username });

  // Check if user was found
  if (!userFound) {
    log.error(`${MODULE_NAME}:${authenticateUser.name} (MID) -> User not found!`);
    throw new Error(ERROR_USER_NOT_AUTHENTICATED);
  }

  // Check if password is correct
  const passwordIsOK = await bcrypt.compare(authCredentials.passwd, userFound.password);
  if (!passwordIsOK) {
    log.error(`${MODULE_NAME}:${authenticateUser.name} (MID) -> Wrong password`);
    throw new Error(ERROR_USER_NOT_AUTHENTICATED);
  }

  // Check if user is enabled
  if (!userFound.enabled) {
    log.error(`${MODULE_NAME}:${authenticateUser.name} (MID) -> User is disabled`);
    throw new Error(ERROR_USER_NOT_AUTHENTICATED);
  }

  // Check if user must be member of a group
  if (authConfig.groupsToAuthenticate != null && authConfig.groupsToAuthenticate.length > 0) {
    const groupCheckResult = authConfig.groupsToAuthenticate.some(groupToAuth => userFound.richGroups.find(x => x.name === groupToAuth.name));
    log.debug(`${MODULE_NAME}:${authenticateUser.name} (MID) -> User member of group needed to authenticate: ${groupCheckResult}`);
    if (!groupCheckResult) {
      log.error(`${MODULE_NAME}:${authenticateUser.name} (MID) -> User must be member of these groups: ${JSON.stringify(authConfig.groupsToAuthenticate)}`);
      throw new Error(ERROR_USER_NOT_AUTHENTICATED);
    }
  }

  const tokenResult = jwtInfra.generateToken(userFound);

  log.debug(`${MODULE_NAME}:${authenticateUser.name} (OUT) -> authToken: <<authToken>>`);
  return tokenResult;
}

module.exports = {
  authenticateUser,
};
